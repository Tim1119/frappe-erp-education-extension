import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ClipboardCheck, CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import {
  getAssessmentPlans,
  getAssessmentPlanDetails,
  getAssessmentPlanCriteria,
  getAssessmentStudents,
  getGradingScaleIntervals,
  markAssessmentResult,
  submitAssessmentResults,
} from "@/services/assessmentResultToolService";
import { getErrorMessage } from "@/utils/errors";
import { computeGrade } from "@/utils/grading";

// Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1). Real
// architecture is genuinely different from Subject Scheduling Tool and
// Student Attendance Tool: there is no single bulk-save button here.
// education.education.api.mark_assessment_result() saves ONE student's
// result the instant every one of their criteria scores is filled in --
// each such save is its own independent request, reusing Assessment
// Result's own real validate() via a plain .save() (score-in-bounds,
// duplicate handling, grade computation all come from there, not
// reimplemented). A separate, manual submit_assessment_results() call
// then bulk-submits whichever drafts exist for the whole Class Arm --
// THAT part is atomic (Frappe's own request-level rollback), but each
// individual student's auto-save is independent of every other
// student's.
//
// Real edge case in the underlying app: entering scores for a student
// whose result is already SUBMITTED crashes server-side
// (get_assessment_result_doc() returns None, then None.update() raises)
// rather than a clean error -- avoided here entirely by locking score
// entry for any student already loaded with docstatus == 1.
export default function AssessmentResultToolPage() {
  const navigate = useNavigate();

  const [assessmentPlan, setAssessmentPlan] = useState(""); // real fieldname: assessment_plan
  const [assessmentPlanOptions, setAssessmentPlanOptions] = useState([]);
  const [planDetails, setPlanDetails] = useState({ student_group: "", grading_scale: "", maximum_assessment_score: "", course: "" });
  const [criteria, setCriteria] = useState([]);
  const [intervals, setIntervals] = useState([]);

  const [roster, setRoster] = useState([]);
  const [scores, setScores] = useState({}); // { [student]: { [criteria]: value } }
  const [savedInfo, setSavedInfo] = useState({}); // { [student]: { name, total_score, grade, details } }
  const [savingStudent, setSavingStudent] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAssessmentPlans().then((r) => setAssessmentPlanOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!assessmentPlan) {
      setPlanDetails({ student_group: "", grading_scale: "", maximum_assessment_score: "", course: "" });
      setCriteria([]);
      setRoster([]);
      setScores({});
      setSavedInfo({});
      return;
    }
    getAssessmentPlanDetails(assessmentPlan)
      .then((d) => setPlanDetails(d || { student_group: "", grading_scale: "", maximum_assessment_score: "", course: "" }))
      .catch((err) => toast.error(getErrorMessage(err)));
    getAssessmentPlanCriteria(assessmentPlan)
      .then((r) => setCriteria(r || []))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [assessmentPlan]);

  useEffect(() => {
    if (!planDetails.grading_scale) {
      setIntervals([]);
      return;
    }
    getGradingScaleIntervals(planDetails.grading_scale).then((r) => setIntervals(r || [])).catch(() => {});
  }, [planDetails.grading_scale]);

  async function loadRoster() {
    if (!assessmentPlan || !planDetails.student_group) {
      setRoster([]);
      return;
    }
    try {
      setLoadingRoster(true);
      const r = await getAssessmentStudents(assessmentPlan, planDetails.student_group);
      const list = r || [];
      setRoster(list);
      const initialScores = {};
      const initialSaved = {};
      for (const s of list) {
        if (s.assessment_details) {
          const rowScores = {};
          const rowDetails = {};
          for (const [key, value] of Object.entries(s.assessment_details)) {
            // assessment_details also carries "total_score": [score, grade]
            // and "comment": "<string>" alongside the real per-criteria
            // [score, grade] pairs -- only the latter belong in the grid.
            if (key === "total_score" || key === "comment") continue;
            rowScores[key] = value[0];
            rowDetails[key] = value[1];
          }
          initialScores[s.student] = rowScores;
          initialSaved[s.student] = {
            name: s.name,
            total_score: s.assessment_details.total_score?.[0],
            grade: s.assessment_details.total_score?.[1],
            details: rowDetails,
          };
        }
      }
      setScores(initialScores);
      setSavedInfo(initialSaved);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingRoster(false);
    }
  }

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentPlan, planDetails.student_group]);

  function maxScoreFor(criteriaName) {
    return criteria.find((c) => c.assessment_criteria === criteriaName)?.maximum_score || 0;
  }

  function isLocked(student) {
    return roster.find((s) => s.student === student)?.docstatus === 1;
  }

  async function updateScore(student, criteriaName, rawValue) {
    if (isLocked(student)) return;
    const max = maxScoreFor(criteriaName);
    let value = rawValue;
    if (value !== "") {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) {
        if (num < 0) value = "0";
        else if (num > max) value = String(max);
      }
    }

    const rowScores = { ...(scores[student] || {}), [criteriaName]: value };
    setScores((p) => ({ ...p, [student]: rowScores }));

    const complete = criteria.every((c) => {
      const v = rowScores[c.assessment_criteria];
      return v !== undefined && v !== "" && !Number.isNaN(parseFloat(v));
    });
    if (!complete) return;

    const student_name = roster.find((s) => s.student === student)?.student_name || "";
    const totalScore = criteria.reduce((sum, c) => sum + (parseFloat(rowScores[c.assessment_criteria]) || 0), 0);

    setSavingStudent(student);
    try {
      const details = {};
      criteria.forEach((c) => { details[c.assessment_criteria] = rowScores[c.assessment_criteria]; });
      const result = await markAssessmentResult(assessmentPlan, {
        student,
        student_name,
        total_score: totalScore,
        assessment_details: details,
      });
      setSavedInfo((p) => ({
        ...p,
        [student]: {
          name: result.name,
          total_score: result.total_score,
          grade: result.grade,
          details: result.details || {},
        },
      }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingStudent(null);
    }
  }

  const showSubmit = roster.some((s) => s.docstatus === 0 || savedInfo[s.student]);

  async function handleSubmitAll() {
    setSubmitting(true);
    try {
      const count = await submitAssessmentResults(assessmentPlan, planDetails.student_group);
      if (count) {
        toast.success(`${count} result${count === 1 ? "" : "s"} submitted.`);
      } else {
        toast.error("No results to submit.");
      }
      loadRoster();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const maxTotal = criteria.reduce((sum, c) => sum + (c.maximum_score || 0), 0);

  return (
    <>
      <PageHeader title="Assessment Result Tool" />

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Assessment Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Assessment Plan <span className="text-destructive">*</span></Label>
              <SearchableSelect
                value={assessmentPlan}
                onChange={setAssessmentPlan}
                options={assessmentPlanOptions}
                displayField="assessment_name"
                placeholder="Search assessment plan..."
                label="assessment plan"
                showId
              />
            </div>
            <div className="space-y-2">
              <Label>Class Arm</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {planDetails.student_group || "— select an assessment plan —"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximum Assessment Score</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {planDetails.maximum_assessment_score || "— select an assessment plan —"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {assessmentPlan && planDetails.student_group && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                Results
              </CardTitle>
              {showSubmit && (
                <Button type="button" size="sm" disabled={submitting} onClick={handleSubmitAll}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Draft Results
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingRoster ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : roster.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No students in {planDetails.student_group}.
              </p>
            ) : criteria.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                This Assessment Plan has no assessment criteria.
              </p>
            ) : (
              <div className="w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      {criteria.map((c) => (
                        <TableHead key={c.assessment_criteria} className="text-center">
                          {c.assessment_criteria}
                          <div className="text-xs font-normal text-muted-foreground">/ {c.maximum_score}</div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((s) => {
                      const locked = s.docstatus === 1;
                      const rowScores = scores[s.student] || {};
                      const saved = savedInfo[s.student];
                      const liveTotal = criteria.reduce((sum, c) => sum + (parseFloat(rowScores[c.assessment_criteria]) || 0), 0);
                      const liveGrade = maxTotal ? computeGrade(intervals, (liveTotal / maxTotal) * 100) : "";
                      return (
                        <TableRow key={s.student}>
                          <TableCell className="font-medium">
                            {s.group_roll_number ? `${s.group_roll_number} - ` : ""}{s.student_name}
                          </TableCell>
                          {criteria.map((c) => {
                            const value = rowScores[c.assessment_criteria] ?? "";
                            const cellGrade = saved?.details?.[c.assessment_criteria]
                              || (value !== "" ? computeGrade(intervals, (parseFloat(value) / (c.maximum_score || 1)) * 100) : "");
                            return (
                              <TableCell key={c.assessment_criteria} className="text-center">
                                <Input
                                  type="number"
                                  className="mx-auto w-20 text-center"
                                  value={value}
                                  disabled={locked}
                                  onChange={(e) => updateScore(s.student, c.assessment_criteria, e.target.value)}
                                />
                                <div className="mt-1 text-xs text-muted-foreground">{cellGrade || "—"}</div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-medium">
                            {saved?.total_score ?? (liveTotal || "—")}
                          </TableCell>
                          <TableCell className="text-center">{saved?.grade || liveGrade || "—"}</TableCell>
                          <TableCell className="text-center">
                            {locked ? (
                              <Badge variant="secondary" className="gap-1">
                                <Lock className="h-3 w-3" /> Submitted
                              </Badge>
                            ) : savingStudent === s.student ? (
                              <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                            ) : saved ? (
                              <button
                                onClick={() => navigate(`/dashboard/assessment-result/${encodeURIComponent(saved.name)}`)}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Each student's result is saved automatically as a draft once every criteria score for that student is
              filled in. Submitted students are locked and can't be re-marked here. Use "Submit Draft Results" once
              you're ready to finalize the whole Class Arm.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getSubmittedAssessmentPlans,
  getStudentsForClassArm,
  getAssessmentPlanDetails,
  getAssessmentCriteriaForPlan,
  getGradingScaleIntervals,
} from "@/services/assessmentResultService";
import { getErrorMessage } from "@/utils/errors";
import { computeGrade } from "@/utils/grading";

const EMPTY_DERIVED = {
  program: "", course: "", academic_year: "", academic_term: "",
  student_group: "", assessment_group: "", grading_scale: "",
  maximum_assessment_score: "",
};

const EMPTY = {
  assessment_plan: "",
  student: "",
  comment: "",
  details: [],
};

function buildForm(result) {
  if (!result) return EMPTY;
  return {
    assessment_plan: result.assessment_plan || "",
    student: result.student || "",
    comment: result.comment || "",
    details: (result.details || []).map((d) => ({
      assessment_criteria: d.assessment_criteria || "",
      maximum_score: d.maximum_score ?? "",
      score: d.score ?? "",
    })),
  };
}

export default function AssessmentResultForm({ result, onSave }) {
  const [form, setForm] = useState(() => buildForm(result));
  // program/course/academic_year/academic_term/student_group/
  // assessment_group/grading_scale/maximum_assessment_score are never sent
  // by this form -- all of them fetch_from assessment_plan.* with no
  // fetch_if_empty, so Frappe unconditionally re-derives them on save.
  const [derived, setDerived] = useState(EMPTY_DERIVED);
  const [intervals, setIntervals] = useState([]);
  const [saving, setSaving] = useState(false);

  const [assessmentPlanOptions, setAssessmentPlanOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  // True right after loading an existing record, so the assessment_plan
  // effect below doesn't wipe already-entered scores the moment the form
  // mounts for editing -- only a real, user-driven plan change should
  // reset/repopulate the details table (matching Desk's own
  // cannot_add_rows grid, which only ever repopulates via this trigger).
  const skipAutoPopulateRef = useRef(Boolean(result));

  useEffect(() => {
    setForm(buildForm(result));
    skipAutoPopulateRef.current = Boolean(result);
  }, [result]);

  useEffect(() => {
    getSubmittedAssessmentPlans().then((r) => setAssessmentPlanOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.assessment_plan) {
      setDerived(EMPTY_DERIVED);
      setStudentOptions([]);
      return;
    }
    getAssessmentPlanDetails(form.assessment_plan)
      .then((d) => {
        if (!d) return;
        setDerived({
          program: d.program || "",
          course: d.course || "",
          academic_year: d.academic_year || "",
          academic_term: d.academic_term || "",
          student_group: d.student_group || "",
          assessment_group: d.assessment_group || "",
          grading_scale: d.grading_scale || "",
          maximum_assessment_score: d.maximum_assessment_score ?? "",
        });
        // Student picker must only offer the Class Arm's real roster --
        // the server-side safety net (validate_student_belongs_to_group)
        // stays as-is; this just keeps the user from hitting it.
        if (d.student_group) {
          getStudentsForClassArm(d.student_group)
            .then((r) => setStudentOptions(r || []))
            .catch((err) => toast.error(getErrorMessage(err)));
        } else {
          setStudentOptions([]);
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)));

    if (skipAutoPopulateRef.current) {
      skipAutoPopulateRef.current = false;
      return;
    }
    getAssessmentCriteriaForPlan(form.assessment_plan)
      .then((rows) => {
        setForm((p) => ({
          ...p,
          details: (rows || []).map((r) => ({ ...r, score: "" })),
        }));
      })
      .catch((err) => toast.error(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.assessment_plan]);

  useEffect(() => {
    if (!derived.grading_scale) {
      setIntervals([]);
      return;
    }
    getGradingScaleIntervals(derived.grading_scale).then((r) => setIntervals(r || [])).catch(() => {});
  }, [derived.grading_scale]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function updateScore(index, value) {
    const rows = [...form.details];
    rows[index] = { ...rows[index], score: value };
    setForm((p) => ({ ...p, details: rows }));
  }

  const rowsWithGrade = form.details.map((row) => {
    const score = parseFloat(row.score);
    const max = parseFloat(row.maximum_score) || 0;
    const hasScore = row.score !== "" && !Number.isNaN(score);
    const grade = hasScore && max ? computeGrade(intervals, (score / max) * 100) : "";
    const overScore = hasScore && max && score > max;
    return { ...row, previewGrade: grade, overScore };
  });

  const totalScore = rowsWithGrade.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
  const overallMax = parseFloat(derived.maximum_assessment_score) || 0;
  const overallGrade = overallMax ? computeGrade(intervals, (totalScore / overallMax) * 100) : "";
  const anyOverScore = rowsWithGrade.some((r) => r.overScore);

  async function handleSubmit(e) {
    e.preventDefault();
    // TEMPORARY -- remove once the roster field-shape bug is confirmed fixed.
    console.log("[AssessmentResultForm] form at submit:", form);
    if (!form.assessment_plan || !form.student || form.details.length === 0) {
      toast.error("Please select an Assessment Plan and Student, and enter at least one score.");
      return;
    }
    if (anyOverScore) {
      toast.error("A score cannot be greater than its Maximum Score.");
      return;
    }
    setSaving(true);
    try {
      // Number inputs report values as strings -- cast before sending.
      await onSave({
        ...form,
        details: form.details.map((row) => ({ ...row, score: Number(row.score) || 0 })),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assessment Result Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Assessment Plan <span className="text-destructive">*</span></Label>
              <SearchableSelect
                value={form.assessment_plan}
                onChange={(v) => upd("assessment_plan", v)}
                options={assessmentPlanOptions}
                displayField="assessment_name"
                placeholder="Search assessment plan..."
                label="assessment plan"
                showId
              />
              <p className="text-xs text-muted-foreground">Only submitted assessment plans are shown.</p>
            </div>

            <div className="space-y-2">
              <Label>Student <span className="text-destructive">*</span></Label>
              <SearchableSelect
                value={form.student}
                onChange={(v) => upd("student", v)}
                options={studentOptions}
                displayField="student_name"
                placeholder={derived.student_group ? "Search student..." : "Select an Assessment Plan first"}
                label="student"
                disabled={!derived.student_group}
              />
              <p className="text-xs text-muted-foreground">
                Only students enrolled in this Assessment Plan's Class Arm are shown.
              </p>
            </div>

            {[
              ["Class", derived.program],
              ["Subject", derived.course],
              ["Academic Year", derived.academic_year],
              ["Academic Term", derived.academic_term],
              ["Class Arm", derived.student_group],
              ["Assessment Group", derived.assessment_group],
              ["Grading Scale", derived.grading_scale],
            ].map(([label, value]) => (
              <div className="space-y-2" key={label}>
                <Label>{label}</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {value || "— select an assessment plan —"}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Class, Subject, Academic Year, Academic Term, Class Arm, Assessment Group and Grading Scale are always taken from the selected Assessment Plan and can't be set independently.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Criteria</TableHead>
                <TableHead className="w-32">Maximum Score</TableHead>
                <TableHead className="w-32">Score</TableHead>
                <TableHead className="w-24">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsWithGrade.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.assessment_criteria}</TableCell>
                  <TableCell className="text-muted-foreground">{row.maximum_score}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.score}
                      onChange={(e) => updateScore(index, e.target.value)}
                      className={row.overScore ? "border-destructive" : ""}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.previewGrade || "—"}</TableCell>
                </TableRow>
              ))}
              {rowsWithGrade.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Select an Assessment Plan to load its assessment criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">
            Rows come from the selected Assessment Plan's own criteria and can't be added or removed here.
          </p>

          {rowsWithGrade.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-md border bg-muted px-3 py-2 text-sm">
              <span className="font-medium">
                Total Score: {totalScore} {overallMax ? `/ ${overallMax}` : ""}
              </span>
              <span className="font-medium">Grade: {overallGrade || "—"}</span>
            </div>
          )}
          {anyOverScore && (
            <p className="mt-2 text-xs text-destructive">
              A score cannot be greater than its Maximum Score.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="input min-h-20 w-full"
            value={form.comment}
            onChange={(e) => upd("comment", e.target.value)}
            placeholder="Optional comment"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {result ? "Update Assessment Result" : "Create Assessment Result"}
        </Button>
      </div>
    </form>
  );
}

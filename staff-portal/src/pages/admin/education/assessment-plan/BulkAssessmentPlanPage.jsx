import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAssessmentPlan,
  getCoursesForProgram,
  getCriteriaTemplate,
  getCourseDefaultGradingScale,
  getLeafAssessmentGroups,
  getStudentGroupDetails,
  getStudentGroups,
  getSubmittedGradingScales,
} from "@/services/education/assessmentPlanService";
import { getErrorMessage } from "@/utils/errors";

const today = () => new Date().toISOString().slice(0, 10);

export default function BulkAssessmentPlanPage() {
  const navigate = useNavigate();
  const [studentGroup, setStudentGroup] = useState("");
  const [assessmentGroup, setAssessmentGroup] = useState("");
  const [namePrefix, setNamePrefix] = useState("");
  const [derived, setDerived] = useState({});
  const [groups, setGroups] = useState([]);
  const [assessmentGroups, setAssessmentGroups] = useState([]);
  const [gradingScales, setGradingScales] = useState([]);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getStudentGroups(),
      getLeafAssessmentGroups(),
      getSubmittedGradingScales(),
    ]).then(([classArms, groupsResult, scales]) => {
      setGroups(classArms || []);
      setAssessmentGroups(groupsResult || []);
      setGradingScales(scales || []);
    }).catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!studentGroup) {
      setDerived({});
      setRows([]);
      return;
    }

    getStudentGroupDetails(studentGroup).then(async (details) => {
      setDerived(details || {});
      const courses = await getCoursesForProgram(details?.program);
      const nextRows = await Promise.all((courses || []).map(async (course) => ({
        selected: false,
        course: course.course,
        course_name: course.course_name || course.course,
        grading_scale: await getCourseDefaultGradingScale(course.course) || "",
        schedule_date: today(),
        from_time: "",
        to_time: "",
        maximum_assessment_score: 100,
      })));
      setRows(nextRows);
    }).catch((error) => toast.error(getErrorMessage(error)));
  }, [studentGroup]);

  function updateRow(index, field, value) {
    setRows((current) => current.map((row, i) => (
      i === index ? {
        ...row,
        [field]: value,
        ...(row.result_status === "failed" && field !== "selected"
          ? { result_status: undefined, result_message: undefined }
          : {}),
      } : row
    )));
  }

  function toggleAll(checked) {
    setRows((current) => current.map((row) => (
      row.result_status === "created" ? row : { ...row, selected: checked }
    )));
  }

  async function createPlans() {
    const selected = rows.filter((row) => row.selected && row.result_status !== "created");
    if (!studentGroup || !assessmentGroup || !selected.length) {
      toast.error("Select a Class Arm, Assessment Group, and at least one subject.");
      return;
    }
    const incomplete = selected.find((row) => (
      !row.grading_scale || !row.schedule_date || !row.from_time || !row.to_time
      || !Number(row.maximum_assessment_score)
    ));
    if (incomplete) {
      toast.error(`Complete the schedule, grading scale, and score for ${incomplete.course_name}.`);
      return;
    }

    setSaving(true);
    const created = [];
    const failed = [];
    for (const row of selected) {
      try {
        const criteria = await getCriteriaTemplate(row.course, row.maximum_assessment_score);
        if (!criteria?.length) throw new Error("No default assessment criteria configured for this subject");
        const result = await createAssessmentPlan({
          student_group: studentGroup,
          assessment_group: assessmentGroup,
          assessment_name: [namePrefix, row.course_name].filter(Boolean).join(" - "),
          course: row.course,
          grading_scale: row.grading_scale,
          schedule_date: row.schedule_date,
          from_time: row.from_time,
          to_time: row.to_time,
          maximum_assessment_score: Number(row.maximum_assessment_score),
          assessment_criteria: criteria,
        });
        created.push(result.name);
        setRows((current) => current.map((currentRow) => (
          currentRow.course === row.course
            ? {
              ...currentRow,
              selected: false,
              result_status: "created",
              result_message: result.name,
            }
            : currentRow
        )));
      } catch (error) {
        const message = getErrorMessage(error);
        failed.push(`${row.course_name}: ${message}`);
        setRows((current) => current.map((currentRow) => (
          currentRow.course === row.course
            ? { ...currentRow, result_status: "failed", result_message: message }
            : currentRow
        )));
      }
    }
    setSaving(false);

    if (created.length) toast.success(`${created.length} assessment plan${created.length === 1 ? "" : "s"} created as drafts.`);
    if (failed.length) toast.error(`${failed.length} assessment plan${failed.length === 1 ? "" : "s"} failed. Review the subject rows below.`, { duration: 8000 });
    if (created.length && !failed.length) {
      navigate(`/dashboard/assessment-plan?student_group=${encodeURIComponent(studentGroup)}`);
    }
  }

  const selectableRows = rows.filter((row) => row.result_status !== "created");
  const selectedCount = selectableRows.filter((row) => row.selected).length;

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title="Bulk Assessment Plans"
        sub="Create draft assessment plans for multiple subjects in one class."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Class and Assessment</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Class Arm *</Label>
              <SearchableSelect value={studentGroup} onChange={setStudentGroup} options={groups} displayField="student_group_name" placeholder="Search class arm..." label="class arm" />
            </div>
            <div className="space-y-2">
              <Label>Assessment Group *</Label>
              <select className="input" value={assessmentGroup} onChange={(event) => setAssessmentGroup(event.target.value)}>
                <option value="">Select assessment group</option>
                {assessmentGroups.map((group) => <option key={group.name} value={group.name}>{group.assessment_group_name || group.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Assessment Name Prefix</Label>
              <Input value={namePrefix} onChange={(event) => setNamePrefix(event.target.value)} placeholder="e.g. First Term Examination" />
            </div>
            <div className="text-sm"><span className="text-muted-foreground">Class:</span> {derived.program || "—"}</div>
            <div className="text-sm"><span className="text-muted-foreground">Academic Year:</span> {derived.academic_year || "—"}</div>
            <div className="text-sm"><span className="text-muted-foreground">Academic Term:</span> {derived.academic_term || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Subjects ({selectedCount} selected)</CardTitle>
            {!!selectableRows.length && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedCount === selectableRows.length} onChange={(event) => toggleAll(event.target.checked)} /> Select all remaining</label>}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="tbl min-w-[1000px]">
                <thead><tr><th className="w-10" /><th>Subject</th><th>Grading Scale</th><th>Date</th><th>From</th><th>To</th><th>Maximum Score</th><th>Result</th></tr></thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.course}>
                      <td><input type="checkbox" checked={row.selected} disabled={row.result_status === "created"} onChange={(event) => updateRow(index, "selected", event.target.checked)} /></td>
                      <td className="font-medium">{row.course_name}</td>
                      <td><select className="input" disabled={row.result_status === "created"} value={row.grading_scale} onChange={(event) => updateRow(index, "grading_scale", event.target.value)}><option value="">Select scale</option>{gradingScales.map((scale) => <option key={scale.name} value={scale.name}>{scale.grading_scale_name || scale.name}</option>)}</select></td>
                      <td><Input type="date" disabled={row.result_status === "created"} value={row.schedule_date} onChange={(event) => updateRow(index, "schedule_date", event.target.value)} /></td>
                      <td><Input type="time" disabled={row.result_status === "created"} value={row.from_time} onChange={(event) => updateRow(index, "from_time", event.target.value)} /></td>
                      <td><Input type="time" disabled={row.result_status === "created"} value={row.to_time} onChange={(event) => updateRow(index, "to_time", event.target.value)} /></td>
                      <td><Input type="number" min="1" disabled={row.result_status === "created"} value={row.maximum_assessment_score} onChange={(event) => updateRow(index, "maximum_assessment_score", event.target.value)} /></td>
                      <td className="max-w-xs">
                        {row.result_status === "created" && (
                          <div><span className="font-medium text-success">Created</span><div className="text-xs text-muted-foreground">{row.result_message}</div></div>
                        )}
                        {row.result_status === "failed" && (
                          <div><span className="font-medium text-destructive">Failed</span><div className="mt-1 whitespace-normal text-xs text-destructive">{row.result_message}</div></div>
                        )}
                        {!row.result_status && <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Select a Class Arm to load its subjects.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Assessment criteria are copied and scaled from each subject’s configured defaults. Times are entered per subject to avoid schedule conflicts.</p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard/assessment-plan")}>Cancel</Button>
          <Button onClick={createPlans} disabled={saving || !selectedCount}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {selectedCount || ""} Draft Plan{selectedCount === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </>
  );
}

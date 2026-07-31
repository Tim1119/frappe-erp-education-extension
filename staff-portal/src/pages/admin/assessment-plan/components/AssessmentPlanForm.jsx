import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getStudentGroups,
  getLeafAssessmentGroups,
  getSubmittedGradingScales,
  getCoursesForProgram,
  getAcademicTerms,
  getClassrooms,
  getInstructors,
  getAssessmentCriteriaOptions,
  getStudentGroupDetails,
  getCourseDefaultGradingScale,
  getCriteriaTemplate,
} from "@/services/assessmentPlanService";
import { getErrorMessage } from "@/utils/errors";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student_group: "",
  assessment_name: "",
  assessment_group: "",
  grading_scale: "",
  course: "",
  schedule_date: todayStr(),
  room: "",
  examiner: "",
  from_time: "",
  to_time: "",
  supervisor: "",
  maximum_assessment_score: "",
  assessment_criteria: [],
};

function buildForm(plan) {
  if (!plan) return EMPTY;
  return {
    student_group: plan.student_group || "",
    assessment_name: plan.assessment_name || "",
    assessment_group: plan.assessment_group || "",
    grading_scale: plan.grading_scale || "",
    course: plan.course || "",
    schedule_date: plan.schedule_date || todayStr(),
    room: plan.room || "",
    examiner: plan.examiner || "",
    from_time: plan.from_time || "",
    to_time: plan.to_time || "",
    supervisor: plan.supervisor || "",
    maximum_assessment_score: plan.maximum_assessment_score ?? "",
    assessment_criteria: (plan.assessment_criteria || []).map((c) => ({
      assessment_criteria: c.assessment_criteria || "",
      maximum_score: c.maximum_score ?? "",
    })),
  };
}

export default function AssessmentPlanForm({ plan, onSave }) {
  const [form, setForm] = useState(() => buildForm(plan));
  // program / academic_year / academic_term are never sent by this form --
  // Frappe unconditionally re-derives them from student_group on every save
  // (their fetch_from has no fetch_if_empty), so anything sent here would
  // be silently overwritten anyway. This just previews what that will be.
  const [derived, setDerived] = useState({ program: "", academic_year: "", academic_term: "" });
  const [saving, setSaving] = useState(false);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [gradingScaleOptions, setGradingScaleOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [criteriaOptions, setCriteriaOptions] = useState([]);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    setForm(buildForm(plan));
  }, [plan]);

  useEffect(() => {
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
    getLeafAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
    getSubmittedGradingScales().then((r) => setGradingScaleOptions(r || [])).catch(() => {});
    getClassrooms().then((r) => setClassroomOptions(r || [])).catch(() => {});
    getInstructors().then((r) => setInstructorOptions(r || [])).catch(() => {});
    getAssessmentCriteriaOptions().then((r) => setCriteriaOptions(r || [])).catch(() => {});
  }, []);

  // Mirrors the real fetch_from chain: student_group -> course/program/
  // academic_year/academic_term. program/academic_year/academic_term are
  // always overwritten (previewed here); course only fills in if empty.
  useEffect(() => {
    if (!form.student_group) {
      setDerived({ program: "", academic_year: "", academic_term: "" });
      setCourseOptions([]);
      return;
    }
    getStudentGroupDetails(form.student_group)
      .then((d) => {
        if (!d) return;
        setDerived({
          program: d.program || "",
          academic_year: d.academic_year || "",
          academic_term: d.academic_term || "",
        });
        setForm((p) => ({ ...p, course: p.course || d.course || "" }));
        getCoursesForProgram(d.program).then((r) => setCourseOptions(r || [])).catch(() => {});
        getAcademicTerms(d.academic_year).then((r) => setAcademicTermOptions(r || [])).catch(() => {});
      })
      .catch((err) => toast.error(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.student_group]);

  // Mirrors grading_scale's fetch_from (course.default_grading_scale,
  // fetch_if_empty) -- only fills in if grading_scale is still empty.
  useEffect(() => {
    if (!form.course || form.grading_scale) return;
    getCourseDefaultGradingScale(form.course)
      .then((scale) => {
        if (scale) setForm((p) => (p.grading_scale ? p : { ...p, grading_scale: scale }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.course]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addRow() {
    setForm((p) => ({
      ...p,
      assessment_criteria: [...p.assessment_criteria, { assessment_criteria: "", maximum_score: "" }],
    }));
  }
  function removeRow(index) {
    setForm((p) => ({
      ...p,
      assessment_criteria: p.assessment_criteria.filter((_, i) => i !== index),
    }));
  }
  function updateRow(index, field, value) {
    const rows = [...form.assessment_criteria];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, assessment_criteria: rows }));
  }

  async function autoFillCriteria() {
    if (!form.course || !form.maximum_assessment_score) return;
    setFilling(true);
    try {
      const rows = await getCriteriaTemplate(form.course, form.maximum_assessment_score);
      if (!rows || !rows.length) {
        toast.error("No default assessment criteria found for this Subject.");
        return;
      }
      setForm((p) => ({ ...p, assessment_criteria: rows }));
      toast.success("Assessment criteria filled from the Subject's defaults");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFilling(false);
    }
  }

  const criteriaSum = form.assessment_criteria.reduce(
    (sum, r) => sum + (parseFloat(r.maximum_score) || 0), 0,
  );
  const maxScore = parseFloat(form.maximum_assessment_score) || 0;
  const sumMismatch = form.assessment_criteria.length > 0 && criteriaSum !== maxScore;

  const examinerName = instructorOptions.find((i) => i.name === form.examiner)?.instructor_name;
  const supervisorName = instructorOptions.find((i) => i.name === form.supervisor)?.instructor_name;

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.student_group || !form.assessment_group || !form.grading_scale
      || !form.course || !form.schedule_date || !form.from_time || !form.to_time
      || !form.maximum_assessment_score || form.assessment_criteria.length === 0
    ) {
      toast.error("Please fill in all required fields, including at least one assessment criterion.");
      return;
    }
    setSaving(true);
    try {
      // Number inputs report e.target.value as a string; cast here so the
      // payload never sends numeric-looking strings for fields the backend
      // sums/compares as numbers (maximum_assessment_score, per-row
      // maximum_score).
      await onSave({
        ...form,
        maximum_assessment_score: Number(form.maximum_assessment_score) || 0,
        assessment_criteria: form.assessment_criteria.map((row) => ({
          ...row,
          maximum_score: Number(row.maximum_score) || 0,
        })),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assessment Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Class Arm <span className="text-destructive">*</span></Label>
              <SearchableSelect
                value={form.student_group}
                onChange={(v) => upd("student_group", v)}
                options={studentGroupOptions}
                displayField="student_group_name"
                placeholder="Search class arm..."
                label="class arm"
              />
            </div>

            <div className="space-y-2">
              <Label>Assessment Name</Label>
              <Input
                value={form.assessment_name}
                onChange={(e) => upd("assessment_name", e.target.value)}
                placeholder="e.g. First Term Mathematics Test"
              />
            </div>

            <div className="space-y-2">
              <Label>Assessment Group <span className="text-destructive">*</span></Label>
              <Select value={form.assessment_group} onValueChange={(v) => upd("assessment_group", v)}>
                <SelectTrigger><SelectValue placeholder="Select assessment group" /></SelectTrigger>
                <SelectContent>
                  {assessmentGroupOptions.map((g) => (
                    <SelectItem key={g.name} value={g.name}>{g.assessment_group_name || g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select
                value={form.course}
                onValueChange={(v) => upd("course", v)}
                disabled={!form.student_group}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.student_group ? "Select subject" : "Select a class arm first"} />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((c) => (
                    <SelectItem key={c.course} value={c.course}>{c.course_name || c.course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grading Scale <span className="text-destructive">*</span></Label>
              <Select value={form.grading_scale} onValueChange={(v) => upd("grading_scale", v)}>
                <SelectTrigger><SelectValue placeholder="Select grading scale" /></SelectTrigger>
                <SelectContent>
                  {gradingScaleOptions.map((g) => (
                    <SelectItem key={g.name} value={g.name}>{g.grading_scale_name || g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only submitted grading scales are shown.</p>
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {derived.program || "— select a class arm —"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {derived.academic_year || "— select a class arm —"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Academic Term</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {derived.academic_term || "— select a class arm —"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-3 -mt-2">
              Class, Academic Year and Academic Term are always taken from the selected Class Arm and can't be set independently.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Schedule Date <span className="text-destructive">*</span></Label>
              <Input
                type="date" required
                value={form.schedule_date}
                onChange={(e) => upd("schedule_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>From Time <span className="text-destructive">*</span></Label>
              <Input
                type="time" required
                value={form.from_time}
                onChange={(e) => upd("from_time", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To Time <span className="text-destructive">*</span></Label>
              <Input
                type="time" required
                value={form.to_time}
                onChange={(e) => upd("to_time", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Classroom</Label>
              <Select value={form.room} onValueChange={(v) => upd("room", v)}>
                <SelectTrigger><SelectValue placeholder="Select classroom" /></SelectTrigger>
                <SelectContent>
                  {classroomOptions.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.room_name || c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Examiner</Label>
              <SearchableSelect
                value={form.examiner}
                onChange={(v) => upd("examiner", v)}
                options={instructorOptions}
                displayField="instructor_name"
                placeholder="Search teacher..."
                label="examiner"
                showId
              />
              {examinerName && <p className="text-xs text-muted-foreground">{examinerName}</p>}
            </div>

            <div className="space-y-2">
              <Label>Supervisor</Label>
              <SearchableSelect
                value={form.supervisor}
                onChange={(v) => upd("supervisor", v)}
                options={instructorOptions}
                displayField="instructor_name"
                placeholder="Search teacher..."
                label="supervisor"
                showId
              />
              {supervisorName && <p className="text-xs text-muted-foreground">{supervisorName}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Evaluate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Maximum Assessment Score <span className="text-destructive">*</span></Label>
              <Input
                type="number" required
                value={form.maximum_assessment_score}
                onChange={(e) => upd("maximum_assessment_score", e.target.value)}
              />
            </div>
            <div className="flex items-end pb-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={!form.course || !form.maximum_assessment_score || filling}
                onClick={autoFillCriteria}
              >
                {filling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Auto-fill from Subject
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Label>Assessment Criteria <span className="text-destructive">*</span></Label>
            <span className={`text-xs ${sumMismatch ? "text-destructive" : "text-muted-foreground"}`}>
              Sum of Maximum Scores: {criteriaSum} {maxScore ? `/ ${maxScore}` : ""}
              {sumMismatch && " (must equal Maximum Assessment Score)"}
            </span>
          </div>

          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Criteria</TableHead>
                <TableHead className="w-40">Maximum Score</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.assessment_criteria.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <SearchableSelect
                      value={row.assessment_criteria}
                      onChange={(v) => updateRow(index, "assessment_criteria", v)}
                      options={criteriaOptions}
                      placeholder="Search criteria..."
                      label="assessment criteria"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.maximum_score}
                      onChange={(e) => updateRow(index, "maximum_score", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {form.assessment_criteria.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No criteria added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" /> Add Row
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {plan ? "Update Assessment Plan" : "Create Assessment Plan"}
        </Button>
      </div>
    </form>
  );
}

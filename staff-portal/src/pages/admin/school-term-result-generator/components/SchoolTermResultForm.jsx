import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  getStudents, getAssessmentGroups, getAcademicYears, getAcademicTerms,
  getCourses, getAssessmentCriteria,
} from "@/services/schoolTermResultService";
import { getErrorMessage } from "@/utils/errors";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"];

function RatingSelect({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          {RATING_OPTIONS.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function emptySubjectRow() {
  return {
    subject: "", total_score: "", subject_position: "", grade: "",
    class_highest_score: "", class_lowest_score: "", class_average_score: "",
    previous_total1: "", previous_total2: "", session_average: "",
  };
}

function emptyComponentRow() {
  return { criteria: "", score_obtained: "", max_score: "", subject: "" };
}

function buildForm(result) {
  if (!result) {
    return {
      student: "", assessment_group: "", academic_year: "", academic_term: "",
      date_of_result_issue: new Date().toISOString().slice(0, 10),
    };
  }
  return {
    date_of_result_issue: result.date_of_result_issue || "",
    comments__notes: result.comments__notes || "",
    class_teacher_comment: result.class_teacher_comment || "",
    head_teacher_comment: result.head_teacher_comment || "",
    number_of_times_school_opened: result.number_of_times_school_opened ?? "",
    number_of_times_present: result.number_of_times_present ?? "",
    number_of_times_absent: result.number_of_times_absent ?? "",
    number_of_times_on_leave: result.number_of_times_on_leave ?? "",
    attendance_percentage: result.attendance_percentage ?? "",
    total_marks_obtained: result.total_marks_obtained ?? "",
    total_max_marks: result.total_max_marks ?? "",
    overall_grade: result.overall_grade || "",
    class_position: result.class_position ?? "",
    class_arm_position: result.class_arm_position ?? "",
    term_average: result.term_average ?? "",
    handwriting: result.handwriting || "",
    games: result.games || "",
    handling_tools: result.handling_tools || "",
    musical_skills: result.musical_skills || "",
    verbal_fluency: result.verbal_fluency || "",
    sport: result.sport || "",
    drawing_and_painting: result.drawing_and_painting || "",
    punctuality: result.punctuality || "",
    politeness: result.politeness || "",
    cooperation_with_others: result.cooperation_with_others || "",
    helping_others: result.helping_others || "",
    health: result.health || "",
    attitude_to_school_work: result.attitude_to_school_work || "",
    speaking__handwriting: result.speaking__handwriting || "",
    neatness: result.neatness || "",
    honesty: result.honesty || "",
    leadership: result.leadership || "",
    emotional_stability: result.emotional_stability || "",
    attentiveness: result.attentiveness || "",
    perseverance: result.perseverance || "",
    subjects: (result.subjects || []).map((s) => ({ ...s })),
    assessment_components: (result.assessment_components || []).map((c) => ({ ...c })),
  };
}

export default function SchoolTermResultForm({ result, onSave }) {
  const isEdit = Boolean(result);
  const [form, setForm] = useState(() => buildForm(result));
  const [saving, setSaving] = useState(false);

  const [studentOptions, setStudentOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [criteriaOptions, setCriteriaOptions] = useState([]);

  useEffect(() => {
    setForm(buildForm(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (isEdit) return;
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
    getAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions(r || [])).catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    if (!form.academic_year) {
      setAcademicTermOptions([]);
      return;
    }
    getAcademicTerms(form.academic_year).then((r) => setAcademicTermOptions(r || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, form.academic_year]);

  useEffect(() => {
    if (!isEdit) return;
    getCourses().then((r) => setCourseOptions((r || []).map((c) => ({ name: c.name, course_name: c.course_name })))).catch(() => {});
    getAssessmentCriteria().then((r) => setCriteriaOptions(r || [])).catch(() => {});
  }, [isEdit]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addSubjectRow() {
    setForm((p) => ({ ...p, subjects: [...p.subjects, emptySubjectRow()] }));
  }
  function removeSubjectRow(index) {
    setForm((p) => ({ ...p, subjects: p.subjects.filter((_, i) => i !== index) }));
  }
  function updateSubjectRow(index, field, value) {
    const rows = [...form.subjects];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, subjects: rows }));
  }

  function addComponentRow() {
    setForm((p) => ({ ...p, assessment_components: [...p.assessment_components, emptyComponentRow()] }));
  }
  function removeComponentRow(index) {
    setForm((p) => ({ ...p, assessment_components: p.assessment_components.filter((_, i) => i !== index) }));
  }
  function updateComponentRow(index, field, value) {
    const rows = [...form.assessment_components];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, assessment_components: rows }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isEdit && (!form.student || !form.assessment_group || !form.academic_year || !form.academic_term)) {
      toast.error("Student, Assessment Group, Academic Year and Academic Term are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // CREATE: only the doctype's real reqd fields, matching a normal Desk
  // "New School Term Result" form -- before_insert() computes everything
  // else the instant this saves, so showing the full ~40-field layout
  // here (all blank) would be both wrong and confusing.
  if (!isEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New School Term Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Student <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={form.student}
                  onChange={(v) => upd("student", v)}
                  options={studentOptions}
                  displayField="student_name"
                  placeholder="Search student..."
                  label="student"
                />
              </div>

              <div className="space-y-2">
                <Label>Assessment Group <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={form.assessment_group}
                  onChange={(v) => upd("assessment_group", v)}
                  options={assessmentGroupOptions}
                  displayField="assessment_group_name"
                  placeholder="Search assessment group..."
                  label="assessment group"
                  showId
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Select value={form.academic_year} onValueChange={(v) => { upd("academic_year", v); upd("academic_term", ""); }}>
                  <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y.name} value={y.name}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Academic Term <span className="text-destructive">*</span></Label>
                <Select value={form.academic_term} onValueChange={(v) => upd("academic_term", v)} disabled={!form.academic_year}>
                  <SelectTrigger>
                    <SelectValue placeholder={form.academic_year ? "Select academic term" : "Select an academic year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.title || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Result Issue</Label>
                <Input
                  type="date"
                  value={form.date_of_result_issue}
                  onChange={(e) => upd("date_of_result_issue", e.target.value)}
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Subjects, attendance, class/arm position and overall grade are computed automatically from this
              student's real Assessment Results the moment this is saved — creation fails if none exist yet for
              this Assessment Group.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create School Term Result
          </Button>
        </div>
      </form>
    );
  }

  // EDIT: the doctype's own before_insert() never re-runs on save (only
  // on insert) and validate() is a real no-op, so every field below can
  // genuinely be hand-adjusted afterward -- not an invented capability.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Date of Result Issue</Label>
              <Input type="date" value={form.date_of_result_issue} onChange={(e) => upd("date_of_result_issue", e.target.value)} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Comments / Notes</Label>
              <textarea className="input min-h-20 w-full" value={form.comments__notes} onChange={(e) => upd("comments__notes", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Class Teacher Comment</Label>
              <textarea className="input min-h-20 w-full" value={form.class_teacher_comment} onChange={(e) => upd("class_teacher_comment", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Head Teacher Comment</Label>
              <textarea className="input min-h-20 w-full" value={form.head_teacher_comment} onChange={(e) => upd("head_teacher_comment", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Times School Opened</Label>
              <Input value={form.number_of_times_school_opened} onChange={(e) => upd("number_of_times_school_opened", e.target.value)} />
              <p className="text-xs text-muted-foreground">Present + Absent + Leave</p>
            </div>
            <div className="space-y-2">
              <Label>Times Present</Label>
              <Input value={form.number_of_times_present} onChange={(e) => upd("number_of_times_present", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Times Absent</Label>
              <Input value={form.number_of_times_absent} onChange={(e) => upd("number_of_times_absent", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Times on Leave</Label>
              <Input value={form.number_of_times_on_leave} onChange={(e) => upd("number_of_times_on_leave", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Attendance %</Label>
              <Input type="number" value={form.attendance_percentage} onChange={(e) => upd("attendance_percentage", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subjects</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSubjectRow}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Highest</TableHead>
                  <TableHead>Lowest</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Prev. Term 1</TableHead>
                  <TableHead>Prev. Term 2</TableHead>
                  <TableHead>Session Avg</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.subjects.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="min-w-[10rem]">
                      <SearchableSelect
                        value={row.subject}
                        onChange={(v) => updateSubjectRow(index, "subject", v)}
                        options={courseOptions}
                        displayField="course_name"
                        placeholder="Subject"
                        label="subject"
                      />
                    </TableCell>
                    <TableCell><Input className="w-24" value={row.total_score} onChange={(e) => updateSubjectRow(index, "total_score", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.subject_position} onChange={(e) => updateSubjectRow(index, "subject_position", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-16" value={row.grade} onChange={(e) => updateSubjectRow(index, "grade", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.class_highest_score} onChange={(e) => updateSubjectRow(index, "class_highest_score", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.class_lowest_score} onChange={(e) => updateSubjectRow(index, "class_lowest_score", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.class_average_score} onChange={(e) => updateSubjectRow(index, "class_average_score", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.previous_total1} onChange={(e) => updateSubjectRow(index, "previous_total1", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.previous_total2} onChange={(e) => updateSubjectRow(index, "previous_total2", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-20" value={row.session_average} onChange={(e) => updateSubjectRow(index, "session_average", e.target.value)} /></TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSubjectRow(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {form.subjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">No subjects.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Result Components Breakdown</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addComponentRow}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Score Obtained</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.assessment_components.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="min-w-[10rem]">
                      <SearchableSelect
                        value={row.subject}
                        onChange={(v) => updateComponentRow(index, "subject", v)}
                        options={courseOptions}
                        displayField="course_name"
                        placeholder="Subject"
                        label="subject"
                      />
                    </TableCell>
                    <TableCell className="min-w-[10rem]">
                      <SearchableSelect
                        value={row.criteria}
                        onChange={(v) => updateComponentRow(index, "criteria", v)}
                        options={criteriaOptions}
                        placeholder="Criteria"
                        label="criteria"
                      />
                    </TableCell>
                    <TableCell><Input className="w-24" value={row.score_obtained} onChange={(e) => updateComponentRow(index, "score_obtained", e.target.value)} /></TableCell>
                    <TableCell><Input className="w-24" value={row.max_score} onChange={(e) => updateComponentRow(index, "max_score", e.target.value)} /></TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeComponentRow(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {form.assessment_components.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No components.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Total Marks Obtained</Label>
              <Input value={form.total_marks_obtained} onChange={(e) => upd("total_marks_obtained", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Total Max Marks</Label>
              <Input value={form.total_max_marks} onChange={(e) => upd("total_max_marks", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Term Average</Label>
              <Input value={form.term_average} onChange={(e) => upd("term_average", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Overall Grade</Label>
              <Input value={form.overall_grade} onChange={(e) => upd("overall_grade", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Class Position</Label>
              <Input value={form.class_position} onChange={(e) => upd("class_position", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Class Arm Position</Label>
              <Input value={form.class_arm_position} onChange={(e) => upd("class_arm_position", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Psychomotor Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RatingSelect label="Handwriting" value={form.handwriting} onChange={(v) => upd("handwriting", v)} />
            <RatingSelect label="Games" value={form.games} onChange={(v) => upd("games", v)} />
            <RatingSelect label="Handling Tools" value={form.handling_tools} onChange={(v) => upd("handling_tools", v)} />
            <RatingSelect label="Musical Skills" value={form.musical_skills} onChange={(v) => upd("musical_skills", v)} />
            <RatingSelect label="Verbal Fluency" value={form.verbal_fluency} onChange={(v) => upd("verbal_fluency", v)} />
            <RatingSelect label="Sport" value={form.sport} onChange={(v) => upd("sport", v)} />
            <RatingSelect label="Drawing and Painting" value={form.drawing_and_painting} onChange={(v) => upd("drawing_and_painting", v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Affective Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RatingSelect label="Punctuality" value={form.punctuality} onChange={(v) => upd("punctuality", v)} />
            <RatingSelect label="Politeness" value={form.politeness} onChange={(v) => upd("politeness", v)} />
            <RatingSelect label="Cooperation with Others" value={form.cooperation_with_others} onChange={(v) => upd("cooperation_with_others", v)} />
            <RatingSelect label="Helping Others" value={form.helping_others} onChange={(v) => upd("helping_others", v)} />
            <RatingSelect label="Health" value={form.health} onChange={(v) => upd("health", v)} />
            <RatingSelect label="Attitude to School Work" value={form.attitude_to_school_work} onChange={(v) => upd("attitude_to_school_work", v)} />
            <RatingSelect label="Speaking / Handwriting" value={form.speaking__handwriting} onChange={(v) => upd("speaking__handwriting", v)} />
            <RatingSelect label="Neatness" value={form.neatness} onChange={(v) => upd("neatness", v)} />
            <RatingSelect label="Honesty" value={form.honesty} onChange={(v) => upd("honesty", v)} />
            <RatingSelect label="Leadership" value={form.leadership} onChange={(v) => upd("leadership", v)} />
            <RatingSelect label="Emotional Stability" value={form.emotional_stability} onChange={(v) => upd("emotional_stability", v)} />
            <RatingSelect label="Attentiveness" value={form.attentiveness} onChange={(v) => upd("attentiveness", v)} />
            <RatingSelect label="Perseverance" value={form.perseverance} onChange={(v) => upd("perseverance", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update School Term Result
        </Button>
      </div>
    </form>
  );
}

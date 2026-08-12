import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import {
  getStudents,
  getPrograms,
  getStudentBatches,
  getAcademicYears,
  getAcademicTerms,
  getGroupAssessmentGroups,
  getLetterHeads,
  getTermsAndConditions,
  getTermsContent,
  getCurrentEnrollment,
  printReportCard,
} from "@/services/studentReportGenerationToolService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  student: "",
  student_name: "",
  program: "",
  student_batch: "",
  show_marks: 0,
  add_letterhead: 1,
  assessment_group: "",
  academic_year: "",
  academic_term: "",
  letter_head: "",
  parents_meeting: "",
  parents_attendance: "",
  terms: "",
  assessment_terms: "",
};

export default function StudentReportGenerationToolPage() {
  const [form, setForm] = useState(EMPTY);
  const [printing, setPrinting] = useState(false);

  const [studentOptions, setStudentOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [studentBatchOptions, setStudentBatchOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [letterHeadOptions, setLetterHeadOptions] = useState([]);
  const [termsOptions, setTermsOptions] = useState([]);

  useEffect(() => {
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
    getPrograms().then((r) => setProgramOptions((r || []).map((p) => p.name))).catch(() => {});
    getStudentBatches().then((r) => setStudentBatchOptions((r || []).map((b) => b.name))).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getGroupAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
    getLetterHeads().then((r) => setLetterHeadOptions((r || []).map((l) => l.name))).catch(() => {});
    getTermsAndConditions().then((r) => setTermsOptions(r || [])).catch(() => {});
  }, []);

  // Real onload set_query('academic_term', { filters: { academic_year } }).
  useEffect(() => {
    getAcademicTerms(form.academic_year || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [form.academic_year]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Real student change-handler: calls education.education.api
  // .get_current_enrollment(student, academic_year) and copies over
  // whichever returned keys match real fields on this Tool (program,
  // student_batch, academic_year, academic_term) -- mirrored exactly,
  // including re-echoing student_name.
  function selectStudent(value) {
    const match = studentOptions.find((s) => s.name === value);
    setForm((p) => ({ ...p, student: value, student_name: match?.student_name || "" }));

    if (!value) return;
    getCurrentEnrollment(value, form.academic_year || undefined)
      .then((r) => {
        if (!r) return;
        setForm((p) => ({
          ...p,
          program: r.program ?? p.program,
          student_batch: r.student_batch ?? p.student_batch,
          academic_year: r.academic_year ?? p.academic_year,
          academic_term: r.academic_term ?? p.academic_term,
        }));
      })
      .catch(() => {});
  }

  // Real fetch_from: assessment_terms <- terms.terms.
  function selectTerms(value) {
    upd("terms", value);
    if (!value) {
      upd("assessment_terms", "");
      return;
    }
    getTermsContent(value)
      .then((content) => upd("assessment_terms", content || ""))
      .catch(() => {});
  }

  function handlePrint() {
    // Exact real mandatory-field check from student_report_generation_tool.js's
    // primary action, not the schema's own reqd flags (which would also
    // require academic_year but not student_batch/academic_term either way).
    if (!form.student || !form.assessment_group || !form.program || !form.academic_year) {
      toast.error("Please fill in all the mandatory fields.");
      return;
    }

    setPrinting(true);
    try {
      printReportCard({
        doctype: "Student Report Generation Tool",
        name: "Student Report Generation Tool",
        ...form,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPrinting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Student Report Generation Tool"
        description="Generate and print a single student's report card as a PDF."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Student <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  value={form.student}
                  onChange={selectStudent}
                  options={studentOptions}
                  displayField="student_name"
                  placeholder="Search student..."
                  label="student"
                />
              </div>

              <div className="space-y-2">
                <Label>Student Name</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {form.student_name || "—"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Class <span className="text-destructive">*</span>
                </Label>
                <Select value={form.program} onValueChange={(v) => upd("program", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Batch</Label>
                <Select value={form.student_batch} onValueChange={(v) => upd("student_batch", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentBatchOptions.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Academic Year <span className="text-destructive">*</span>
                </Label>
                <Select value={form.academic_year} onValueChange={(v) => upd("academic_year", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Academic Term</Label>
                <Select value={form.academic_term} onValueChange={(v) => upd("academic_term", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic term" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Assessment Group <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  value={form.assessment_group}
                  onChange={(v) => upd("assessment_group", v)}
                  options={assessmentGroupOptions}
                  displayField="assessment_group_name"
                  placeholder="Search assessment group..."
                  label="assessment group"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Report Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.show_marks === 1}
                    onChange={(e) => upd("show_marks", e.target.checked ? 1 : 0)}
                  />
                  <span className="text-sm">Show Marks</span>
                </label>
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.add_letterhead === 1}
                    onChange={(e) => upd("add_letterhead", e.target.checked ? 1 : 0)}
                  />
                  <span className="text-sm">Add Letter Head</span>
                </label>
              </div>

              {form.add_letterhead === 1 && (
                <div className="space-y-2">
                  <Label>Letter Head</Label>
                  <Select value={form.letter_head} onValueChange={(v) => upd("letter_head", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select letter head" />
                    </SelectTrigger>
                    <SelectContent>
                      {letterHeadOptions.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Parents Meeting</Label>
                <Input
                  value={form.parents_meeting}
                  onChange={(e) => upd("parents_meeting", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Parents Attendance</Label>
                <Input
                  value={form.parents_attendance}
                  onChange={(e) => upd("parents_attendance", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Terms and Conditions</Label>
                <Select value={form.terms} onValueChange={selectTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {termsOptions.map((tc) => (
                      <SelectItem key={tc.name} value={tc.name}>{tc.title || tc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>Assessment Terms</Label>
                <textarea
                  className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:border-primary"
                  value={form.assessment_terms}
                  onChange={(e) => upd("assessment_terms", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handlePrint} disabled={printing}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report Card
          </Button>
        </div>
      </div>
    </>
  );
}

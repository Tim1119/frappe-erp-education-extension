import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus, CheckCheck, XCircle, CheckCircle2 } from "lucide-react";
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
  getCandidateStudents,
  enrollStudents,
  getAcademicTermReqd,
  getPeriodStartDate,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentBatchNames,
} from "@/services/classEnrollmentToolService";
import { getErrorMessage } from "@/utils/errors";

// Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1) -- real name
// "Program Enrollment Tool", school-facing "Class Enrollment Tool" per
// translations.js's own configured TERM_MAP ("Program Enrollment Tool"
// -> "Class Enrollment Tool", "Program Enrollment" -> "Class Enrollment").
// Real client script calls frm.disable_save() -- same never-persisted
// Single pattern as every prior Tool.
//
// Real mechanism has two genuinely different modes (Get Students From):
//   - "Student Applicant": enrolls newly-Approved applicants directly
//     into the Class/Academic Year/Term selected below (no separate
//     target -- this IS the target).
//   - "Program Enrollment" (shown here as "Class Enrollment"): finds
//     students with an existing Class Enrollment under a SOURCE Class/
//     Academic Year/Term/Batch and creates a new one for each under a
//     SEPARATE target Class/Academic Year/Term/Batch -- i.e. promoting
//     continuing students into their next Class/Academic Year.
//
// Real atomicity: enroll_students() has no per-row try/except and no
// explicit commit inside the real method -- one row's failure (almost
// always validate_duplication()'s "Student is already enrolled.") aborts
// the WHOLE batch via Frappe's own request-level rollback. Genuinely
// all-or-nothing, same as Student Attendance Tool -- there is no partial
// created/errors split to show, unlike Subject Scheduling Tool.
const GET_STUDENTS_FROM = ["Student Applicant", "Program Enrollment"];
const GET_STUDENTS_FROM_LABELS = { "Student Applicant": "Student Applicant", "Program Enrollment": "Class Enrollment" };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function ClassEnrollmentToolPage() {
  const navigate = useNavigate();

  const [getStudentsFrom, setGetStudentsFrom] = useState("Student Applicant"); // real fieldname: get_students_from
  const [program, setProgram] = useState("");
  const [studentBatch, setStudentBatch] = useState(""); // real fieldname: student_batch
  const [academicYear, setAcademicYear] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [academicTermReqd, setAcademicTermReqd] = useState(false);

  const [newProgram, setNewProgram] = useState(""); // real fieldname: new_program
  const [newAcademicYear, setNewAcademicYear] = useState(""); // real fieldname: new_academic_year
  const [newAcademicTerm, setNewAcademicTerm] = useState(""); // real fieldname: new_academic_term
  const [newStudentBatch, setNewStudentBatch] = useState(""); // real fieldname: new_student_batch
  const [enrollmentDate, setEnrollmentDate] = useState(todayStr()); // real fieldname: enrollment_date

  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [newAcademicTermOptions, setNewAcademicTermOptions] = useState([]);
  const [studentBatchOptions, setStudentBatchOptions] = useState([]);

  const [students, setStudents] = useState([]); // real fieldname: students (Program Enrollment Tool Student)
  const [checkedMap, setCheckedMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [result, setResult] = useState(null);

  const isPromotion = getStudentsFrom === "Program Enrollment";

  useEffect(() => {
    getPrograms().then((r) => setProgramOptions(r || [])).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions(r || [])).catch(() => {});
    getStudentBatchNames().then((r) => setStudentBatchOptions(r || [])).catch(() => {});
    getAcademicTermReqd().then((v) => setAcademicTermReqd(Boolean(v))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!academicYear) {
      setAcademicTermOptions([]);
      return;
    }
    getAcademicTerms(academicYear).then((r) => setAcademicTermOptions(r || [])).catch(() => {});
  }, [academicYear]);

  useEffect(() => {
    if (!newAcademicYear) {
      setNewAcademicTermOptions([]);
      return;
    }
    getAcademicTerms(newAcademicYear).then((r) => setNewAcademicTermOptions(r || [])).catch(() => {});
  }, [newAcademicYear]);

  // Mirrors the real client script's refresh() add_fetch: enrollment_date
  // is pulled from the TARGET period's own start date (new_academic_term
  // if set, else new_academic_year) -- only meaningful in Class Enrollment
  // (promotion) mode, matching enrollment_date's own real depends_on.
  useEffect(() => {
    if (!isPromotion) return;
    if (!newAcademicTerm && !newAcademicYear) return;
    getPeriodStartDate(newAcademicTerm || undefined, newAcademicTerm ? undefined : newAcademicYear)
      .then((d) => { if (d) setEnrollmentDate(d); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAcademicTerm, newAcademicYear, isPromotion]);

  function switchSource(v) {
    setGetStudentsFrom(v);
    setStudents([]);
    setCheckedMap({});
    setResult(null);
  }

  async function handleGetStudents() {
    if (!getStudentsFrom || !program || !academicYear) {
      toast.error("Select Get Students From, Class and Academic Year first.");
      return;
    }
    setLoadingStudents(true);
    setResult(null);
    try {
      const rows = await getCandidateStudents(
        getStudentsFrom, program, academicYear, academicTerm, isPromotion ? studentBatch : undefined,
      );
      const list = rows || [];
      setStudents(list);
      const initial = {};
      for (const s of list) initial[s.student_applicant || s.student] = true;
      setCheckedMap(initial);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setStudents([]);
      setCheckedMap({});
    } finally {
      setLoadingStudents(false);
    }
  }

  function rowKey(row) {
    return row.student_applicant || row.student;
  }

  function toggleAll(checked) {
    const next = {};
    for (const s of students) next[rowKey(s)] = checked;
    setCheckedMap(next);
  }

  function toggleOne(key, checked) {
    setCheckedMap((p) => ({ ...p, [key]: checked }));
  }

  const selectedStudents = students.filter((s) => checkedMap[rowKey(s)]);

  async function handleEnroll() {
    if (selectedStudents.length === 0) {
      toast.error("Select at least one student to enroll.");
      return;
    }
    if (isPromotion) {
      if (!newProgram || !newAcademicYear) {
        toast.error("New Class and New Academic Year are required for Class Enrollment (promotion).");
        return;
      }
      if (academicTerm && !newAcademicTerm) {
        toast.error("New Academic Term is required since Academic Term is set above.");
        return;
      }
      if (studentBatch && !newStudentBatch) {
        toast.error("New Student Batch is required since Student Batch is set above.");
        return;
      }
    }
    if (academicTermReqd && !academicTerm) {
      toast.error("Academic Term is required by Education Settings.");
      return;
    }

    setEnrolling(true);
    try {
      const r = await enrollStudents({
        get_students_from: getStudentsFrom,
        program,
        student_batch: isPromotion ? studentBatch : undefined,
        academic_year: academicYear,
        academic_term: academicTerm,
        enrollment_date: isPromotion ? enrollmentDate : undefined,
        new_program: isPromotion ? newProgram : undefined,
        new_student_batch: isPromotion ? newStudentBatch : undefined,
        new_academic_year: isPromotion ? newAcademicYear : undefined,
        new_academic_term: isPromotion ? newAcademicTerm : undefined,
        students: selectedStudents.map((s) => ({
          student_applicant: s.student_applicant || "",
          student: s.student || "",
          student_name: s.student_name || "",
          student_batch_name: s.student_batch_name || "",
          student_category: s.student_category || "",
        })),
      });
      setResult(r);
      toast.success(`${r.count} student${r.count === 1 ? "" : "s"} enrolled.`);
      // Keep the source/target selections -- enrolling another batch under
      // the same Class/Academic Year/Term is the most likely next action.
      // The just-enrolled rows are cleared: re-submitting the exact same
      // selection would fail outright (Class Enrollment's own
      // validate_duplication() rejects an identical student/program/
      // academic_year/academic_term a second time), so leaving them
      // checked would just invite a guaranteed-failing retry.
      setStudents([]);
      setCheckedMap({});
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Class Enrollment Tool"
        description="Bulk-enroll Approved Student Applicants, or promote continuing students into their next Class and Academic Year/Term."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Get Students From <span className="text-destructive">*</span></Label>
                <Select value={getStudentsFrom} onValueChange={switchSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GET_STUDENTS_FROM.map((o) => (
                      <SelectItem key={o} value={o}>{GET_STUDENTS_FROM_LABELS[o]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={program}
                  onChange={setProgram}
                  options={programOptions}
                  placeholder="Search class..."
                  label="class"
                />
              </div>

              {isPromotion && (
                <div className="space-y-2">
                  <Label>Student Batch</Label>
                  <Select value={studentBatch} onValueChange={setStudentBatch}>
                    <SelectTrigger><SelectValue placeholder="Any batch" /></SelectTrigger>
                    <SelectContent>
                      {studentBatchOptions.map((b) => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Select value={academicYear} onValueChange={(v) => { setAcademicYear(v); setAcademicTerm(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y.name} value={y.name}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Academic Term {academicTermReqd && <span className="text-destructive">*</span>}
                </Label>
                <Select value={academicTerm} onValueChange={setAcademicTerm} disabled={!academicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder={academicYear ? "Select academic term" : "Select an academic year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.title || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {isPromotion
                ? "Finds students already enrolled in this Class/Academic Year/Term(/Batch) — pick where to enroll them next below."
                : "Only Student Applicants with status \"Approved\" for this Class/Academic Year(/Term) are shown. They are enrolled directly into the Class/Academic Year/Term selected above."}
            </p>

            <div className="mt-4">
              <Button type="button" variant="outline" onClick={handleGetStudents} disabled={loadingStudents}>
                {loadingStudents && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Students
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Students to Enroll</CardTitle>
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(true)}>
                    <CheckCheck className="mr-2 h-4 w-4" /> Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(false)}>
                    <XCircle className="mr-2 h-4 w-4" /> Deselect All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Click "Get Students" to load candidates.
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {students.map((s) => {
                    const key = rowKey(s);
                    return (
                      <label key={key} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={Boolean(checkedMap[key])}
                          onChange={(e) => toggleOne(key, e.target.checked)}
                        />
                        <span className="flex-1">
                          {s.student_name}
                          {(s.student_batch_name || s.student_category) && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({[s.student_batch_name, s.student_category].filter(Boolean).join(" · ")})
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {selectedStudents.length} of {students.length} selected.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {isPromotion && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Enroll Into</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>New Class <span className="text-destructive">*</span></Label>
                  <SearchableSelect
                    value={newProgram}
                    onChange={setNewProgram}
                    options={programOptions}
                    placeholder="Search class..."
                    label="class"
                  />
                </div>

                <div className="space-y-2">
                  <Label>New Academic Year <span className="text-destructive">*</span></Label>
                  <Select value={newAcademicYear} onValueChange={(v) => { setNewAcademicYear(v); setNewAcademicTerm(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                    <SelectContent>
                      {academicYearOptions.map((y) => (
                        <SelectItem key={y.name} value={y.name}>{y.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    New Academic Term {academicTerm && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={newAcademicTerm} onValueChange={setNewAcademicTerm} disabled={!newAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder={newAcademicYear ? "Select academic term" : "Select a new academic year first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {newAcademicTermOptions.map((t) => (
                        <SelectItem key={t.name} value={t.name}>{t.title || t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    New Student Batch {studentBatch && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={newStudentBatch} onValueChange={setNewStudentBatch}>
                    <SelectTrigger><SelectValue placeholder="Select student batch" /></SelectTrigger>
                    <SelectContent>
                      {studentBatchOptions.map((b) => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Used only for selected students that don't already carry their own batch.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Enrollment Date</Label>
                  <Input type="date" value={enrollmentDate} onChange={(e) => setEnrollmentDate(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Defaults to the New Academic Term/Year's start date.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={handleEnroll} disabled={enrolling}>
            {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <UserPlus className="mr-2 h-4 w-4" />
            Enroll Students
          </Button>
        </div>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {result.count} student{result.count === 1 ? "" : "s"} enrolled. New enrollments are created as
              drafts — submit them from the Class Enrollment list to finalize fees and Subject enrollment.
            </div>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-1.5 text-left font-medium">Student</th>
                    <th className="px-3 py-1.5 text-left font-medium">Class Enrollment</th>
                  </tr>
                </thead>
                <tbody>
                  {result.created.map((c) => (
                    <tr
                      key={c.program_enrollment || c.student}
                      className={c.program_enrollment ? "cursor-pointer border-b last:border-0 hover:bg-muted/50" : "border-b last:border-0"}
                      onClick={() => c.program_enrollment && navigate(`/dashboard/class-enrollment/${encodeURIComponent(c.program_enrollment)}`)}
                    >
                      <td className="px-3 py-1.5">{c.student_name || c.student}</td>
                      <td className="px-3 py-1.5 font-medium text-primary">{c.program_enrollment || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

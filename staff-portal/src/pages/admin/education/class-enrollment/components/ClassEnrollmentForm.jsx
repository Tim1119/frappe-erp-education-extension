import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
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
  getStudents,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentCategories,
  getStudentBatches,
  getSchoolHouses,
  getFeeSchedules,
  getCoursesForProgram,
} from "@/services/education/classEnrollmentService";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student: "",
  program: "",
  academic_year: "",
  academic_term: "",
  enrollment_date: todayStr(),
  student_category: "",
  student_batch_name: "",
  school_house: "",
  boarding_student: 0,
  image: "",
  courses: [],
  fees: [],
};

// Shared by the lazy useState initializer (so the very first render already
// has real data, no empty-then-filled-in gap) and the sync effect below
// (in case the classEnrollment prop object itself is ever replaced later).
function buildForm(classEnrollment) {
  if (!classEnrollment) return EMPTY;
  return {
    student: classEnrollment.student || "",
    program: classEnrollment.program || "",
    academic_year: classEnrollment.academic_year || "",
    academic_term: classEnrollment.academic_term || "",
    enrollment_date: classEnrollment.enrollment_date || todayStr(),
    student_category: classEnrollment.student_category || "",
    student_batch_name: classEnrollment.student_batch_name || "",
    school_house: classEnrollment.school_house || "",
    boarding_student: classEnrollment.boarding_student || 0,
    image: classEnrollment.image || "",
    courses: classEnrollment.courses?.length
      ? classEnrollment.courses.map((c) => ({ course: c.course || "", course_name: c.course_name || "" }))
      : [],
    fees: classEnrollment.fees?.length
      ? classEnrollment.fees.map((f) => ({
          fee_schedule: f.fee_schedule || "",
          academic_term: f.academic_term || "",
          student_category: f.student_category || "",
          due_date: f.due_date || "",
          amount: f.amount ?? "",
        }))
      : [],
  };
}

// Same upload-file mechanism as ClassForm.jsx's hero_image
async function uploadImageFile(file, docname) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doctype", "Program Enrollment");
  formData.append("docname", docname || "");
  formData.append("fieldname", "image");

  try {
    const response = await fetch("/api/method/upload_file", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-Frappe-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content || "",
      },
    });
    const result = await response.json();
    return result?.message?.file_url || null;
  } catch (err) {
    return null;
  }
}

function ImageField({ value, onChange, docname, locked }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImageFile(file, docname);
    setUploading(false);

    if (url) {
      onChange(url);
    } else {
      toast.error("Failed to upload image. Please try again.");
    }
  }

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      {!locked && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            id="enrollment-image-upload"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById("enrollment-image-upload").click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {value && (
            <Button type="button" variant="outline" onClick={() => onChange("")}>
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      )}
      {value ? (
        <img
          src={value}
          alt="Enrollment"
          className="mt-2 h-20 w-20 rounded-md border object-cover"
        />
      ) : (
        locked && <p className="text-xs text-muted-foreground">No image.</p>
      )}
    </div>
  );
}

export default function ClassEnrollmentForm({ classEnrollment, onSave }) {
  // Lazy initializer: since classEnrollment is already fully loaded by the
  // time this component ever mounts (the parent page gates rendering on
  // its own loading state), this computes the real values on the very
  // first render -- no render where form is briefly EMPTY while
  // classEnrollment is already available.
  const [form, setForm] = useState(() => buildForm(classEnrollment));
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(classEnrollment);
  const isSubmitted = classEnrollment?.docstatus === 1;

  const [studentOptions, setStudentOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentCategoryOptions, setStudentCategoryOptions] = useState([]);
  const [studentBatchOptions, setStudentBatchOptions] = useState([]);
  const [schoolHouseOptions, setSchoolHouseOptions] = useState([]);
  const [feeScheduleOptions, setFeeScheduleOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
    getPrograms().then((r) => setProgramOptions((r || []).map((p) => p.name))).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getStudentCategories().then((r) => setStudentCategoryOptions((r || []).map((c) => c.name))).catch(() => {});
    getStudentBatches().then((r) => setStudentBatchOptions((r || []).map((b) => b.name))).catch(() => {});
    getSchoolHouses().then((r) => setSchoolHouseOptions((r || []).map((h) => h.name))).catch(() => {});
    getFeeSchedules().then((r) => setFeeScheduleOptions(r || [])).catch(() => {});
  }, []);

  // Defensive: keeps form in sync if the classEnrollment prop object
  // itself is ever replaced after mount (not currently possible in this
  // app's flow, but harmless and correct if that ever changes). The
  // actual first-render race is already closed by the lazy initializer
  // above, not by this effect.
  useEffect(() => {
    setForm(buildForm(classEnrollment));
  }, [classEnrollment]);

  useEffect(() => {
    getAcademicTerms(form.academic_year || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [form.academic_year]);

  useEffect(() => {
    getCoursesForProgram(form.program || undefined)
      .then((r) => setCourseOptions(r || []))
      .catch(() => setCourseOptions([]));
  }, [form.program]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addCourseRow() {
    setForm((p) => ({ ...p, courses: [...p.courses, { course: "", course_name: "" }] }));
  }

  function removeCourseRow(index) {
    setForm((p) => ({ ...p, courses: p.courses.filter((_, i) => i !== index) }));
  }

  function updateCourseRow(index, courseValue) {
    const rows = [...form.courses];
    const match = courseOptions.find((c) => c.course === courseValue);
    rows[index] = { course: courseValue, course_name: match?.course_name || "" };
    setForm((p) => ({ ...p, courses: rows }));
  }

  function addFeeRow() {
    setForm((p) => ({
      ...p,
      fees: [...p.fees, { fee_schedule: "", academic_term: "", student_category: "", due_date: "", amount: "" }],
    }));
  }

  function removeFeeRow(index) {
    setForm((p) => ({ ...p, fees: p.fees.filter((_, i) => i !== index) }));
  }

  function updateFeeRow(index, feeScheduleValue) {
    const rows = [...form.fees];
    const match = feeScheduleOptions.find((f) => f.name === feeScheduleValue);
    rows[index] = {
      fee_schedule: feeScheduleValue,
      academic_term: match?.academic_term || "",
      student_category: match?.student_category || "",
      due_date: match?.due_date || "",
      amount: match?.total_amount ?? "",
    };
    setForm((p) => ({ ...p, fees: rows }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // TEMPORARY diagnostic -- remove once confirmed fixed. Shows exactly
    // what the required-field check sees at the moment Submit is clicked.
    console.log("[ClassEnrollmentForm] submit-time form snapshot:", {
      student: form.student,
      program: form.program,
      academic_year: form.academic_year,
    });

    // Class/Academic Year/Student are reqd:1 but render as shadcn <Select>,
    // which (unlike <Input required>) gets no native browser validation --
    // guard explicitly so a submit can never go out with these empty.
    if (!form.student || !form.program || !form.academic_year) {
      toast.error("Student, Class, and Academic Year are required.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSubmitted && (
        <div
          className="rounded-md border px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning-ink)", borderColor: "var(--warning-soft)" }}
        >
          This enrollment is submitted. Only Subjects, Student Batch, and School House can still be changed here.
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Class Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Student <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                value={form.student}
                onChange={(v) => upd("student", v)}
                options={studentOptions}
                displayField="student_name"
                placeholder="Search student..."
                label="student"
                disabled={isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Class <span className="text-destructive">*</span>
              </Label>
              <Select value={form.program} onValueChange={(v) => upd("program", v)} disabled={isSubmitted}>
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
              <Label>
                Academic Year <span className="text-destructive">*</span>
              </Label>
              <Select value={form.academic_year} onValueChange={(v) => upd("academic_year", v)} disabled={isSubmitted}>
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
              <Select value={form.academic_term} onValueChange={(v) => upd("academic_term", v)} disabled={isSubmitted}>
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
                Enrollment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                required
                value={form.enrollment_date}
                onChange={(e) => upd("enrollment_date", e.target.value)}
                disabled={isSubmitted}
              />
            </div>

            <div className="space-y-2">
              <Label>Student Category</Label>
              <Select value={form.student_category} onValueChange={(v) => upd("student_category", v)} disabled={isSubmitted}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {studentCategoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Student Batch</Label>
              <Select value={form.student_batch_name} onValueChange={(v) => upd("student_batch_name", v)}>
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
              <Label>School House</Label>
              <Select value={form.school_house} onValueChange={(v) => upd("school_house", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select house" />
                </SelectTrigger>
                <SelectContent>
                  {schoolHouseOptions.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.boarding_student === 1}
                  onChange={(e) => upd("boarding_student", e.target.checked ? 1 : 0)}
                  disabled={isSubmitted}
                />
                <span className="text-sm">Boarding Student</span>
              </label>
            </div>
          </div>

          {isEdit ? (
            <div className="mt-4">
              <ImageField
                value={form.image}
                onChange={(v) => upd("image", v)}
                docname={classEnrollment.name}
                locked={isSubmitted}
              />
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Image can be added after the enrollment is first created.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Leave empty to auto-enroll in this Class's required Subjects when saved.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.courses.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={row.course}
                      onValueChange={(v) => updateCourseRow(index, v)}
                      disabled={!form.program}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={form.program ? "Select subject" : "Select a class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((c) => (
                          <SelectItem key={c.course} value={c.course}>
                            {c.course_name || c.course}{c.required ? " (required)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                      {row.course_name || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCourseRow(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" className="mt-3" onClick={addCourseRow}>
            <Plus className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        </CardContent>
      </Card>

      {!isSubmitted && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Schedule</TableHead>
                  <TableHead>Academic Term</TableHead>
                  <TableHead>Student Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.fees.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select value={row.fee_schedule} onValueChange={(v) => updateFeeRow(index, v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeScheduleOptions.map((f) => (
                            <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.academic_term || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.student_category || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.due_date || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.amount || "—"}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFeeRow(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" className="mt-3" onClick={addFeeRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Fee Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Class Enrollment" : "Create Class Enrollment"}
        </Button>
      </div>
    </form>
  );
}

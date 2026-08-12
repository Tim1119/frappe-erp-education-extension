import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getCourseSchedules,
  getCourseScheduleDetails,
  getStudentGroups,
  getProgramForStudentGroup,
  getStudentsForClassArm,
} from "@/services/education/studentAttendanceService";
import { getErrorMessage } from "@/utils/errors";

const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student: "",
  course_schedule: "",
  student_group: "",
  date: todayStr(),
  status: "Present",
};

function buildForm(record) {
  if (!record) return EMPTY;
  return {
    student: record.student || "",
    course_schedule: record.course_schedule || "",
    student_group: record.student_group || "",
    date: record.date || todayStr(),
    status: record.status || "Present",
  };
}

export default function StudentAttendanceForm({ record, onSave }) {
  const [form, setForm] = useState(() => buildForm(record));
  // Whatever course_schedule.student_group/schedule_date actually are --
  // the controller's set_date()/set_student_group() unconditionally
  // overwrite form.student_group/form.date with these on save whenever
  // course_schedule is set, so they're shown as a locked preview instead
  // of editable inputs in that mode.
  const [csDetails, setCsDetails] = useState({ student_group: "", schedule_date: "" });
  const [program, setProgram] = useState("");
  const [saving, setSaving] = useState(false);

  const [courseScheduleOptions, setCourseScheduleOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const isSubmitted = record?.docstatus === 1;
  const usingCourseSchedule = Boolean(form.course_schedule);
  const effectiveStudentGroup = usingCourseSchedule ? csDetails.student_group : form.student_group;

  useEffect(() => {
    setForm(buildForm(record));
  }, [record]);

  useEffect(() => {
    getCourseSchedules().then((r) => setCourseScheduleOptions(r || [])).catch(() => {});
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.course_schedule) {
      setCsDetails({ student_group: "", schedule_date: "" });
      return;
    }
    getCourseScheduleDetails(form.course_schedule)
      .then((d) => {
        if (!d) return;
        setCsDetails({ student_group: d.student_group || "", schedule_date: d.schedule_date || "" });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [form.course_schedule]);

  useEffect(() => {
    if (!effectiveStudentGroup) {
      setProgram("");
      setStudentOptions([]);
      return;
    }
    getProgramForStudentGroup(effectiveStudentGroup).then((p) => setProgram(p || "")).catch(() => {});
    getStudentsForClassArm(effectiveStudentGroup)
      .then((r) => setStudentOptions(r || []))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [effectiveStudentGroup]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitted) {
      // Only status is allow_on_submit -- every other field is locked, so
      // a submitted record only ever sends status changes.
      setSaving(true);
      try {
        await onSave({ status: form.status });
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.student || !form.date || !form.status || (!form.course_schedule && !form.student_group)) {
      toast.error("Please select a Student, a Subject Schedule or Class Arm, a Date and a Status.");
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Subject Schedule</Label>
              <SearchableSelect
                value={form.course_schedule}
                onChange={(v) => upd("course_schedule", v)}
                options={courseScheduleOptions}
                displayField="title"
                placeholder="Search subject schedule..."
                label="subject schedule"
                disabled={isSubmitted}
                showId
              />
              <p className="text-xs text-muted-foreground">
                Optional -- pick this to mark attendance for a specific period. Leave empty to mark by Class Arm and Date instead.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Class Arm {!usingCourseSchedule && <span className="text-destructive">*</span>}
              </Label>
              {usingCourseSchedule ? (
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {csDetails.student_group || "— loading —"}
                </div>
              ) : (
                <Select
                  value={form.student_group}
                  onValueChange={(v) => upd("student_group", v)}
                  disabled={isSubmitted}
                >
                  <SelectTrigger><SelectValue placeholder="Select class arm" /></SelectTrigger>
                  <SelectContent>
                    {studentGroupOptions.map((g) => (
                      <SelectItem key={g.name} value={g.name}>{g.student_group_name || g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {usingCourseSchedule && (
                <p className="text-xs text-muted-foreground">Taken from the selected Subject Schedule.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              {usingCourseSchedule ? (
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {csDetails.schedule_date || "— loading —"}
                </div>
              ) : (
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => upd("date", e.target.value)}
                  disabled={isSubmitted}
                />
              )}
              {usingCourseSchedule && (
                <p className="text-xs text-muted-foreground">Taken from the selected Subject Schedule.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                {program || "— select a class arm —"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Student <span className="text-destructive">*</span></Label>
              <SearchableSelect
                value={form.student}
                onChange={(v) => upd("student", v)}
                options={studentOptions}
                displayField="student_name"
                placeholder={effectiveStudentGroup ? "Search student..." : "Select a Subject Schedule or Class Arm first"}
                label="student"
                disabled={isSubmitted || !effectiveStudentGroup}
              />
              <p className="text-xs text-muted-foreground">
                Only students enrolled in this Class Arm are shown.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status <span className="text-destructive">*</span></Label>
              <Select value={form.status} onValueChange={(v) => upd("status", v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSubmitted && (
                <p className="text-xs text-muted-foreground">
                  Status can still be corrected after submission; every other field is locked.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {record ? "Update Student Attendance" : "Create Student Attendance"}
        </Button>
      </div>
    </form>
  );
}

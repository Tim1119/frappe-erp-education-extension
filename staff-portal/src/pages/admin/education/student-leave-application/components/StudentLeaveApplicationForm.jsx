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
  getStudents,
  getStudentGroupsForStudent,
  getCourseSchedulesForStudent,
} from "@/services/studentLeaveApplicationService";
import { getErrorMessage } from "@/utils/errors";

// Real backend values -- do not rename (breaks save/load); the school's
// own terms ("Class Arm", "Subject Schedule") are display-only labels.
const ATTENDANCE_BASED_ON_OPTIONS = ["Student Group", "Course Schedule"];
const ATTENDANCE_BASED_ON_LABELS = {
  "Student Group": "Class Arm",
  "Course Schedule": "Subject Schedule",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student: "",
  from_date: todayStr(),
  to_date: todayStr(),
  attendance_based_on: "Student Group",
  student_group: "",
  course_schedule: "",
  mark_as_present: false,
  reason: "",
};

function buildForm(record) {
  if (!record) return EMPTY;
  return {
    student: record.student || "",
    from_date: record.from_date || todayStr(),
    to_date: record.to_date || todayStr(),
    attendance_based_on: record.attendance_based_on || "Student Group",
    student_group: record.student_group || "",
    course_schedule: record.course_schedule || "",
    mark_as_present: Boolean(record.mark_as_present),
    reason: record.reason || "",
  };
}

// Pure calendar-day count -- date_diff(to_date, from_date) + 1, mirroring
// half of get_number_of_leave_days() (the other half, subtracting the
// school's Holiday List days, is a live DB query and isn't replicated
// here -- see the note under the field).
function rawDayCount(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  const days = Math.round((to - from) / 86400000) + 1;
  return days >= 0 ? days : null;
}

export default function StudentLeaveApplicationForm({ record, onSave }) {
  const [form, setForm] = useState(() => buildForm(record));
  const [saving, setSaving] = useState(false);

  const [studentOptions, setStudentOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [courseScheduleOptions, setCourseScheduleOptions] = useState([]);

  useEffect(() => {
    setForm(buildForm(record));
  }, [record]);

  useEffect(() => {
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
  }, []);

  // Mirrors the real client script exactly: on student change, Desk
  // fetches this student's own Student Group Student rows and filters
  // BOTH student_group and course_schedule options to that list.
  useEffect(() => {
    if (!form.student) {
      setStudentGroupOptions([]);
      setCourseScheduleOptions([]);
      return;
    }
    getStudentGroupsForStudent(form.student)
      .then((r) => setStudentGroupOptions(r || []))
      .catch((err) => toast.error(getErrorMessage(err)));
    getCourseSchedulesForStudent(form.student)
      .then((r) => setCourseScheduleOptions(r || []))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [form.student]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const usingStudentGroup = form.attendance_based_on === "Student Group";
  const days = rawDayCount(form.from_date, form.to_date);
  const dateOutOfOrder = form.from_date && form.to_date && new Date(form.to_date) < new Date(form.from_date);

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.student || !form.from_date || !form.to_date
      || (usingStudentGroup && !form.student_group)
      || (!usingStudentGroup && !form.course_schedule)
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (dateOutOfOrder) {
      toast.error("From Date cannot be later than To Date.");
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
          <CardTitle className="text-base">Student Leave Application Details</CardTitle>
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
              <Label>From Date <span className="text-destructive">*</span></Label>
              <Input
                type="date" required
                value={form.from_date}
                onChange={(e) => upd("from_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date <span className="text-destructive">*</span></Label>
              <Input
                type="date" required
                value={form.to_date}
                onChange={(e) => upd("to_date", e.target.value)}
              />
            </div>

            {dateOutOfOrder && (
              <p className="text-xs text-destructive sm:col-span-2 lg:col-span-3 -mt-2">
                From Date cannot be later than To Date.
              </p>
            )}

            {days !== null && !dateOutOfOrder && (
              <div className="sm:col-span-2 lg:col-span-3 -mt-2">
                <p className="text-xs text-muted-foreground">
                  Raw days in range: {days} (holidays on the school's Holiday List are excluded automatically when saved, so the real Total Leave Days may be lower)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Attendance Based On</Label>
              <Select value={form.attendance_based_on} onValueChange={(v) => upd("attendance_based_on", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_BASED_ON_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{ATTENDANCE_BASED_ON_LABELS[o]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {usingStudentGroup ? (
              <div className="space-y-2">
                <Label>Class Arm <span className="text-destructive">*</span></Label>
                <Select
                  value={form.student_group}
                  onValueChange={(v) => upd("student_group", v)}
                  disabled={!form.student}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.student ? "Select class arm" : "Select a student first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentGroupOptions.map((g) => (
                      <SelectItem key={g.name} value={g.name}>{g.student_group_name || g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Only Class Arms this Student belongs to are shown.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Subject Schedule <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={form.course_schedule}
                  onChange={(v) => upd("course_schedule", v)}
                  options={courseScheduleOptions}
                  displayField="title"
                  placeholder={form.student ? "Search subject schedule..." : "Select a student first"}
                  label="subject schedule"
                  disabled={!form.student}
                  showId
                />
                <p className="text-xs text-muted-foreground">
                  Only Subject Schedules for this Student's own Class Arms are shown.
                </p>
              </div>
            )}

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.mark_as_present}
                  onChange={(e) => upd("mark_as_present", e.target.checked)}
                />
                <span className="text-sm">Mark as Present</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Check this to mark the student as present in case the student is not attending the institute to participate or represent the institute in any event.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Reason</Label>
              <textarea
                className="input min-h-20 w-full"
                value={form.reason}
                onChange={(e) => upd("reason", e.target.value)}
                placeholder="Optional reason"
              />
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
          {record ? "Update Leave Application" : "Create Leave Application"}
        </Button>
      </div>
    </form>
  );
}

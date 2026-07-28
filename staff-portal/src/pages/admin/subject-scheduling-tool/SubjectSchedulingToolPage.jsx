import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
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
  getStudentGroups,
  getInstructors,
  getCourses,
  getRooms,
} from "@/services/subjectScheduleService";
import { scheduleSubjectCourse } from "@/services/subjectSchedulingToolService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

// Same real palette + values as Subject Schedule's own form -- pending
// the shared saturated-color fix, both should move to it together.
const CLASS_SCHEDULE_COLORS = [
  "blue", "green", "red", "orange", "yellow", "teal",
  "violet", "cyan", "amber", "pink", "purple",
];
const COLOR_SWATCH_HEX = {
  blue: "#EDF6FD", green: "#E4F5E9", red: "#FFF0F0", orange: "#FFF1E7",
  yellow: "#FFF7D3", teal: "#E6F7F4", violet: "#F5F2FF", cyan: "#E0F8FF",
  amber: "#FCF3CF", pink: "#FEEEF8", purple: "#F9F0FF",
};

// Exact order/labels from course_scheduling_tool.js's own MultiCheck.
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student_group: "",
  course: "",
  program: "",
  academic_year: "",
  academic_term: "",
  instructor: "",
  room: "",
  from_time: "",
  to_time: "",
  course_start_date: todayStr(),
  course_end_date: "",
  reschedule: 0,
  class_schedule_color: "blue",
};

export default function SubjectSchedulingToolPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [selectedDays, setSelectedDays] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  useEffect(() => {
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
    getInstructors().then((r) => setInstructorOptions(r || [])).catch(() => {});
    getCourses().then((r) => setCourseOptions(r || [])).catch(() => {});
    getRooms().then((r) => setRoomOptions(r || [])).catch(() => {});
  }, []);

  const selectedGroup = studentGroupOptions.find((g) => g.name === form.student_group);
  const isCourseLocked = selectedGroup?.group_based_on === "Course";

  // Mirrors course_scheduling_tool.js's setup(): frm.add_fetch('student_group',
  // 'program'/'course'/'academic_year'/'academic_term', ...) -- pre-fills
  // these from the selected Class Arm the moment it changes. Unlike
  // Course Schedule's own form, the real Scheduling Tool script does NOT
  // apply any set_query filter on instructor or course -- only this
  // auto-fetch. Confirmed by reading the actual file; not assumed.
  useEffect(() => {
    if (!selectedGroup) return;
    setForm((p) => ({
      ...p,
      program: selectedGroup.program || "",
      academic_year: selectedGroup.academic_year || "",
      academic_term: selectedGroup.academic_term || "",
      course: selectedGroup.group_based_on === "Course"
        ? (selectedGroup.course || "")
        : p.course,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleDay(day) {
    setSelectedDays((p) => (p.includes(day) ? p.filter((d) => d !== day) : [...p, day]));
  }

  function toggleAllDays() {
    setSelectedDays((p) => (p.length === DAYS.length ? [] : [...DAYS]));
  }

  // Friendly client-side pre-checks. The real schedule_course() only
  // tolerates OverlapError per-date (see backend comment) -- any other
  // validation failure (bad time order, missing fields) raises uncaught
  // and aborts the whole run, so these are mirrored here to prevent ever
  // triggering that, not just for UX polish.
  const timeOutOfOrder = Boolean(
    form.from_time && form.to_time && form.from_time > form.to_time,
  );
  const dateOutOfOrder = Boolean(
    form.course_start_date && form.course_end_date &&
    form.course_start_date > form.course_end_date,
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);

    if (
      !form.student_group || !form.course || !form.instructor || !form.room ||
      !form.from_time || !form.to_time || !form.course_start_date || !form.course_end_date
    ) {
      toast.error("Class Arm, Subject, Teacher, Classroom, From/To Time, and Start/End Date are required.");
      return;
    }
    if (!selectedDays.length) {
      toast.error("Select at least one day to schedule the subject.");
      return;
    }
    if (timeOutOfOrder) {
      toast.error("From Time cannot be later than To Time.");
      return;
    }
    if (dateOutOfOrder) {
      toast.error("Subject Start Date cannot be later than Subject End Date.");
      return;
    }

    setSubmitting(true);
    try {
      const r = await scheduleSubjectCourse(form, selectedDays);
      setResult(r);
      const created = r?.course_schedules?.length || 0;
      if (created) {
        toast.success(`${created} subject schedule${created === 1 ? "" : "s"} created`);
      } else {
        toast.error("No subject schedules were created — see the results below.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Subject Scheduling Tool"
        description="Bulk-generate Subject Schedules for a Class Arm across a date range and selected days of the week."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Class Arm &amp; Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Class Arm <span className="text-destructive">*</span>
                </Label>
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
                <Label>
                  Subject <span className="text-destructive">*</span>
                </Label>
                {isCourseLocked ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.course || "—"}
                  </div>
                ) : (
                  <SearchableSelect
                    value={form.course}
                    onChange={(v) => upd("course", v)}
                    options={courseOptions}
                    displayField="course_name"
                    placeholder="Search subject..."
                    label="subject"
                  />
                )}
                {isCourseLocked && (
                  <p className="text-xs text-muted-foreground">
                    This Class Arm is Subject-based — Subject is fixed to its configured Subject.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {form.program || "—"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Academic Year</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {form.academic_year || "—"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Academic Term</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {form.academic_term || "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Teacher &amp; Classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Teacher <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  value={form.instructor}
                  onChange={(v) => upd("instructor", v)}
                  options={instructorOptions}
                  displayField="instructor_name"
                  placeholder="Search teacher..."
                  label="teacher"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Classroom <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  value={form.room}
                  onChange={(v) => upd("room", v)}
                  options={roomOptions}
                  displayField="room_name"
                  placeholder="Search classroom..."
                  label="classroom"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  From Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  required
                  value={form.from_time}
                  onChange={(e) => upd("from_time", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  To Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  required
                  value={form.to_time}
                  onChange={(e) => upd("to_time", e.target.value)}
                />
              </div>

              <div />

              <div className="space-y-2">
                <Label>
                  Subject Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.course_start_date}
                  onChange={(e) => upd("course_start_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Subject End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.course_end_date}
                  onChange={(e) => upd("course_end_date", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The end date itself is not included in the generated schedules.
                </p>
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.reschedule === 1}
                    onChange={(e) => upd("reschedule", e.target.checked ? 1 : 0)}
                  />
                  <span className="text-sm">Reschedule (replace existing schedules in range)</span>
                </label>
              </div>
            </div>

            {timeOutOfOrder && (
              <p className="mt-4 text-xs text-destructive">From Time cannot be later than To Time.</p>
            )}
            {dateOutOfOrder && (
              <p className="mt-4 text-xs text-destructive">Subject Start Date cannot be later than Subject End Date.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Days of the Week</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selectedDays.length === DAYS.length}
                onChange={toggleAllDays}
              />
              Select All
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Select value={form.class_schedule_color} onValueChange={(v) => upd("class_schedule_color", v)}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SCHEDULE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span
                className="h-9 w-9 shrink-0 rounded-md border"
                style={{ backgroundColor: COLOR_SWATCH_HEX[form.class_schedule_color] }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CalendarClock className="mr-2 h-4 w-4" />
            Schedule Subject
          </Button>
        </div>
      </form>

      {result && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.course_schedules?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--success)" }} />
                  {result.course_schedules.length} schedule{result.course_schedules.length === 1 ? "" : "s"} created
                </p>
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-1.5 text-left font-medium">Name</th>
                        <th className="px-3 py-1.5 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.course_schedules.map((c) => (
                        <tr
                          key={c.name}
                          className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                          onClick={() => navigate(`/dashboard/subject-schedule/${encodeURIComponent(c.name)}`)}
                        >
                          <td className="px-3 py-1.5 font-medium text-primary">{c.name}</td>
                          <td className="px-3 py-1.5">{fmtDate(c.schedule_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate(`/dashboard/subject-schedule?student_group=${encodeURIComponent(form.student_group)}`)}
                >
                  View in Subject Schedule list
                </Button>
              </div>
            )}

            {result.course_schedules_errors?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {result.course_schedules_errors.length} date{result.course_schedules_errors.length === 1 ? "" : "s"} skipped due to a scheduling conflict
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.course_schedules_errors.map((d) => fmtDate(d)).join(", ")}
                </p>
              </div>
            )}

            {form.reschedule === 1 && result.rescheduled?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {result.rescheduled.length} existing schedule{result.rescheduled.length === 1 ? "" : "s"} replaced.
              </p>
            )}

            {form.reschedule === 1 && result.reschedule_errors?.length > 0 && (
              <p className="text-sm text-destructive">
                {result.reschedule_errors.length} existing schedule{result.reschedule_errors.length === 1 ? "" : "s"} could not be removed while rescheduling.
              </p>
            )}

            {!result.course_schedules?.length && !result.course_schedules_errors?.length && (
              <p className="text-sm text-muted-foreground">No schedules were created.</p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

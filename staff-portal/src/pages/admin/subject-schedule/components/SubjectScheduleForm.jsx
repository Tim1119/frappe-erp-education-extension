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
  getStudentGroups,
  getInstructors,
  getRooms,
  getInstructorsForStudentGroup,
  getCoursesForProgram,
  getAcademicTermBounds,
  getAcademicYearBounds,
} from "@/services/subjectScheduleService";

// Real options + hex values from course_schedule.py's set_hex_color() --
// "color" itself is never user-editable (see the field-mapping note
// below), only the named class_schedule_color select is.
const CLASS_SCHEDULE_COLORS = [
  "blue", "green", "red", "orange", "yellow", "teal",
  "violet", "cyan", "amber", "pink", "purple",
];
const COLOR_SWATCH_HEX = {
  blue: "#EDF6FD", green: "#E4F5E9", red: "#FFF0F0", orange: "#FFF1E7",
  yellow: "#FFF7D3", teal: "#E6F7F4", violet: "#F5F2FF", cyan: "#E0F8FF",
  amber: "#FCF3CF", pink: "#FEEEF8", purple: "#F9F0FF",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Frappe Time fields serialize as "HH:MM:SS" -- <input type="time">
// only accepts "HH:MM".
function toTimeInput(t) {
  return t ? String(t).slice(0, 5) : "";
}

const EMPTY = {
  student_group: "",
  instructor: "",
  course: "",
  schedule_date: todayStr(),
  room: "",
  from_time: "",
  to_time: "",
  class_schedule_color: "blue",
};

function buildForm(schedule) {
  if (!schedule) return EMPTY;
  return {
    student_group: schedule.student_group || "",
    instructor: schedule.instructor || "",
    course: schedule.course || "",
    schedule_date: schedule.schedule_date || todayStr(),
    room: schedule.room || "",
    from_time: toTimeInput(schedule.from_time),
    to_time: toTimeInput(schedule.to_time),
    class_schedule_color: schedule.class_schedule_color || "blue",
  };
}

export default function SubjectScheduleForm({ schedule, onSave }) {
  const [form, setForm] = useState(() => buildForm(schedule));
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(schedule);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [dateBounds, setDateBounds] = useState(null);

  // Real Desk filters (course_schedule.js's onload set_query calls) --
  // both re-derived whenever the selected Class Arm changes.
  const [assignedInstructorOptions, setAssignedInstructorOptions] = useState([]);
  const [programCourseOptions, setProgramCourseOptions] = useState([]);

  useEffect(() => {
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
    getInstructors().then((r) => setInstructorOptions(r || [])).catch(() => {});
    getRooms().then((r) => setRoomOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setForm(buildForm(schedule));
  }, [schedule]);

  const selectedGroup = studentGroupOptions.find((g) => g.name === form.student_group);
  const isCourseLocked = selectedGroup?.group_based_on === "Course";

  // Mirrors course_schedule.js's onload set_query('instructor', ...): only
  // restrict to the Class Arm's own assigned teachers (Student Group
  // Instructor child table) if it actually has any assigned -- otherwise
  // fall back to the full teacher list, matching Desk's "else return" (no
  // filter applied) rather than showing an empty dropdown.
  useEffect(() => {
    if (!form.student_group) {
      setAssignedInstructorOptions([]);
      return;
    }
    getInstructorsForStudentGroup(form.student_group)
      .then((r) => setAssignedInstructorOptions(r || []))
      .catch(() => setAssignedInstructorOptions([]));
  }, [form.student_group]);

  const teacherOptions = assignedInstructorOptions.length ? assignedInstructorOptions : instructorOptions;

  // Mirrors course_schedule.js's onload set_query('course', ...), which
  // calls program_enrollment.get_program_courses() filtered by the Class
  // Arm's own Program -- real Desk behavior shows NO course options at
  // all until a Program is known, so there is no unfiltered fallback here
  // (unlike the teacher filter above).
  useEffect(() => {
    if (!selectedGroup?.program) {
      setProgramCourseOptions([]);
      return;
    }
    getCoursesForProgram(selectedGroup.program)
      .then((r) => setProgramCourseOptions(r || []))
      .catch(() => setProgramCourseOptions([]));
  }, [selectedGroup?.program]);

  // course_schedule.py's validate_course(): if the Class Arm's own Group
  // Based On is "Course", the Subject field is silently forced to that
  // Class Arm's configured Subject on every save (create or edit) --
  // mirror that here so the form never shows a value that would just get
  // overwritten server-side.
  useEffect(() => {
    if (isCourseLocked && selectedGroup?.course && form.course !== selectedGroup.course) {
      setForm((p) => ({ ...p, course: selectedGroup.course }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // validate_date(): schedule_date must fall within the Class Arm's
  // Academic Term dates, or its Academic Year dates if no term is set.
  useEffect(() => {
    if (!selectedGroup) {
      setDateBounds(null);
      return;
    }
    if (selectedGroup.academic_term) {
      getAcademicTermBounds(selectedGroup.academic_term)
        .then((r) => {
          setDateBounds(
            r?.term_start_date && r?.term_end_date
              ? { start: r.term_start_date, end: r.term_end_date, source: "Academic Term" }
              : null,
          );
        })
        .catch(() => setDateBounds(null));
    } else if (selectedGroup.academic_year) {
      getAcademicYearBounds(selectedGroup.academic_year)
        .then((r) => {
          setDateBounds(
            r?.year_start_date && r?.year_end_date
              ? { start: r.year_start_date, end: r.year_end_date, source: "Academic Year" }
              : null,
          );
        })
        .catch(() => setDateBounds(null));
    } else {
      setDateBounds(null);
    }
  }, [selectedGroup]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Friendly client-side pre-checks mirroring the controller's own
  // validate_time() and validate_date() -- the real validate() still runs
  // server-side as the source of truth. validate_overlap() (conflict
  // checking against other Course Schedules/Assessment Plans for the same
  // Class Arm/Teacher/Classroom) is NOT mirrored here -- it's a live,
  // cross-doctype SQL time-range query, the same judgment call already
  // made for Class/Subject Enrollment's own duplicate checks.
  const timeOutOfOrder = Boolean(
    form.from_time && form.to_time && form.from_time > form.to_time,
  );
  const dateOutOfBounds = Boolean(
    dateBounds &&
    form.schedule_date &&
    (form.schedule_date < dateBounds.start || form.schedule_date > dateBounds.end),
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.student_group || !form.instructor || !form.course || !form.room || !form.from_time || !form.to_time) {
      toast.error("Class Arm, Teacher, Subject, Classroom, From Time, and To Time are required.");
      return;
    }
    if (timeOutOfOrder) {
      toast.error("From Time cannot be later than To Time.");
      return;
    }
    if (dateOutOfBounds) {
      toast.error(
        `Schedule Date must fall within the Class Arm's ${dateBounds.source} (${dateBounds.start} to ${dateBounds.end}).`,
      );
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
          <CardTitle className="text-base">Subject Schedule Details</CardTitle>
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
                Teacher <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                value={form.instructor}
                onChange={(v) => upd("instructor", v)}
                options={teacherOptions}
                displayField="instructor_name"
                placeholder="Search teacher..."
                label="teacher"
              />
              {form.student_group && assignedInstructorOptions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Showing only teachers assigned to this Class Arm.
                </p>
              )}
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
                  options={programCourseOptions}
                  displayField="course_name"
                  placeholder={selectedGroup?.program ? "Search subject..." : "Select a class arm first"}
                  label="subject"
                  disabled={!selectedGroup?.program}
                />
              )}
              {isCourseLocked && (
                <p className="text-xs text-muted-foreground">
                  This Class Arm is Subject-based — Subject is fixed to its configured Subject.
                </p>
              )}
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

            <div className="space-y-2">
              <Label>Schedule Date</Label>
              <Input
                type="date"
                value={form.schedule_date}
                onChange={(e) => upd("schedule_date", e.target.value)}
              />
            </div>

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

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Select value={form.class_schedule_color} onValueChange={(v) => upd("class_schedule_color", v)}>
                  <SelectTrigger>
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
                  title="Preview of the resulting schedule color"
                />
              </div>
            </div>
          </div>

          {timeOutOfOrder && (
            <p className="mt-4 text-xs text-destructive">
              From Time cannot be later than To Time.
            </p>
          )}

          {dateOutOfBounds && (
            <p className="mt-4 text-xs text-destructive">
              Schedule Date must fall within the Class Arm's {dateBounds.source} ({dateBounds.start} to {dateBounds.end}).
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Subject Schedule" : "Create Subject Schedule"}
        </Button>
      </div>
    </form>
  );
}

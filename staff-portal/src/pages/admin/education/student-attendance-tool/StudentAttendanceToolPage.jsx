import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CalendarCheck, AlertTriangle, CheckCheck, XCircle, CheckCircle2 } from "lucide-react";
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
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentGroupDetails,
  getAcademicYearBounds,
  getCourseScheduleDetails,
  getStudentAttendanceRecords,
  markAttendance,
  getStudentGroups,
  getCourseSchedules,
} from "@/services/studentAttendanceToolService";
import { getErrorMessage } from "@/utils/errors";

const BASED_ON_OPTIONS = ["Student Group", "Course Schedule"];
const BASED_ON_LABELS = { "Student Group": "Class Arm", "Course Schedule": "Subject Schedule" };
const GROUP_BASED_ON_OPTIONS = ["Batch", "Course", "Activity"];
const GROUP_BASED_ON_LABELS = { Batch: "Batch", Course: "Subject", Activity: "Activity" };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1) -- confirmed
// from the real JSON, same pattern as Subject Scheduling Tool. Real
// roster + save logic both live OUTSIDE this doctype's own controller
// (which is empty): the roster comes from this doctype's own
// get_student_attendance_records(), the actual bulk-save comes from
// education.education.api.mark_attendance() -- both reused directly via
// thin wrappers, not reimplemented (see student_attendance_tool_api.py).
//
// Real UI is BINARY ONLY (Present/Absent checkbox) -- confirmed from the
// real client script's StudentsEditor, which only ever builds
// students_present/students_absent lists. There is no Leave option
// anywhere in this tool's real UI (Leave only ever gets set via Student
// Leave Application's own mark_as_present flow, a separate mechanism) --
// building a 3rd option here would be inventing UI Desk doesn't have.
//
// Real atomicity: mark_attendance() has exactly one frappe.db.commit(),
// after both loops finish, and no per-student try/except anywhere in the
// call chain -- so ANY student's validation failure (duplicate, holiday,
// outside Academic Year bounds, etc.) aborts the WHOLE batch. Genuinely
// all-or-nothing, not partial-success-tolerant.
export default function StudentAttendanceToolPage() {
  const [searchParams] = useSearchParams();
  const urlCourseSchedule = searchParams.get("course_schedule") || "";

  const [basedOn, setBasedOn] = useState(urlCourseSchedule ? "Course Schedule" : "Student Group");
  const [groupBasedOn, setGroupBasedOn] = useState("Batch"); // real fieldname: group_based_on
  const [studentGroup, setStudentGroup] = useState("");
  const [courseSchedule, setCourseSchedule] = useState(urlCourseSchedule);
  const [date, setDate] = useState(todayStr());

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [courseScheduleOptions, setCourseScheduleOptions] = useState([]);

  const [sgDerived, setSgDerived] = useState({ academic_year: "", academic_term: "" });
  const [yearBounds, setYearBounds] = useState({});
  const [csDerived, setCsDerived] = useState({ student_group: "", schedule_date: "", course: "" });

  const [roster, setRoster] = useState([]);
  const [checkedMap, setCheckedMap] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Real Desk behavior after a successful submit: it just re-runs the same
  // roster fetch, which re-populates the grid from the records it just
  // created -- so the checkboxes end up looking unchanged, not because
  // anything was deliberately preserved, just as a side effect. That reads
  // as "nothing happened." Deliberately diverging from that here: keep the
  // Class Arm/Date/Subject Schedule selection (a teacher marking several
  // classes for the same date shouldn't have to re-pick it), but reset the
  // per-student checks to unchecked and show a persistent confirmation of
  // what was actually saved.
  const [lastResult, setLastResult] = useState(null); // { present, absent } | null

  const isCourseSchedule = basedOn === "Course Schedule";
  const effectiveStudentGroup = isCourseSchedule ? csDerived.student_group : studentGroup;
  const effectiveDate = isCourseSchedule ? csDerived.schedule_date : date;
  const showRoster = isCourseSchedule ? Boolean(courseSchedule) : Boolean(studentGroup && date);

  useEffect(() => {
    getCourseSchedules().then((r) => setCourseScheduleOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    getStudentGroups(groupBasedOn).then((r) => setStudentGroupOptions(r || [])).catch(() => {});
  }, [groupBasedOn]);

  function switchBasedOn(v) {
    setBasedOn(v);
    if (v === "Student Group") setCourseSchedule("");
    else setStudentGroup("");
  }

  useEffect(() => {
    if (!studentGroup) {
      setSgDerived({ academic_year: "", academic_term: "" });
      setYearBounds({});
      return;
    }
    getStudentGroupDetails(studentGroup)
      .then((d) => {
        if (!d) return;
        setSgDerived({ academic_year: d.academic_year || "", academic_term: d.academic_term || "" });
        if (d.academic_year) {
          getAcademicYearBounds(d.academic_year).then(setYearBounds).catch(() => {});
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [studentGroup]);

  useEffect(() => {
    if (!courseSchedule) {
      setCsDerived({ student_group: "", schedule_date: "", course: "" });
      return;
    }
    getCourseScheduleDetails(courseSchedule)
      .then((d) => {
        if (!d) return;
        setCsDerived({
          student_group: d.student_group || "",
          schedule_date: d.schedule_date || "",
          course: d.course || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [courseSchedule]);

  async function loadRoster() {
    setLastResult(null); // new selection context -- any prior "just saved" banner is now stale
    if (!showRoster) {
      setRoster([]);
      return;
    }
    try {
      setLoadingRoster(true);
      const r = await getStudentAttendanceRecords({
        based_on: basedOn,
        date: isCourseSchedule ? undefined : date,
        student_group: isCourseSchedule ? undefined : studentGroup,
        course_schedule: isCourseSchedule ? courseSchedule : undefined,
      });
      const list = r || [];
      setRoster(list);
      const initial = {};
      for (const s of list) initial[s.student] = s.status === "Present";
      setCheckedMap(initial);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingRoster(false);
    }
  }

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basedOn, studentGroup, courseSchedule, date]);

  const dateInFuture = !isCourseSchedule && date && date > todayStr();
  const dateOutsideYear = !isCourseSchedule && date && yearBounds.year_start_date && yearBounds.year_end_date
    && (date < yearBounds.year_start_date || date > yearBounds.year_end_date);

  function toggleAll(present) {
    const next = {};
    for (const s of roster) next[s.student] = present;
    setCheckedMap(next);
    setLastResult(null); // user is actively re-marking -- the old confirmation no longer applies
  }

  function toggleOne(student, checked) {
    setCheckedMap((p) => ({ ...p, [student]: checked }));
    setLastResult(null);
  }

  const presentCount = roster.filter((s) => checkedMap[s.student]).length;
  const absentCount = roster.length - presentCount;

  async function handleConfirmSubmit() {
    setConfirmOpen(false);
    const studentsPresent = roster.filter((s) => checkedMap[s.student]).map((s) => ({ student: s.student, student_name: s.student_name }));
    const studentsAbsent = roster.filter((s) => !checkedMap[s.student]).map((s) => ({ student: s.student, student_name: s.student_name }));

    setSaving(true);
    try {
      await markAttendance({
        studentsPresent,
        studentsAbsent,
        studentGroup: isCourseSchedule ? undefined : studentGroup,
        courseSchedule: isCourseSchedule ? courseSchedule : undefined,
        date: isCourseSchedule ? undefined : date,
      });
      const result = { present: studentsPresent.length, absent: studentsAbsent.length };
      toast.success(`Attendance marked: ${result.present} present, ${result.absent} absent.`);
      // Deliberately NOT calling loadRoster() here -- that would refetch
      // and re-show the exact checked pattern that was just saved (real
      // Desk's own behavior), which reads as if nothing happened. Class
      // Arm/Date/Subject Schedule stay selected; only the per-student
      // checks reset, so resubmitting as-is can't silently look like a
      // no-op, and marking a different date/class right after doesn't
      // require re-picking anything.
      setCheckedMap({});
      setLastResult(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Student Attendance Tool" />

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Class Arm or Subject Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Based On</Label>
              <Select value={basedOn} onValueChange={switchBasedOn}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BASED_ON_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{BASED_ON_LABELS[o]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isCourseSchedule && (
              <div className="space-y-2">
                <Label>Group Based On</Label>
                <Select value={groupBasedOn} onValueChange={(v) => { setGroupBasedOn(v); setStudentGroup(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROUP_BASED_ON_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{GROUP_BASED_ON_LABELS[o]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isCourseSchedule ? (
              <div className="space-y-2">
                <Label>Subject Schedule <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={courseSchedule}
                  onChange={setCourseSchedule}
                  options={courseScheduleOptions}
                  displayField="title"
                  placeholder="Search subject schedule..."
                  label="subject schedule"
                  showId
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Class Arm <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={studentGroup}
                  onChange={setStudentGroup}
                  options={studentGroupOptions}
                  displayField="student_group_name"
                  placeholder="Search class arm..."
                  label="class arm"
                />
              </div>
            )}

            {!isCourseSchedule && (
              <div className="space-y-2">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            )}

            {isCourseSchedule ? (
              <>
                <div className="space-y-2">
                  <Label>Class Arm</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {csDerived.student_group || "— select a subject schedule —"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {csDerived.schedule_date || "— select a subject schedule —"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {sgDerived.academic_year || "— select a class arm —"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Academic Term</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {sgDerived.academic_term || "— select a class arm —"}
                  </div>
                </div>
              </>
            )}
          </div>

          {dateInFuture && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> Cannot mark attendance for future dates.
            </p>
          )}
          {dateOutsideYear && !dateInFuture && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Attendance cannot be marked outside of Academic Year {sgDerived.academic_year} ({yearBounds.year_start_date} to {yearBounds.year_end_date}).
            </p>
          )}
        </CardContent>
      </Card>

      {showRoster && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                Attendance
              </CardTitle>
              {roster.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(true)}>
                    <CheckCheck className="mr-2 h-4 w-4" /> Check All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(false)}>
                    <XCircle className="mr-2 h-4 w-4" /> Uncheck All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving || dateInFuture || dateOutsideYear}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark Attendance
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lastResult && (
              <div
                className="mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Attendance marked: {lastResult.present} present, {lastResult.absent} absent.
              </div>
            )}
            {loadingRoster ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : roster.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No students in {effectiveStudentGroup || "this Class Arm"}.
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {roster.map((s) => (
                    <label
                      key={s.student}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={Boolean(checkedMap[s.student])}
                        onChange={(e) => toggleOne(s.student, e.target.checked)}
                      />
                      <span className="flex-1">
                        {s.group_roll_number ? `${s.group_roll_number} - ` : ""}{s.student_name}
                        {s.status && s.status !== "Present" && (
                          <span className="ml-1 text-xs text-muted-foreground">(currently: {s.status})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Present: {presentCount} · Absent: {absentCount}. Marking again after this succeeds will fail for
                  every already-marked student (the underlying system always creates new records rather than
                  updating existing ones) -- if any student's mark can't be saved, none of this batch is saved.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Update attendance?"
        description={`Present: ${presentCount}. Absent: ${absentCount}.`}
        confirmLabel="Mark Attendance"
        variant="default"
      />
    </>
  );
}

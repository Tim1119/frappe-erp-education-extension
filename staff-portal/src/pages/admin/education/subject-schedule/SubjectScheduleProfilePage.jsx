import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CalendarClock, CalendarCheck, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getSubjectSchedule,
  deleteSubjectSchedule,
  getConnections,
} from "@/services/education/subjectScheduleService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function ConnectionLink({ label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
    >
      <span className="font-medium text-primary">{label}</span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        {count ?? "…"}
      </span>
    </button>
  );
}

function fmtTime(t) {
  return t ? String(t).slice(0, 5) : "—";
}

export default function SubjectScheduleProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [schedule, setSchedule] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getSubjectSchedule(name)
      .then(setSchedule)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  useEffect(() => {
    if (!name) return;
    getConnections(name)
      .then(setConnections)
      .catch(() => setConnections({}));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteSubjectSchedule(name);
      toast.success("Subject schedule deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/subject-schedule");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!schedule) {
    return <p className="text-muted-foreground">Subject schedule not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title={schedule.title || schedule.name}
        button={
          <div className="flex items-center gap-2">
            {/* course_schedule.js's real button only guards !frm.doc.__islocal
                (i.e. hide on an unsaved draft) -- this profile page only ever
                renders an already-saved record (loaded by name from the URL),
                so that condition is satisfied by construction and needs no
                extra check here. Navigates to the Student Attendance Tool
                placeholder route -- the real bulk-marking UI doesn't exist in
                the portal yet (separate Single doctype, its own future
                module), but the query param contract is wired correctly now. */}
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/student-attendance-tool?course_schedule=${encodeURIComponent(name)}`)}
            >
              <CalendarCheck className="mr-2 h-4 w-4" /> Mark Attendance
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/subject-schedule/${encodeURIComponent(name)}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Class Arm" value={schedule.student_group} />
              <Field label="Class" value={schedule.program} />
              <Field label="Teacher" value={schedule.instructor_name || schedule.instructor} />
              <Field label="Subject" value={schedule.course} />
              <Field label="Classroom" value={schedule.room} />
              <Field label="Schedule Date" value={fmtDate(schedule.schedule_date)} />
              <Field label="From Time" value={fmtTime(schedule.from_time)} />
              <Field label="To Time" value={fmtTime(schedule.to_time)} />
              <div>
                <p className="text-xs text-muted-foreground">Color</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: schedule.color || "#ccc" }}
                  />
                  <span className="text-sm font-medium">
                    {schedule.class_schedule_color
                      ? schedule.class_schedule_color.charAt(0).toUpperCase() + schedule.class_schedule_color.slice(1)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Attendance
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Student Attendance"
                    count={connections?.student_attendance}
                    onClick={() => navigate(`/dashboard/student-attendance?course_schedule=${encodeURIComponent(name)}`)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete schedule "${schedule.title || schedule.name}"?`}
        description="This action cannot be undone."
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, Ban, CalendarCheck, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentAttendance,
  deleteStudentAttendance,
  submitStudentAttendance,
  cancelStudentAttendance,
} from "@/services/education/studentAttendanceService";
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

function LinkField({ label, value, onClick }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <button onClick={onClick} className="text-sm font-medium text-primary hover:underline">
        {value}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Present: { bg: "var(--success-soft)", fg: "var(--success-ink)" },
    Absent: { bg: "var(--danger-soft)", fg: "var(--danger-ink)" },
    Leave: { bg: "var(--warning-soft)", fg: "var(--warning-ink)" },
  };
  const c = colors[status] || colors.Present;
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {status}
    </span>
  );
}

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
      >
        Submitted
      </span>
    );
  }
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function StudentAttendanceProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getStudentAttendance(name)
      .then(setRecord)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function handleDelete() {
    try {
      await deleteStudentAttendance(name);
      toast.success("Student attendance deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-attendance");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitStudentAttendance(name);
      toast.success("Student attendance submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelStudentAttendance(name);
      toast.success("Student attendance cancelled");
      setCancelModalOpen(false);
      setLoading(true);
      load();
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

  if (!record) {
    return <p className="text-muted-foreground">Student attendance record not found.</p>;
  }

  const isDraft = record.docstatus === 0;
  const isSubmitted = record.docstatus === 1;
  const isCancelled = record.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title={record.student_name || record.name}
        button={
          <div className="flex items-center gap-2">
            {!isCancelled && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/student-attendance/${encodeURIComponent(name)}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            {isDraft && (
              <Button onClick={() => setSubmitModalOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Submit
              </Button>
            )}
            {isSubmitted && (
              <Button variant="outline" onClick={() => setCancelModalOpen(true)}>
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            {!isSubmitted && (
              <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={record.student_name || record.student} />
              <Field label="Student Mobile Number" value={record.student_mobile_number} />
              <Field label="Class Arm" value={record.student_group} />
              <Field label="Class" value={record.link_nvfk} />
              <Field label="Subject Schedule" value={record.course_schedule} />
              <Field label="Date" value={fmtDate(record.date)} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><StatusBadge status={record.status} /></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Docstatus</p>
                <div className="mt-1"><DocStatusBadge docstatus={record.docstatus} /></div>
              </div>
              {record.leave_application && (
                <LinkField
                  label="Leave Application"
                  value={record.leave_application}
                  onClick={() => navigate(`/dashboard/student-leave-application/${encodeURIComponent(record.leave_application)}`)}
                />
              )}
              {record.amended_from && <Field label="Amended From" value={record.amended_from} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Real Desk dashboard config (student_attendance_dashboard.py)
                lists these two under a plain "reports" group -- no count,
                no working filter pass-through, same treatment already
                used for Assessment Plan/Result's own report links. */}
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate("/dashboard/student-monthly-attendance")}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-primary">Student Monthly Attendance Sheet</span>
              </button>
              <button
                onClick={() => navigate("/dashboard/student-batch-attendance")}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-primary">Student Batch-Wise Attendance</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete attendance record for ${record.student_name || record.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit attendance record for ${record.student_name || record.name}?`}
        description="Once submitted, only Status can still be corrected -- every other field is locked."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel attendance record for ${record.student_name || record.name}?`}
        description="This marks the attendance record as cancelled."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

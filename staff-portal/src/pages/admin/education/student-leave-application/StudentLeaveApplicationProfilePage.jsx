import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, Ban, FileText, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentLeaveApplication,
  deleteStudentLeaveApplication,
  submitStudentLeaveApplication,
  cancelStudentLeaveApplication,
  getConnections,
} from "@/services/education/studentLeaveApplicationService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

// Real backend values -- do not rename (breaks save/load); the school's
// own terms ("Class Arm", "Subject Schedule") are display-only labels.
const ATTENDANCE_BASED_ON_LABELS = {
  "Student Group": "Class Arm",
  "Course Schedule": "Subject Schedule",
};

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

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
      >
        Approved (Submitted)
      </span>
    );
  }
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Pending (Draft)</Badge>;
}

export default function StudentLeaveApplicationProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [record, setRecord] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getStudentLeaveApplication(name)
      .then(setRecord)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!name) return;
    getConnections(name)
      .then(setConnections)
      .catch(() => setConnections({}));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteStudentLeaveApplication(name);
      toast.success("Student leave application deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-leave-application");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitStudentLeaveApplication(name);
      toast.success("Student leave application submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelStudentLeaveApplication(name);
      toast.success("Student leave application cancelled");
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
    return <p className="text-muted-foreground">Student leave application not found.</p>;
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
            {isDraft && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/student-leave-application/${encodeURIComponent(name)}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            {isDraft && (
              <Button onClick={() => setSubmitModalOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Submit (Approve)
              </Button>
            )}
            {isSubmitted && (
              <Button variant="outline" onClick={() => setCancelModalOpen(true)}>
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            {(isDraft || isCancelled) && (
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
              <FileText className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={record.student_name || record.student} />
              <Field label="From Date" value={fmtDate(record.from_date)} />
              <Field label="To Date" value={fmtDate(record.to_date)} />
              <Field label="Total Leave Days" value={record.total_leave_days} />
              <Field
                label="Attendance Based On"
                value={ATTENDANCE_BASED_ON_LABELS[record.attendance_based_on] || record.attendance_based_on}
              />
              {record.attendance_based_on === "Course Schedule" ? (
                <Field label="Subject Schedule" value={record.course_schedule} />
              ) : (
                <Field label="Class Arm" value={record.student_group} />
              )}
              <Field label="Mark as Present" value={record.mark_as_present ? "Yes" : "No"} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><DocStatusBadge docstatus={record.docstatus} /></div>
              </div>
              {record.reason && <Field label="Reason" value={record.reason} />}
              {record.amended_from && <Field label="Amended From" value={record.amended_from} />}
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
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Attendance
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Student Attendance"
                    count={connections?.student_attendance}
                    onClick={() => navigate(`/dashboard/student-attendance?leave_application=${encodeURIComponent(name)}`)}
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
        title={`Delete leave application for ${record.student_name || record.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit leave application for ${record.student_name || record.name}?`}
        description={`Submitting is the real approval step: it will mark this student's attendance as ${record.mark_as_present ? "Present" : "Leave"} for every non-holiday day from ${fmtDate(record.from_date)} to ${fmtDate(record.to_date)}, creating or updating the matching Student Attendance records automatically. No fields can be edited afterward.`}
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel leave application for ${record.student_name || record.name}?`}
        description="This also cancels every Student Attendance record that was created or updated by submitting this leave application."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

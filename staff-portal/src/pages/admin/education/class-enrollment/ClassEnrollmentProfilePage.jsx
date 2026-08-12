import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, Ban, UserPlus, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader, Avatar } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getClassEnrollment,
  deleteClassEnrollment,
  submitClassEnrollment,
  cancelClassEnrollment,
  getConnections,
} from "@/services/classEnrollmentService";
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

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    // See ClassEnrollmentsPage.jsx's DocStatusBadge for why this can't be
    // shadcn's Badge variant="success" -- themes.js's applyPreset()
    // overwrites --success with a pre-wrapped hsl(...) string, breaking
    // Tailwind's bg-success utility (double-wraps into invalid CSS).
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

export default function ClassEnrollmentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [enrollment, setEnrollment] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getClassEnrollment(name)
      .then(setEnrollment)
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
      await deleteClassEnrollment(name);
      toast.success("Class enrollment deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/class-enrollment");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitClassEnrollment(name);
      toast.success("Class enrollment submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelClassEnrollment(name);
      toast.success("Class enrollment cancelled");
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

  if (!enrollment) {
    return <p className="text-muted-foreground">Class enrollment not found.</p>;
  }

  const isDraft = enrollment.docstatus === 0;
  const isSubmitted = enrollment.docstatus === 1;
  const isCancelled = enrollment.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title={
          <span className="inline-flex items-center gap-3">
            <Avatar name={enrollment.student_name} src={enrollment.image} size={40} />
            {enrollment.student_name || enrollment.name}
          </span>
        }
        button={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/class-enrollment/${encodeURIComponent(name)}/edit`)}
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
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={enrollment.student_name || enrollment.student} />
              <Field label="Class" value={enrollment.program} />
              <Field label="Academic Year" value={enrollment.academic_year} />
              <Field label="Academic Term" value={enrollment.academic_term} />
              <Field label="Enrollment Date" value={fmtDate(enrollment.enrollment_date)} />
              <Field label="Student Category" value={enrollment.student_category} />
              <Field label="Student Batch" value={enrollment.student_batch_name} />
              <Field label="School House" value={enrollment.school_house} />
              <Field label="Boarding Student" value={enrollment.boarding_student ? "Yes" : "No"} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><DocStatusBadge docstatus={enrollment.docstatus} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Subject Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(enrollment.courses || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.course}</TableCell>
                    <TableCell className="text-muted-foreground">{row.course_name || "—"}</TableCell>
                  </TableRow>
                ))}
                {(!enrollment.courses || enrollment.courses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No subjects recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {(enrollment.fees || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.fee_schedule}</TableCell>
                    <TableCell className="text-muted-foreground">{row.academic_term || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.student_category || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(row.due_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{row.amount ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {(!enrollment.fees || enrollment.fees.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No fee records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                  Enrollment
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Subject Enrollment"
                    count={connections?.course_enrollments}
                    onClick={() => navigate(`/dashboard/subject-enrollment?program_enrollment=${encodeURIComponent(name)}`)}
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
        title={`Delete enrollment for ${enrollment.student_name || enrollment.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit enrollment for ${enrollment.student_name || enrollment.name}?`}
        description="This creates the linked fee records and Subject Enrollments. Most fields can no longer be edited afterward."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel enrollment for ${enrollment.student_name || enrollment.name}?`}
        description="This removes the linked Subject Enrollments created on submit."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

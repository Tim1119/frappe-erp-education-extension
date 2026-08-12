import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentLog,
  deleteStudentLog,
} from "@/services/education/studentLogService";
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

function TypeBadge({ type }) {
  if (!type) return <span className="text-muted-foreground">—</span>;
  const variant = type === "Medical" ? "destructive" : type === "Achievement" ? "success" : type === "Academic" ? "default" : "secondary";
  return <Badge variant={variant}>{type}</Badge>;
}

export default function StudentLogProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getStudentLog(name)
      .then(setLog)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteStudentLog(name);
      toast.success("Student log deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-log");
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

  if (!log) {
    return <p className="text-muted-foreground">Student log not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={log.student_name || log.name}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/student-log/${encodeURIComponent(name)}/edit`)}
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
              <FileText className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={log.student_name || log.student} />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <div className="mt-1"><TypeBadge type={log.type} /></div>
              </div>
              <Field label="Date" value={fmtDate(log.date)} />
              <Field label="Academic Year" value={log.academic_year} />
              <Field label="Academic Term" value={log.academic_term} />
              <Field label="Class" value={log.program} />
              <Field label="Student Batch" value={log.student_batch} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log</CardTitle>
          </CardHeader>
          <CardContent>
            {log.log ? (
              <div
                className="prose prose-sm max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: log.log }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No log content.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete log for ${log.student_name || log.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

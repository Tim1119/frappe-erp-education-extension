import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentBatchName,
  deleteStudentBatchName,
} from "@/services/education/studentBatchNameService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export default function StudentBatchNameProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getStudentBatchName(name)
      .then(setBatch)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteStudentBatchName(name);
      toast.success("Student batch name deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-batch-name");
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

  if (!batch) {
    return <p className="text-muted-foreground">Student batch name not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title={batch.batch_name || batch.name}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/student-batch-name/${encodeURIComponent(name)}/edit`)}
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
              <Tag className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Batch Name" value={batch.batch_name} />
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${batch.batch_name || batch.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

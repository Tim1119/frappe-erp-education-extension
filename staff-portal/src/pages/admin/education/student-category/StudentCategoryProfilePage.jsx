import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Tag, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getStudentCategory,
  deleteStudentCategory,
  getConnections,
} from "@/services/education/studentCategoryService";
import { getErrorMessage } from "@/utils/errors";

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

export default function StudentCategoryProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [category, setCategory] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getStudentCategory(name)
      .then(setCategory)
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
      await deleteStudentCategory(name);
      toast.success("Student category deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-category");
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

  if (!category) {
    return <p className="text-muted-foreground">Student category not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title={category.category || category.name}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/student-category/${encodeURIComponent(name)}/edit`)}
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
              <Field label="Category" value={category.category} />
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
                  Fee
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Fee Structure"
                    count={connections?.fee_structures}
                    onClick={() => navigate(`/dashboard/fee-structure?student_category=${encodeURIComponent(name)}`)}
                  />
                  <ConnectionLink
                    label="Fee Schedule"
                    count={connections?.fee_schedules}
                    onClick={() => navigate(`/dashboard/fee-schedule?student_category=${encodeURIComponent(name)}`)}
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
        title={`Delete ${category.category || category.name}?`}
        description="This action cannot be undone. Review any linked records before deleting."
      />
    </>
  );
}

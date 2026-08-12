import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAssessmentCriteria, deleteAssessmentCriteria } from "@/services/assessmentCriteriaService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

// No Connections card here -- confirmed via both real mechanisms: the
// JSON has no "links" array at all, and there's no
// assessment_criteria_dashboard.py file either. Other doctypes (Assessment
// Plan Criteria, the child table) reference this only as a Link *value*
// inside their own rows, which isn't a navigable Frappe Connection.
export default function AssessmentCriteriaProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [criteria, setCriteria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getAssessmentCriteria(name)
      .then(setCriteria)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteAssessmentCriteria(name);
      toast.success("Assessment criteria deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/assessment-criteria");
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

  if (!criteria) {
    return <p className="text-muted-foreground">Assessment criteria not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={criteria.assessment_criteria || criteria.name}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/assessment-criteria/${encodeURIComponent(name)}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assessment Criteria" value={criteria.assessment_criteria} />
            <Field label="Assessment Criteria Group" value={criteria.assessment_criteria_group} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${criteria.assessment_criteria || criteria.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

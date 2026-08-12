import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, ClipboardList, Link2, Folder, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getAssessmentGroup,
  getAssessmentGroups,
  deleteAssessmentGroup,
  getConnections,
} from "@/services/assessmentGroupService";
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

export default function AssessmentGroupProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [group, setGroup] = useState(null);
  const [children, setChildren] = useState([]);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getAssessmentGroup(name)
      .then(setGroup)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  useEffect(() => {
    getAssessmentGroups()
      .then((r) => setChildren((r.rows || []).filter((g) => g.parent_assessment_group === name)))
      .catch(() => {});
  }, [name]);

  useEffect(() => {
    if (!name) return;
    getConnections(name)
      .then(setConnections)
      .catch(() => setConnections({}));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteAssessmentGroup(name);
      toast.success("Assessment group deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/assessment-group");
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

  if (!group) {
    return <p className="text-muted-foreground">Assessment group not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={group.assessment_group_name || group.name}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/assessment-group/${encodeURIComponent(name)}/edit`)}
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
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Assessment Group Name" value={group.assessment_group_name} />
              <Field
                label="Parent Assessment Group"
                value={group.parent_assessment_group}
              />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge variant={group.is_group ? "secondary" : "outline"} className="mt-1">
                  {group.is_group ? "Group" : "Leaf"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {children.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Child Assessment Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {children.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => navigate(`/dashboard/assessment-group/${encodeURIComponent(c.name)}`)}
                    className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
                  >
                    {c.is_group ? (
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium text-primary">
                      {c.assessment_group_name || c.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  Assessment
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Assessment Plan"
                    count={connections?.assessment_plans}
                    onClick={() => navigate(`/dashboard/assessment-plan?assessment_group=${encodeURIComponent(name)}`)}
                  />
                  <ConnectionLink
                    label="Assessment Result"
                    count={connections?.assessment_results}
                    onClick={() => navigate(`/dashboard/assessment-result?assessment_group=${encodeURIComponent(name)}`)}
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
        title={`Delete ${group.assessment_group_name || group.name}?`}
        description="This action cannot be undone. A group with child assessment groups cannot be deleted until its children are removed or reassigned."
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, Ban, BarChart3, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getGradingScale,
  deleteGradingScale,
  submitGradingScale,
  cancelGradingScale,
  getConnections,
} from "@/services/gradingScaleService";
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

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) return <Badge variant="success">Submitted</Badge>;
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function GradingScaleProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [scale, setScale] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getGradingScale(name)
      .then(setScale)
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
      await deleteGradingScale(name);
      toast.success("Grading scale deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/grading-scale");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitGradingScale(name);
      toast.success("Grading scale submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelGradingScale(name);
      toast.success("Grading scale cancelled");
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

  if (!scale) {
    return <p className="text-muted-foreground">Grading scale not found.</p>;
  }

  const isDraft = scale.docstatus === 0;
  const isSubmitted = scale.docstatus === 1;
  const isCancelled = scale.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title={scale.grading_scale_name || scale.name}
        button={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/grading-scale/${encodeURIComponent(name)}/edit`)}
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Grading Scale Name" value={scale.grading_scale_name} />
              <Field label="Description" value={scale.description} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <DocStatusBadge docstatus={scale.docstatus} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Intervals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade Code</TableHead>
                  <TableHead>Threshold (%)</TableHead>
                  <TableHead>Grade Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(scale.intervals || [])
                  .slice()
                  .sort((a, b) => (b.threshold ?? 0) - (a.threshold ?? 0))
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.grade_code}</TableCell>
                      <TableCell>{row.threshold}%</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.grade_description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                {(!scale.intervals || scale.intervals.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No intervals defined.
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
                  Subject
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Subject"
                    count={connections?.subjects}
                    onClick={() => navigate(`/dashboard/subjects?default_grading_scale=${encodeURIComponent(name)}`)}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assessment
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Assessment Plan"
                    count={connections?.assessment_plans}
                    onClick={() => navigate(`/dashboard/assessment-plan?grading_scale=${encodeURIComponent(name)}`)}
                  />
                  <ConnectionLink
                    label="Assessment Result"
                    count={connections?.assessment_results}
                    onClick={() => navigate(`/dashboard/assessment-result?grading_scale=${encodeURIComponent(name)}`)}
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
        title={`Delete ${scale.grading_scale_name || scale.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit ${scale.grading_scale_name || scale.name}?`}
        description="Once submitted, intervals can no longer be edited directly."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel ${scale.grading_scale_name || scale.name}?`}
        description="This marks the grading scale as cancelled."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

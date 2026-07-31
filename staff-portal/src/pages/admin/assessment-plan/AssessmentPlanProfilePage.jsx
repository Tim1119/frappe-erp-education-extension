import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil, Trash2, CheckCircle2, Ban, ClipboardList, Link2, BarChart3, Wrench,
} from "lucide-react";
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
  getAssessmentPlan,
  deleteAssessmentPlan,
  submitAssessmentPlan,
  cancelAssessmentPlan,
  getConnections,
} from "@/services/assessmentPlanService";
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

export default function AssessmentPlanProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [plan, setPlan] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getAssessmentPlan(name)
      .then(setPlan)
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
      await deleteAssessmentPlan(name);
      toast.success("Assessment plan deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/assessment-plan");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitAssessmentPlan(name);
      toast.success("Assessment plan submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelAssessmentPlan(name);
      toast.success("Assessment plan cancelled");
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

  if (!plan) {
    return <p className="text-muted-foreground">Assessment plan not found.</p>;
  }

  const isDraft = plan.docstatus === 0;
  const isSubmitted = plan.docstatus === 1;
  const isCancelled = plan.docstatus === 2;
  const criteriaSum = (plan.assessment_criteria || []).reduce(
    (sum, r) => sum + (r.maximum_score || 0), 0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={plan.assessment_name || plan.name}
        button={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/assessment-plan/${encodeURIComponent(name)}/edit`)}
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
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/assessment-result-tool?assessment_plan=${encodeURIComponent(name)}&student_group=${encodeURIComponent(plan.student_group || "")}`)}
              >
                <Wrench className="mr-2 h-4 w-4" /> Assessment Result Tool
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
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Class Arm" value={plan.student_group} />
              <Field label="Assessment Group" value={plan.assessment_group} />
              <Field label="Subject" value={plan.course} />
              <Field label="Grading Scale" value={plan.grading_scale} />
              <Field label="Class" value={plan.program} />
              <Field label="Academic Year" value={plan.academic_year} />
              <Field label="Academic Term" value={plan.academic_term} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><DocStatusBadge docstatus={plan.docstatus} /></div>
              </div>
              {plan.amended_from && <Field label="Amended From" value={plan.amended_from} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Schedule Date" value={fmtDate(plan.schedule_date)} />
              <Field label="From Time" value={plan.from_time} />
              <Field label="To Time" value={plan.to_time} />
              <Field label="Classroom" value={plan.room} />
              <Field label="Examiner" value={plan.examiner_name || plan.examiner} />
              <Field label="Supervisor" value={plan.supervisor_name || plan.supervisor} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evaluate</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="Maximum Assessment Score" value={plan.maximum_assessment_score} />
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment Criteria</TableHead>
                  <TableHead>Maximum Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(plan.assessment_criteria || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.assessment_criteria}</TableCell>
                    <TableCell>{row.maximum_score}</TableCell>
                  </TableRow>
                ))}
                {(!plan.assessment_criteria || plan.assessment_criteria.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No criteria recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">
              Sum of Maximum Scores: {criteriaSum}
            </p>
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
                  Assessment
                </p>
                <div className="space-y-2">
                  <ConnectionLink
                    label="Assessment Result"
                    count={connections?.assessment_results}
                    onClick={() => navigate(`/dashboard/assessment-result?assessment_plan=${encodeURIComponent(name)}`)}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Report
                </p>
                {/* Real Desk dashboard config lists Assessment Plan Status
                    here as a "reports" link, not a count-based transaction.
                    Its own real filters (assessment_group, schedule_date)
                    don't include assessment_plan, so even Desk's own
                    route_options pass-through has no matching filter to
                    apply -- this just opens the report, unfiltered. */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/dashboard/assessment-plan-status")}
                    className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
                  >
                    <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-primary">Assessment Plan Status</span>
                  </button>
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
        title={`Delete ${plan.assessment_name || plan.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit ${plan.assessment_name || plan.name}?`}
        description="Once submitted, no fields can be edited -- you'll need to cancel the document to make any change."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel ${plan.assessment_name || plan.name}?`}
        description="This marks the assessment plan as cancelled."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

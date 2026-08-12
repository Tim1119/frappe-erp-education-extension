import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, Ban, ClipboardList, BarChart3 } from "lucide-react";
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
  getAssessmentResult,
  deleteAssessmentResult,
  submitAssessmentResult,
  cancelAssessmentResult,
} from "@/services/education/assessmentResultService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
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

export default function AssessmentResultProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getAssessmentResult(name)
      .then(setResult)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function handleDelete() {
    try {
      await deleteAssessmentResult(name);
      toast.success("Assessment result deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/assessment-result");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitAssessmentResult(name);
      toast.success("Assessment result submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelAssessmentResult(name);
      toast.success("Assessment result cancelled");
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

  if (!result) {
    return <p className="text-muted-foreground">Assessment result not found.</p>;
  }

  const isDraft = result.docstatus === 0;
  const isSubmitted = result.docstatus === 1;
  const isCancelled = result.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={result.student_name || result.name}
        button={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/assessment-result/${encodeURIComponent(name)}/edit`)}
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
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={result.student_name || result.student} />
              <Field label="Assessment Plan" value={result.assessment_plan} />
              <Field label="Class" value={result.program} />
              <Field label="Subject" value={result.course} />
              <Field label="Academic Year" value={result.academic_year} />
              <Field label="Academic Term" value={result.academic_term} />
              <Field label="Class Arm" value={result.student_group} />
              <Field label="Assessment Group" value={result.assessment_group} />
              <Field label="Grading Scale" value={result.grading_scale} />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><DocStatusBadge docstatus={result.docstatus} /></div>
              </div>
              {result.amended_from && <Field label="Amended From" value={result.amended_from} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment Criteria</TableHead>
                  <TableHead>Maximum Score</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(result.details || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.assessment_criteria}</TableCell>
                    <TableCell>{row.maximum_score}</TableCell>
                    <TableCell>{row.score}</TableCell>
                    <TableCell>{row.grade || "—"}</TableCell>
                  </TableRow>
                ))}
                {(!result.details || result.details.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No scores recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between rounded-md border bg-muted px-3 py-2 text-sm">
              <span className="font-medium">
                Total Score: {result.total_score ?? "—"} {result.maximum_score ? `/ ${result.maximum_score}` : ""}
              </span>
              <span className="font-medium">Grade: {result.grade || "—"}</span>
            </div>
            {result.comment && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Comment</p>
                <p className="text-sm">{result.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Real Desk dashboard config (assessment_result_dashboard.py)
                lists these two under a plain "reports" group -- no count,
                no filter pass-through (neither report has an
                assessment_result-shaped filter), same treatment already
                used for Assessment Plan Status on the Assessment Plan
                profile page. */}
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate("/dashboard/subject-assessment-report")}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-primary">Subject wise Assessment Report</span>
              </button>
              <button
                onClick={() => navigate("/dashboard/final-assessment-grades")}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-primary">Final Assessment Grades</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete result for ${result.student_name || result.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit result for ${result.student_name || result.name}?`}
        description="Once submitted, no fields can be edited -- you'll need to cancel the document to make any change."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel result for ${result.student_name || result.name}?`}
        description="This marks the assessment result as cancelled."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

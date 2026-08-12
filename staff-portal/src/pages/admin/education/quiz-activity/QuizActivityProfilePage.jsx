import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, ClipboardCheck } from "lucide-react";
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
import { getQuizActivity, deleteQuizActivity } from "@/services/education/quizActivityService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDateTime } from "@/utils/format";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function LinkField({ label, value, onClick }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <button onClick={onClick} className="text-sm font-medium text-primary hover:underline">
        {value}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "Pass") {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
      >
        Pass
      </span>
    );
  }
  if (status === "Fail") return <Badge variant="destructive">Fail</Badge>;
  return <Badge variant="secondary">{status || "—"}</Badge>;
}

function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") return "—";
  const total = Number(seconds);
  if (Number.isNaN(total)) return "—";
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// No Connections card -- confirmed via both real mechanisms: the JSON
// has no "links" array entries and no quiz_activity_dashboard.py file
// exists. No Edit action -- every field on the real doctype is
// set_only_once (locked forever after creation, same as Course
// Activity); Delete remains since Academics User genuinely has real
// delete permission.
export default function QuizActivityProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getQuizActivity(name)
      .then(setActivity)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteQuizActivity(name);
      toast.success("Quiz activity deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/quiz-activity");
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

  if (!activity) {
    return <p className="text-muted-foreground">Quiz activity record not found.</p>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title={`${activity.student || "Unknown Student"} — ${activity.quiz || "Quiz"}`}
        button={
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activity.student ? (
                <LinkField
                  label="Student"
                  value={activity.student}
                  onClick={() => navigate(`/dashboard/students/${encodeURIComponent(activity.student)}`)}
                />
              ) : (
                <Field label="Student" value={activity.student} />
              )}

              {activity.course ? (
                <LinkField
                  label="Subject"
                  value={activity.course}
                  onClick={() => navigate(`/dashboard/subjects/${encodeURIComponent(activity.course)}`)}
                />
              ) : (
                <Field label="Subject" value={activity.course} />
              )}

              {activity.quiz ? (
                <LinkField
                  label="Quiz"
                  value={activity.quiz}
                  onClick={() => navigate(`/dashboard/quizzes/${encodeURIComponent(activity.quiz)}`)}
                />
              ) : (
                <Field label="Quiz" value={activity.quiz} />
              )}

              {activity.enrollment ? (
                <LinkField
                  label="Subject Enrollment"
                  value={activity.enrollment}
                  onClick={() => navigate(`/dashboard/subject-enrollment/${encodeURIComponent(activity.enrollment)}`)}
                />
              ) : (
                <Field label="Subject Enrollment" value={activity.enrollment} />
              )}

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><StatusBadge status={activity.status} /></div>
              </div>

              <Field label="Score" value={activity.score} />
              <Field label="Time Taken" value={fmtDuration(activity.time_taken)} />
              <Field label="Activity Date" value={fmtDateTime(activity.activity_date)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Selected Option</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activity.result || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.question}</TableCell>
                    <TableCell className="text-muted-foreground">{row.selected_option || "—"}</TableCell>
                    <TableCell>
                      {row.quiz_result === "Correct" ? (
                        <span
                          className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
                        >
                          Correct
                        </span>
                      ) : (
                        <Badge variant="destructive">{row.quiz_result || "Wrong"}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!activity.result || activity.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No question results recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete this quiz attempt for ${activity.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

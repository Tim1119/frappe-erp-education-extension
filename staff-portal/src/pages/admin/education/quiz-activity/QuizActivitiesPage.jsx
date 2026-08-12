import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import {
  getQuizActivities,
  deleteQuizActivity,
  getStudents,
  getCourses,
  getQuizzes,
} from "@/services/education/quizActivityService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDateTime } from "@/utils/format";

const STATUS_OPTIONS = ["Pass", "Fail"];

function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") return "—";
  const total = Number(seconds);
  if (Number.isNaN(total)) return "—";
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
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

// Quiz Activity is architecturally identical to Subject Activity (Course
// Activity): every field is set_only_once, and the only real creation
// path (Course Enrollment.add_quiz_activity(), called from a whitelisted
// quiz-submission endpoint gated by has_super_access()) explicitly
// excludes every staff role -- confirmed against THIS doctype's own real
// permissions (Academics User full CRUD, Instructor read-only, no
// create/write/delete), not assumed from Course Activity's shape alone.
// List + Profile only, no Add button, no Edit action. Delete kept since
// Academics User genuinely has real delete permission.
export default function QuizActivitiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState(searchParams.get("student") || "");
  const [courseFilter, setCourseFilter] = useState(searchParams.get("course") || "");
  const [quizFilter, setQuizFilter] = useState(searchParams.get("quiz") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [studentOptions, setStudentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [quizOptions, setQuizOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getQuizActivities({
        page,
        search,
        student: studentFilter,
        course: courseFilter,
        quiz: quizFilter,
        status: statusFilter,
      });
      setRows(r.rows || []);
      setTotal(r.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStudents().then((r) => setStudentOptions((r || []).map((s) => s.name))).catch(() => {});
    getCourses().then((r) => setCourseOptions((r || []).map((c) => c.name))).catch(() => {});
    getQuizzes().then((r) => setQuizOptions((r || []).map((q) => q.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentFilter, courseFilter, quizFilter, statusFilter]);

  async function confirmDelete() {
    try {
      await deleteQuizActivity(deleteTarget.name);
      toast.success("Quiz activity deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Quiz Activity"
        description={loading ? "Loading…" : `${total} quiz attempts`}
      />

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "student", label: "Student", value: studentFilter,
            onChange: (v) => { setStudentFilter(v); setPage(1); }, options: studentOptions,
          },
          {
            key: "course", label: "Subject", value: courseFilter,
            onChange: (v) => { setCourseFilter(v); setPage(1); }, options: courseOptions,
          },
          {
            key: "quiz", label: "Quiz", value: quizFilter,
            onChange: (v) => { setQuizFilter(v); setPage(1); }, options: quizOptions,
          },
          {
            key: "status", label: "Status", value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); }, options: STATUS_OPTIONS,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden sm:table-cell">Time Taken</TableHead>
              <TableHead className="hidden sm:table-cell">Activity Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/quiz-activity/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student || "—"}</TableCell>
                <TableCell>{r.course || "—"}</TableCell>
                <TableCell>{r.quiz || "—"}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell>{r.score ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDuration(r.time_taken)}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDateTime(r.activity_date)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/quiz-activity/${encodeURIComponent(r.name)}`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState title="No quiz activity found" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pager page={page} setPage={setPage} pageSize={20} count={total} />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete this quiz attempt for ${deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

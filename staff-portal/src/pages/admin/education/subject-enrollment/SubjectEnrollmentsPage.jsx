import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import {
  getSubjectEnrollments,
  deleteSubjectEnrollment,
} from "@/services/subjectEnrollmentService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

export default function SubjectEnrollmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentFilter = searchParams.get("student") || "";
  const courseFilter = searchParams.get("course") || "";
  const programEnrollmentFilter = searchParams.get("program_enrollment") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getSubjectEnrollments({
        page,
        search,
        student: studentFilter || undefined,
        course: courseFilter || undefined,
        program_enrollment: programEnrollmentFilter || undefined,
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
    load();
  }, [page, search, studentFilter, courseFilter, programEnrollmentFilter]);

  useEffect(() => {
    reset();
  }, [studentFilter, courseFilter, programEnrollmentFilter]);

  async function confirmDelete() {
    try {
      await deleteSubjectEnrollment(deleteTarget.name);
      toast.success("Subject enrollment deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Subject Enrollments"
        description={loading ? "Loading…" : `${total} subject enrollments`}
      >
        <Button onClick={() => navigate("/dashboard/subject-enrollment/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Subject Enrollment
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
      />

      <ActiveFilterChip label="Student" value={studentFilter} onClear={() => clearParam("student")} />
      <ActiveFilterChip label="Subject" value={courseFilter} onClear={() => clearParam("course")} />
      <ActiveFilterChip label="Class Enrollment" value={programEnrollmentFilter} onClear={() => clearParam("program_enrollment")} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden sm:table-cell">Class</TableHead>
              <TableHead className="hidden sm:table-cell">Enrollment Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/subject-enrollment/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student}</TableCell>
                <TableCell>{r.course || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.program || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.enrollment_date)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/subject-enrollment/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/subject-enrollment/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="No subject enrollments found" />
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
        title={`Delete enrollment for ${deleteTarget?.student_name || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { usePagination } from "@/hooks";
import {
  getStudentAttendanceList,
  deleteStudentAttendance,
  getStudentGroups,
  getCourseSchedules,
} from "@/services/studentAttendanceService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

function StatusBadge({ status }) {
  const colors = {
    Present: { bg: "var(--success-soft)", fg: "var(--success-ink)" },
    Absent: { bg: "var(--danger-soft)", fg: "var(--danger-ink)" },
    Leave: { bg: "var(--warning-soft)", fg: "var(--warning-ink)" },
  };
  const c = colors[status] || colors.Present;
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {status}
    </span>
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

// Real Desk in_standard_filter fields: student, student_group, status.
// course_schedule isn't one of those, but it's the real incoming
// Connections link from Subject Schedule's own profile page
// (/dashboard/student-attendance?course_schedule=...), so it's honored
// here too, both as a seeded filter and a real backend filter.
export default function StudentAttendancesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentGroupFilter, setStudentGroupFilter] = useState(searchParams.get("student_group") || "");
  const [courseScheduleFilter, setCourseScheduleFilter] = useState(searchParams.get("course_schedule") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [courseScheduleOptions, setCourseScheduleOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getStudentAttendanceList({
        page,
        search,
        student_group: studentGroupFilter,
        course_schedule: courseScheduleFilter,
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
    getStudentGroups().then((r) => setStudentGroupOptions((r || []).map((g) => g.name))).catch(() => {});
    getCourseSchedules().then((r) => setCourseScheduleOptions((r || []).map((c) => c.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentGroupFilter, courseScheduleFilter, statusFilter]);

  async function confirmDelete() {
    try {
      await deleteStudentAttendance(deleteTarget.name);
      toast.success("Student attendance deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Student Attendance"
        description={loading ? "Loading…" : `${total} attendance records`}
      >
        <Button onClick={() => navigate("/dashboard/student-attendance/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Student Attendance
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "student_group", label: "Class Arm", value: studentGroupFilter,
            onChange: (v) => { setStudentGroupFilter(v); setPage(1); }, options: studentGroupOptions,
          },
          {
            key: "course_schedule", label: "Subject Schedule", value: courseScheduleFilter,
            onChange: (v) => { setCourseScheduleFilter(v); setPage(1); }, options: courseScheduleOptions,
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
              <TableHead>Class Arm</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Docstatus</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/student-attendance/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student}</TableCell>
                <TableCell>{r.student_group || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.date)}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/student-attendance/${encodeURIComponent(r.name)}`)}
                    onEdit={r.docstatus !== 2 ? () => navigate(`/dashboard/student-attendance/${encodeURIComponent(r.name)}/edit`) : undefined}
                    onDelete={r.docstatus !== 1 ? () => setDeleteTarget(r) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No attendance records found" />
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
        title={`Delete attendance record for ${deleteTarget?.student_name || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

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
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import {
  getStudentLeaveApplications,
  deleteStudentLeaveApplication,
  getClassArms,
} from "@/services/education/studentLeaveApplicationService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
      >
        Approved (Submitted)
      </span>
    );
  }
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Pending (Draft)</Badge>;
}

// Real Desk in_standard_filter is only from_date; student_group is added
// here too since it's a reasonable, functional filter (not because the
// real JSON flags it) -- same judgment call already made for other
// modules' Toolbar filters this session.
export default function StudentLeaveApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const studentFilter = searchParams.get("student") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentGroupFilter, setStudentGroupFilter] = useState(searchParams.get("student_group") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getStudentLeaveApplications({
        page,
        search,
        student: studentFilter,
        student_group: studentGroupFilter,
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
    getClassArms().then((r) => setStudentGroupOptions((r || []).map((g) => g.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentFilter, studentGroupFilter]);

  async function confirmDelete() {
    try {
      await deleteStudentLeaveApplication(deleteTarget.name);
      toast.success("Student leave application deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Student Leave Application"
        description={loading ? "Loading…" : `${total} leave applications`}
      >
        <Button onClick={() => navigate("/dashboard/student-leave-application/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Leave Application
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
        ]}
      />

      <ActiveFilterChip label="Student" value={studentFilter} onClear={() => clearParam("student")} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>From Date</TableHead>
              <TableHead>To Date</TableHead>
              <TableHead className="hidden sm:table-cell">Total Leave Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/student-leave-application/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student}</TableCell>
                <TableCell>{fmtDate(r.from_date)}</TableCell>
                <TableCell>{fmtDate(r.to_date)}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.total_leave_days ?? "—"}</TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/student-leave-application/${encodeURIComponent(r.name)}`)}
                    onEdit={r.docstatus === 0 ? () => navigate(`/dashboard/student-leave-application/${encodeURIComponent(r.name)}/edit`) : undefined}
                    onDelete={r.docstatus !== 1 ? () => setDeleteTarget(r) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No leave applications found" />
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
        title={`Delete leave application for ${deleteTarget?.student_name || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

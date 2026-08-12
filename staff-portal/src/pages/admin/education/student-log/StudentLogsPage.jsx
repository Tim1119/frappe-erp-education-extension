import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
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
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import {
  getStudentLogs,
  deleteStudentLog,
  getAcademicYears,
  getAcademicTerms,
  getPrograms,
} from "@/services/studentLogService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

const TYPE_OPTIONS = ["General", "Academic", "Medical", "Achievement"];

function TypeBadge({ type }) {
  if (!type) return <span className="text-muted-foreground">—</span>;
  const variant = type === "Medical" ? "destructive" : type === "Achievement" ? "success" : type === "Academic" ? "default" : "secondary";
  return <Badge variant={variant}>{type}</Badge>;
}

export default function StudentLogsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentFilter = searchParams.get("student") || "";

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

  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");
  const [programFilter, setProgramFilter] = useState(searchParams.get("program") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");

  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);

  useEffect(() => {
    getAcademicYears()
      .then((r) => setAcademicYearOptions((r || []).map((y) => y.name)))
      .catch(() => {});
    getPrograms()
      .then((r) => setProgramOptions((r || []).map((p) => p.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getAcademicTerms(academicYearFilter || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [academicYearFilter]);

  async function load() {
    try {
      setLoading(true);
      const r = await getStudentLogs({
        page,
        search,
        student: studentFilter || undefined,
        academic_year: academicYearFilter || undefined,
        academic_term: academicTermFilter || undefined,
        program: programFilter || undefined,
        type: typeFilter || undefined,
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
  }, [page, search, studentFilter, academicYearFilter, academicTermFilter, programFilter, typeFilter]);

  useEffect(() => {
    reset();
  }, [studentFilter, academicYearFilter, academicTermFilter, programFilter, typeFilter]);

  async function confirmDelete() {
    try {
      await deleteStudentLog(deleteTarget.name);
      toast.success("Student log deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Student Logs"
        description={loading ? "Loading…" : `${total} student logs`}
      >
        <Button onClick={() => navigate("/dashboard/student-log/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Student Log
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: TYPE_OPTIONS,
          },
          {
            key: "program",
            label: "Class",
            value: programFilter,
            onChange: setProgramFilter,
            options: programOptions,
          },
          {
            key: "academic_year",
            label: "Academic Year",
            value: academicYearFilter,
            onChange: setAcademicYearFilter,
            options: academicYearOptions,
          },
          {
            key: "academic_term",
            label: "Academic Term",
            value: academicTermFilter,
            onChange: setAcademicTermFilter,
            options: academicTermOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Student" value={studentFilter} onClear={() => clearParam("student")} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Class</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/student-log/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student || r.name}</TableCell>
                <TableCell><TypeBadge type={r.type} /></TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.date)}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.program || "—"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/student-log/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/student-log/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="No student logs found" />
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
        title={`Delete log for ${deleteTarget?.student_name || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

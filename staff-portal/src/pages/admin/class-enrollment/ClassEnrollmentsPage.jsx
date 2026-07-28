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
import { Avatar } from "@/components/shared/OriginalPrimitives";
import PageHeader from "@/components/shared/PageHeader";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import {
  getClassEnrollments,
  deleteClassEnrollment,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
} from "@/services/classEnrollmentService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    // Not shadcn's Badge variant="success" here on purpose: that variant's
    // Tailwind classes read --success expecting a raw HSL triple, but
    // themes.js's applyPreset() overwrites --success with an already-
    // wrapped hsl(...) string for the legacy inline-style consumers --
    // hsl(var(--success)) then double-wraps into invalid CSS and the
    // badge renders with no background (invisible white-on-white text).
    // The legacy tokens below are correctly pre-resolved for inline style
    // use, matching FeeSchedulePage.jsx's established StatusBadge pattern.
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

export default function ClassEnrollmentsPage() {
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

  const [programFilter, setProgramFilter] = useState(searchParams.get("program") || "");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");

  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);

  useEffect(() => {
    getPrograms()
      .then((r) => setProgramOptions((r || []).map((p) => p.name)))
      .catch(() => {});
    getAcademicYears()
      .then((r) => setAcademicYearOptions((r || []).map((y) => y.name)))
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
      const r = await getClassEnrollments({
        page,
        search,
        student: studentFilter || undefined,
        program: programFilter || undefined,
        academic_year: academicYearFilter || undefined,
        academic_term: academicTermFilter || undefined,
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
  }, [page, search, studentFilter, programFilter, academicYearFilter, academicTermFilter]);

  useEffect(() => {
    reset();
  }, [studentFilter, programFilter, academicYearFilter, academicTermFilter]);

  async function confirmDelete() {
    try {
      await deleteClassEnrollment(deleteTarget.name);
      toast.success("Class enrollment deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Class Enrollments"
        description={loading ? "Loading…" : `${total} class enrollments`}
      >
        <Button onClick={() => navigate("/dashboard/class-enrollment/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Class Enrollment
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
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
              <TableHead>Class</TableHead>
              <TableHead className="hidden sm:table-cell">Academic Year</TableHead>
              <TableHead className="hidden sm:table-cell">Enrollment Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/class-enrollment/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.student_name} src={r.image} size={34} />
                    {r.student_name || r.student}
                  </div>
                </TableCell>
                <TableCell>{r.program || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.academic_year || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.enrollment_date)}</TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/class-enrollment/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/class-enrollment/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No class enrollments found" />
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

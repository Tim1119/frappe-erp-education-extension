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
import { usePagination } from "@/hooks";
import {
  getSchoolTermResults,
  deleteSchoolTermResult,
  getAcademicYears,
  getAssessmentGroups,
} from "@/services/schoolTermResultService";
import { getErrorMessage } from "@/utils/errors";

// Real doctype: "School Term Result" (education_extension app) -- a
// normal, persisted, listable doctype (no issingle/is_submittable),
// permissioned to "System Manager" only. Every field beyond the 4 real
// reqd ones (student/assessment_group/academic_year/academic_term) is
// auto-computed by the doctype's own real before_insert() hook the
// instant a new record is created -- see school_term_result_api.py for
// the full traced computation.
export default function SchoolTermResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [assessmentGroupFilter, setAssessmentGroupFilter] = useState(searchParams.get("assessment_group") || "");
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getSchoolTermResults({
        page, search,
        academic_year: academicYearFilter,
        assessment_group: assessmentGroupFilter,
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
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getAssessmentGroups().then((r) => setAssessmentGroupOptions((r || []).map((g) => g.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, academicYearFilter, assessmentGroupFilter]);

  async function confirmDelete() {
    try {
      await deleteSchoolTermResult(deleteTarget.name);
      toast.success("School Term Result deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="School Term Result"
        description={loading ? "Loading…" : `${total} results`}
      >
        <Button onClick={() => navigate("/dashboard/school-term-result-generator/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add School Term Result
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "academic_year",
            label: "Academic Year",
            value: academicYearFilter,
            onChange: (v) => { setAcademicYearFilter(v); setPage(1); },
            options: academicYearOptions,
          },
          {
            key: "assessment_group",
            label: "Assessment Group",
            value: assessmentGroupFilter,
            onChange: (v) => { setAssessmentGroupFilter(v); setPage(1); },
            options: assessmentGroupOptions,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Assessment Group</TableHead>
              <TableHead className="hidden sm:table-cell">Academic Year</TableHead>
              <TableHead className="hidden sm:table-cell">Academic Term</TableHead>
              <TableHead className="hidden sm:table-cell">Class Arm</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_admission_id || r.student}</TableCell>
                <TableCell>{r.student_name || "—"}</TableCell>
                <TableCell>{r.assessment_group || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.academic_year || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.academic_term || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.student_group || "—"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No School Term Results found" />
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
        title={`Delete result for ${deleteTarget?.student_admission_id || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

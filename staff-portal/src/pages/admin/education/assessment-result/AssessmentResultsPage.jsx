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
  getAssessmentResults,
  deleteAssessmentResult,
  getSubmittedAssessmentPlans,
  getPrograms,
  getCourses,
  getAcademicYears,
  getAcademicTerms,
  getLeafAssessmentGroups,
  getSubmittedGradingScales,
} from "@/services/assessmentResultService";
import { getErrorMessage } from "@/utils/errors";

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

// Seven real incoming Connections link into this list: Assessment Plan,
// Class (program), Subject (course), Academic Year, Academic Term,
// Assessment Group, Grading Scale -- every one of them is honored here,
// both as a searchParams-seeded filter and a real backend filter.
export default function AssessmentResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assessmentPlanFilter, setAssessmentPlanFilter] = useState(searchParams.get("assessment_plan") || "");
  const [programFilter, setProgramFilter] = useState(searchParams.get("program") || "");
  const [courseFilter, setCourseFilter] = useState(searchParams.get("course") || "");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");
  const [assessmentGroupFilter, setAssessmentGroupFilter] = useState(searchParams.get("assessment_group") || "");
  const [gradingScaleFilter, setGradingScaleFilter] = useState(searchParams.get("grading_scale") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [assessmentPlanOptions, setAssessmentPlanOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [gradingScaleOptions, setGradingScaleOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getAssessmentResults({
        page,
        search,
        assessment_plan: assessmentPlanFilter,
        program: programFilter,
        course: courseFilter,
        academic_year: academicYearFilter,
        academic_term: academicTermFilter,
        assessment_group: assessmentGroupFilter,
        grading_scale: gradingScaleFilter,
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
    getSubmittedAssessmentPlans().then((r) => setAssessmentPlanOptions((r || []).map((p) => p.name))).catch(() => {});
    getPrograms().then((r) => setProgramOptions((r || []).map((p) => p.name))).catch(() => {});
    getCourses().then((r) => setCourseOptions((r || []).map((c) => c.name))).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getAcademicTerms().then((r) => setAcademicTermOptions((r || []).map((t) => t.name))).catch(() => {});
    getLeafAssessmentGroups().then((r) => setAssessmentGroupOptions((r || []).map((g) => g.name))).catch(() => {});
    getSubmittedGradingScales().then((r) => setGradingScaleOptions((r || []).map((g) => g.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, assessmentPlanFilter, programFilter, courseFilter, academicYearFilter, academicTermFilter, assessmentGroupFilter, gradingScaleFilter]);

  async function confirmDelete() {
    try {
      await deleteAssessmentResult(deleteTarget.name);
      toast.success("Assessment result deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Assessment Results"
        description={loading ? "Loading…" : `${total} assessment results`}
      >
        <Button onClick={() => navigate("/dashboard/assessment-result/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Assessment Result
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "assessment_plan", label: "Assessment Plan", value: assessmentPlanFilter,
            onChange: (v) => { setAssessmentPlanFilter(v); setPage(1); }, options: assessmentPlanOptions,
          },
          {
            key: "program", label: "Class", value: programFilter,
            onChange: (v) => { setProgramFilter(v); setPage(1); }, options: programOptions,
          },
          {
            key: "course", label: "Subject", value: courseFilter,
            onChange: (v) => { setCourseFilter(v); setPage(1); }, options: courseOptions,
          },
          {
            key: "academic_year", label: "Academic Year", value: academicYearFilter,
            onChange: (v) => { setAcademicYearFilter(v); setPage(1); }, options: academicYearOptions,
          },
          {
            key: "academic_term", label: "Academic Term", value: academicTermFilter,
            onChange: (v) => { setAcademicTermFilter(v); setPage(1); }, options: academicTermOptions,
          },
          {
            key: "assessment_group", label: "Assessment Group", value: assessmentGroupFilter,
            onChange: (v) => { setAssessmentGroupFilter(v); setPage(1); }, options: assessmentGroupOptions,
          },
          {
            key: "grading_scale", label: "Grading Scale", value: gradingScaleFilter,
            onChange: (v) => { setGradingScaleFilter(v); setPage(1); }, options: gradingScaleOptions,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Assessment Plan</TableHead>
              <TableHead className="hidden sm:table-cell">Subject</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/assessment-result/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student}</TableCell>
                <TableCell>{r.assessment_plan}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.course || "—"}</TableCell>
                <TableCell>{r.total_score ?? "—"}{r.maximum_score ? ` / ${r.maximum_score}` : ""}</TableCell>
                <TableCell>{r.grade || "—"}</TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/assessment-result/${encodeURIComponent(r.name)}`)}
                    onEdit={r.docstatus === 0 ? () => navigate(`/dashboard/assessment-result/${encodeURIComponent(r.name)}/edit`) : undefined}
                    onDelete={r.docstatus !== 1 ? () => setDeleteTarget(r) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No assessment results found" />
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
        title={`Delete result for ${deleteTarget?.student_name || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

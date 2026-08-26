import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layers3, Plus } from "lucide-react";
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
  getAssessmentPlans,
  deleteAssessmentPlan,
  getStudentGroups,
  getLeafAssessmentGroups,
  getAcademicTerms,
  getSubmittedGradingScales,
  getClassrooms,
} from "@/services/education/assessmentPlanService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

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

// Real Desk in_standard_filter fields are student_group, assessment_group,
// grading_scale, course; academic_term and room (Classroom) are added here
// too since Grading Scale, Classroom, Academic Term, and Assessment Group's
// own Connections cards all link into this list with those query params.
export default function AssessmentPlansPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const supervisorFilter = searchParams.get("supervisor") || "";

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
  const [assessmentGroupFilter, setAssessmentGroupFilter] = useState(searchParams.get("assessment_group") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");
  const [gradingScaleFilter, setGradingScaleFilter] = useState(searchParams.get("grading_scale") || "");
  const [roomFilter, setRoomFilter] = useState(searchParams.get("room") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [gradingScaleOptions, setGradingScaleOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getAssessmentPlans({
        page,
        search,
        student_group: studentGroupFilter,
        assessment_group: assessmentGroupFilter,
        academic_term: academicTermFilter,
        grading_scale: gradingScaleFilter,
        room: roomFilter,
        supervisor: supervisorFilter,
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
    getLeafAssessmentGroups().then((r) => setAssessmentGroupOptions((r || []).map((g) => g.name))).catch(() => {});
    getAcademicTerms().then((r) => setAcademicTermOptions((r || []).map((t) => t.name))).catch(() => {});
    getSubmittedGradingScales().then((r) => setGradingScaleOptions((r || []).map((g) => g.name))).catch(() => {});
    getClassrooms().then((r) => setRoomOptions((r || []).map((c) => c.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentGroupFilter, assessmentGroupFilter, academicTermFilter, gradingScaleFilter, roomFilter, supervisorFilter]);

  async function confirmDelete() {
    try {
      await deleteAssessmentPlan(deleteTarget.name);
      toast.success("Assessment plan deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Assessment Plans"
        description={loading ? "Loading…" : `${total} assessment plans`}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/assessment-plan/bulk")}>
            <Layers3 className="mr-2 h-4 w-4" /> Bulk Create
          </Button>
          <Button onClick={() => navigate("/dashboard/assessment-plan/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Assessment Plan
          </Button>
        </div>
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
            key: "assessment_group", label: "Assessment Group", value: assessmentGroupFilter,
            onChange: (v) => { setAssessmentGroupFilter(v); setPage(1); }, options: assessmentGroupOptions,
          },
          {
            key: "academic_term", label: "Academic Term", value: academicTermFilter,
            onChange: (v) => { setAcademicTermFilter(v); setPage(1); }, options: academicTermOptions,
          },
          {
            key: "grading_scale", label: "Grading Scale", value: gradingScaleFilter,
            onChange: (v) => { setGradingScaleFilter(v); setPage(1); }, options: gradingScaleOptions,
          },
          {
            key: "room", label: "Classroom", value: roomFilter,
            onChange: (v) => { setRoomFilter(v); setPage(1); }, options: roomOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Teacher" value={supervisorFilter} onClear={() => clearParam("supervisor")} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment</TableHead>
              <TableHead>Class Arm</TableHead>
              <TableHead className="hidden sm:table-cell">Subject</TableHead>
              <TableHead className="hidden sm:table-cell">Schedule Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/assessment-plan/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.assessment_name || r.name}</TableCell>
                <TableCell>{r.student_group || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.course || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.schedule_date)}</TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/assessment-plan/${encodeURIComponent(r.name)}`)}
                    onEdit={r.docstatus === 0 ? () => navigate(`/dashboard/assessment-plan/${encodeURIComponent(r.name)}/edit`) : undefined}
                    onDelete={r.docstatus !== 1 ? () => setDeleteTarget(r) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No assessment plans found" />
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
        title={`Delete ${deleteTarget?.assessment_name || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

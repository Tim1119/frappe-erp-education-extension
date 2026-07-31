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
  getAssessmentCriteriaList,
  deleteAssessmentCriteria,
  getAssessmentCriteriaGroups,
} from "@/services/assessmentCriteriaService";
import { getErrorMessage } from "@/utils/errors";

export default function AssessmentCriteriaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState(searchParams.get("assessment_criteria_group") || "");
  const [groupOptions, setGroupOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getAssessmentCriteriaList({
        page,
        search,
        assessment_criteria_group: groupFilter,
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
    getAssessmentCriteriaGroups().then((r) => setGroupOptions((r || []).map((g) => g.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, groupFilter]);

  async function confirmDelete() {
    try {
      await deleteAssessmentCriteria(deleteTarget.name);
      toast.success("Assessment criteria deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Assessment Criteria"
        description={loading ? "Loading…" : `${total} assessment criteria`}
      >
        <Button onClick={() => navigate("/dashboard/assessment-criteria/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Assessment Criteria
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "assessment_criteria_group", label: "Group", value: groupFilter,
            onChange: (v) => { setGroupFilter(v); setPage(1); }, options: groupOptions,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment Criteria</TableHead>
              <TableHead>Assessment Criteria Group</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/assessment-criteria/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.assessment_criteria || r.name}</TableCell>
                <TableCell>{r.assessment_criteria_group || "—"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/assessment-criteria/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/assessment-criteria/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState title="No assessment criteria found" />
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
        title={`Delete ${deleteTarget?.assessment_criteria || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { usePagination } from "@/hooks";
import {
  getGradingScales,
  deleteGradingScale,
} from "@/services/gradingScaleService";
import { getErrorMessage } from "@/utils/errors";

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) return <Badge variant="success">Submitted</Badge>;
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function GradingScalesPage() {
  const navigate = useNavigate();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getGradingScales({ page, search });
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
  }, [page, search]);

  async function confirmDelete() {
    try {
      await deleteGradingScale(deleteTarget.name);
      toast.success("Grading scale deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Grading Scales"
        description={loading ? "Loading…" : `${total} grading scales`}
      >
        <Button onClick={() => navigate("/dashboard/grading-scale/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Grading Scale
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grading Scale</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/grading-scale/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.grading_scale_name || r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.description || "—"}</TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/grading-scale/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/grading-scale/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState title="No grading scales found" />
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
        title={`Delete ${deleteTarget?.grading_scale_name || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

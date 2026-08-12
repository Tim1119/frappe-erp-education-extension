import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Folder, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { getAssessmentGroups, deleteAssessmentGroup } from "@/services/assessmentGroupService";
import { getErrorMessage } from "@/utils/errors";

// Assessment Group is a real Frappe tree doctype (is_tree: 1). lft/rgt/
// old_parent are internal nested-set bookkeeping fields maintained
// entirely server-side by frappe.utils.nestedset -- never user-facing,
// so they're intentionally absent from every page in this module. A flat
// paginated table with a search box would misrepresent the hierarchy, so
// this renders every node as a single indented list, depth-first,
// siblings alphabetical -- exactly the order the backend already returns
// (see assessment_group_api.py), which mirrors the real Desk tree view's
// own sibling ordering.
export default function AssessmentGroupsPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getAssessmentGroups();
      setRows(r.rows || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmDelete() {
    try {
      await deleteAssessmentGroup(deleteTarget.name);
      toast.success("Assessment group deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Assessment Groups"
        description={loading ? "Loading…" : `${rows.length} assessment groups`}
      >
        <Button onClick={() => navigate("/dashboard/assessment-group/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Assessment Group
        </Button>
      </PageHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden sm:table-cell">Parent Assessment Group</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/assessment-group/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">
                  <span
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${(r.depth || 0) * 20}px` }}
                  >
                    {r.is_group ? (
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    {r.assessment_group_name || r.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={r.is_group ? "secondary" : "outline"}>
                    {r.is_group ? "Group" : "Leaf"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{r.parent_assessment_group || "—"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/assessment-group/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/assessment-group/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState title="No assessment groups found" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.assessment_group_name || deleteTarget?.name}?`}
        description="This action cannot be undone. A group with child assessment groups cannot be deleted until its children are removed or reassigned."
      />
    </>
  );
}

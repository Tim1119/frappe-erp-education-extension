import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  getStudentCategories,
  deleteStudentCategory,
} from "@/services/education/studentCategoryService";
import { getErrorMessage } from "@/utils/errors";

export default function StudentCategoriesPage() {
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
      const r = await getStudentCategories({ page, search });
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
      await deleteStudentCategory(deleteTarget.name);
      toast.success("Student category deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Student Categories"
        description={loading ? "Loading…" : `${total} student categories`}
      >
        <Button onClick={() => navigate("/dashboard/student-category/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Student Category
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
              <TableHead>Category</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/student-category/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.category || r.name}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/student-category/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/student-category/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <EmptyState title="No student categories found" />
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
        title={`Delete ${deleteTarget?.category || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

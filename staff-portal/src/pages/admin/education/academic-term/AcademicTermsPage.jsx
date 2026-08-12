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
  getAcademicTerms,
  deleteAcademicTerm,
  getAcademicYears,
} from "@/services/academicTermService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

export default function AcademicTermsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(searchParams.get("academic_year") || "");
  const [yearOptions, setYearOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const r = await getAcademicTerms({ page, search, academic_year: yearFilter });
      setRows(r.rows || []);
      setTotal(r.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAcademicYears()
      .then((r) => setYearOptions((r || []).map((y) => y.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [page, search, yearFilter]);

  async function confirmDelete() {
    try {
      await deleteAcademicTerm(deleteTarget.name);
      toast.success("Academic term deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Academic Terms"
        description={loading ? "Loading…" : `${total} academic terms`}
      >
        <Button onClick={() => navigate("/dashboard/academic-term/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Academic Term
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "academic_year",
            label: "Academic Year",
            value: yearFilter,
            onChange: (v) => { setYearFilter(v); setPage(1); },
            options: yearOptions,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Term Name</TableHead>
              <TableHead className="hidden sm:table-cell">Start Date</TableHead>
              <TableHead className="hidden sm:table-cell">End Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/academic-term/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.title || r.name}</TableCell>
                <TableCell>{r.academic_year || "—"}</TableCell>
                <TableCell>{r.term_name || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.term_start_date)}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.term_end_date)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/academic-term/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/academic-term/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No academic terms found" />
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
        title={`Delete ${deleteTarget?.title || deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}
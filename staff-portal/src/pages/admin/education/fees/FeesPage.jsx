import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
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
  getFees,
  deleteFee,
  getFeeStructures,
  getAcademicYears,
  getAcademicTerms,
} from "@/services/feesService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

// Fees has no stored status field -- the real controller (fees.py's
// set_indicator()) only ever computes Paid (green) vs Unpaid (orange) from
// outstanding_amount, and is Desk-indicator-only, not a DocType field. This
// mirrors that exact logic; "Overdue" is NOT a real concept in the
// controller, so it isn't invented here.
function PaymentStatusBadge({ outstandingAmount }) {
  const unpaid = Number(outstandingAmount || 0) > 0;
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={
        unpaid
          ? { backgroundColor: "var(--warning-soft)", color: "var(--warning-ink)" }
          : { backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }
      }
    >
      {unpaid ? "Unpaid" : "Paid"}
    </span>
  );
}

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--info-soft)", color: "var(--info)" }}
      >
        Submitted
      </span>
    );
  }
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function FeesPage() {
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

  const [feeStructureFilter, setFeeStructureFilter] = useState(searchParams.get("fee_structure") || "");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");

  const [feeStructureOptions, setFeeStructureOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);

  useEffect(() => {
    getFeeStructures()
      .then((r) => setFeeStructureOptions((r || []).map((f) => f.name)))
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
      const r = await getFees({
        page,
        search,
        student: studentFilter || undefined,
        fee_structure: feeStructureFilter || undefined,
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
  }, [page, search, studentFilter, feeStructureFilter, academicYearFilter, academicTermFilter]);

  useEffect(() => {
    reset();
  }, [studentFilter, feeStructureFilter, academicYearFilter, academicTermFilter]);

  async function confirmDelete() {
    try {
      await deleteFee(deleteTarget.name);
      toast.success("Fees record deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Fees"
        description={loading ? "Loading…" : `${total} fee records`}
      />

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "fee_structure",
            label: "Fee Structure",
            value: feeStructureFilter,
            onChange: setFeeStructureFilter,
            options: feeStructureOptions,
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
              <TableHead className="hidden sm:table-cell">Fee Structure</TableHead>
              <TableHead className="hidden sm:table-cell">Due Date</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/fees/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student_name || r.student}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.fee_structure || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDate(r.due_date)}</TableCell>
                <TableCell>{r.grand_total ? `₦${Number(r.grand_total).toLocaleString()}` : "—"}</TableCell>
                <TableCell><PaymentStatusBadge outstandingAmount={r.outstanding_amount} /></TableCell>
                <TableCell><DocStatusBadge docstatus={r.docstatus} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/fees/${encodeURIComponent(r.name)}`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No fee records found" />
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
        title={`Delete fees record for ${deleteTarget?.student_name || deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  deleteSalesInvoice,
  getAcademicTerms,
  getAcademicYears,
  getFeeSchedules,
  getSalesInvoices,
} from "@/services/salesInvoiceService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function StatusBadge({ status }) {
  if (status === "Paid") {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }}
      >
        Paid
      </span>
    );
  }
  if (status === "Unpaid" || status === "Overdue") {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning-ink)" }}
      >
        {status}
      </span>
    );
  }
  if (status === "Cancelled" || status === "Return") {
    return <Badge variant="destructive">{status}</Badge>;
  }
  return <Badge variant="secondary">{status || "Draft"}</Badge>;
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

function money(value) {
  return value === null || value === undefined || value === ""
    ? "—"
    : `₦${Number(value).toLocaleString()}`;
}

export default function SalesInvoicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentFilter = searchParams.get("student") || "";
  const { page, setPage, reset } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [feeScheduleFilter, setFeeScheduleFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [academicTermFilter, setAcademicTermFilter] = useState("");
  const [feeScheduleOptions, setFeeScheduleOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);

  useEffect(() => {
    Promise.all([getFeeSchedules(), getAcademicYears()])
      .then(([schedules, years]) => {
        setFeeScheduleOptions((schedules || []).map((item) => item.name));
        setAcademicYearOptions((years || []).map((item) => item.name));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getAcademicTerms(academicYearFilter || undefined)
      .then((result) => setAcademicTermOptions((result || []).map((item) => item.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [academicYearFilter]);

  async function load() {
    try {
      setLoading(true);
      const result = await getSalesInvoices({
        page,
        search,
        student: studentFilter || undefined,
        status: statusFilter || undefined,
        fee_schedule: feeScheduleFilter || undefined,
        academic_year: academicYearFilter || undefined,
        academic_term: academicTermFilter || undefined,
      });
      setRows(result.rows || []);
      setTotal(result.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentFilter, statusFilter, feeScheduleFilter, academicYearFilter, academicTermFilter]);

  useEffect(() => {
    reset();
  }, [studentFilter, statusFilter, feeScheduleFilter, academicYearFilter, academicTermFilter, reset]);

  function clearStudentFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete("student");
    setSearchParams(next);
  }

  async function confirmDelete() {
    try {
      await deleteSalesInvoice(deleteTarget.name);
      toast.success("Sales invoice deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Sales Invoices"
        description={loading ? "Loading…" : `${total} sales invoices`}
      >
        <Button onClick={() => navigate("/dashboard/sales-invoices/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Sales Invoice
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        filters={[
          {
            key: "status", label: "Status", value: statusFilter,
            onChange: setStatusFilter,
            options: ["Draft", "Unpaid", "Overdue", "Paid", "Cancelled", "Return"],
          },
          {
            key: "fee_schedule", label: "Fee Schedule", value: feeScheduleFilter,
            onChange: setFeeScheduleFilter, options: feeScheduleOptions,
          },
          {
            key: "academic_year", label: "Academic Year", value: academicYearFilter,
            onChange: setAcademicYearFilter, options: academicYearOptions,
          },
          {
            key: "academic_term", label: "Academic Term", value: academicTermFilter,
            onChange: setAcademicTermFilter, options: academicTermOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Student" value={studentFilter} onClear={clearStudentFilter} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Posting Date</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Docstatus</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/sales-invoices/${encodeURIComponent(row.name)}`)}
              >
                <TableCell className="font-medium">{row.student_name || row.student || "—"}</TableCell>
                <TableCell>{row.customer_name || row.customer || "—"}</TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="hidden lg:table-cell">{fmtDate(row.posting_date)}</TableCell>
                <TableCell className="hidden lg:table-cell">{fmtDate(row.due_date)}</TableCell>
                <TableCell>{money(row.grand_total)}</TableCell>
                <TableCell>{money(row.outstanding_amount)}</TableCell>
                <TableCell><DocStatusBadge docstatus={row.docstatus} /></TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/sales-invoices/${encodeURIComponent(row.name)}`)}
                    onEdit={row.docstatus === 0
                      ? () => navigate(`/dashboard/sales-invoices/${encodeURIComponent(row.name)}/edit`)
                      : undefined}
                    onDelete={row.docstatus !== 1 ? () => setDeleteTarget(row) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState title="No sales invoices found" />
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
        title={`Delete sales invoice ${deleteTarget?.name}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

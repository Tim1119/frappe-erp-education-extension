import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import { getAccountingDocuments } from "@/services/accounting/documentService";
import { fmtDate } from "@/utils/format";

const FILTER_PARAMS = {
  "Purchase Invoice": [["supplier", "Supplier"], ["company", "Company"], ["return_against", "Return Against"]],
  "Payment Entry": [["reference_name", "Purchase Invoice"]],
};

const money = (v) => (v ? `₦${Number(v).toLocaleString()}` : "—");

// Colors match erpnext's purchase_invoice_list.js get_indicator() exactly.
const PI_STATUS_COLORS = {
  Paid: "success", Unpaid: "warning", Overdue: "danger", "Partly Paid": "warning",
  Return: "gray", "Debit Note Issued": "gray", "Internal Transfer": "gray",
  "On Hold": "gray", "Temporarily on Hold": "gray",
};
function PurchaseInvoiceStatus({ row }) {
  const label = row.on_hold && Number(row.outstanding_amount) > 0 && row.docstatus === 1
    ? (row.release_date && new Date(row.release_date) > new Date() ? "Temporarily on Hold" : "On Hold")
    : (row.status || "Draft");
  const tone = PI_STATUS_COLORS[label] || "gray";
  const style = tone === "gray"
    ? { backgroundColor: "var(--surface-3)", color: "var(--ink-3)" }
    : { backgroundColor: `var(--${tone}-soft)`, color: `var(--${tone}-ink)` };
  return <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold" style={style}>{label}</span>;
}

const CONFIG = {
  "Purchase Invoice": { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.supplier], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Due Date", (r) => fmtDate(r.due_date)], ["Bill No", (r) => r.bill_no], ["Grand Total", (r) => money(r.grand_total)], ["Outstanding", (r) => money(r.outstanding_amount)], ["Status", (r) => <PurchaseInvoiceStatus row={r} />]] },
  Supplier: { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.name], ["Group", (r) => r.supplier_group], ["Type", (r) => r.supplier_type], ["Country", (r) => r.country], ["Disabled", (r) => r.disabled ? "Yes" : "No"]] },
  "Payment Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Payment Entry", (r) => r.name], ["Type", (r) => r.payment_type], ["Party", (r) => r.party_name || r.party], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Paid Amount", (r) => money(r.paid_amount)], ["Received Amount", (r) => money(r.received_amount)], ["Status", (r) => r.status || "Draft"]] },
  "Journal Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Journal Entry", (r) => r.name], ["Type", (r) => r.voucher_type], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Company", (r) => r.company], ["Total Debit", (r) => money(r.total_debit)], ["Total Credit", (r) => money(r.total_credit)], ["Difference", (r) => money(r.difference)]] },
};

export default function AccountingDocumentList({ doctype, base, title }) {
  const navigate = useNavigate(); const [searchParams, setSearchParams] = useSearchParams(); const { page, setPage } = usePagination(1); const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [search, setSearch] = useState(""); const config = CONFIG[doctype];
  const connectionFilters = FILTER_PARAMS[doctype] || [];
  const activeFilters = Object.fromEntries(connectionFilters.map(([key]) => [key, searchParams.get(key) || ""]).filter(([, v]) => v));
  const clearParam = (key) => { const next = new URLSearchParams(searchParams); next.delete(key); setSearchParams(next); setPage(1); };
  useEffect(() => { getAccountingDocuments(doctype, { page, search, ...activeFilters }).then((result) => { setRows(result.rows || []); setCount(result.count || 0); }); }, [doctype, page, search, JSON.stringify(activeFilters)]);
  return <><PageHeader eyebrow={config.eyebrow} title={title} sub={`${count} records`} button={<button className="btn btn-primary" onClick={() => navigate(`/dashboard/${base}/new`)}><Plus size={15} /> Add {doctype}</button>} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />{connectionFilters.map(([key, label]) => <ActiveFilterChip key={key} label={label} value={activeFilters[key]} onClear={() => clearParam(key)} />)}<div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>{config.columns.map(([label]) => <th key={label}>{label}</th>)}<th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)}>{config.columns.map(([label, render], index) => <td key={label}>{index === 0 ? <b>{render(row) || "—"}</b> : render(row) || "—"}</td>)}<td><RowActionsMenu onView={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit ? () => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}/edit`) : undefined} /></td></tr>)}{!rows.length && <tr><td colSpan={config.columns.length + 1}><EmptyState title={`No ${title.toLowerCase()} found`} /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div></>;
}

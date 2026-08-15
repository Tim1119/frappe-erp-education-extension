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
import { DocumentStatusBadge } from "./documentStatus";

// A `null` label means the param is forwarded to the API but has no chip
// of its own -- reference_doctype/reference_type only exist to say which
// parent doctype "reference_name" points at (Purchase Invoice or Sales
// Invoice both route through this same generic Payment Entry / Journal
// Entry list), so the chip they drive is the reference_name one below,
// not a separate chip.
const FILTER_PARAMS = {
  "Purchase Invoice": [["supplier", "Supplier"], ["company", "Company"], ["return_against", "Return Against"]],
  "Payment Entry": [["reference_name", null], ["reference_doctype", null], ["party", "Party"], ["party_type", "Party Type"]],
  "Journal Entry": [["reference_name", null], ["reference_type", null]],
};

const money = (v) => (v ? `₦${Number(v).toLocaleString()}` : "—");

const CONFIG = {
  "Purchase Invoice": { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.supplier], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Due Date", (r) => fmtDate(r.due_date)], ["Bill No", (r) => r.bill_no], ["Grand Total", (r) => money(r.grand_total)], ["Outstanding", (r) => money(r.outstanding_amount)], ["Status", (r) => <DocumentStatusBadge doctype="Purchase Invoice" row={r} />]] },
  Supplier: { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.name], ["Group", (r) => r.supplier_group], ["Type", (r) => r.supplier_type], ["Country", (r) => r.country], ["Status", (r) => <DocumentStatusBadge doctype="Supplier" row={r} />]] },
  Customer: { eyebrow: "Accounting · Receivables · Invoicing", columns: [["Customer Name", (r) => r.customer_name || r.name], ["Customer Group", (r) => r.customer_group], ["Customer Type", (r) => r.customer_type], ["Territory", (r) => r.territory], ["Status", (r) => <DocumentStatusBadge doctype="Customer" row={r} />]] },
  "Payment Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Payment Entry", (r) => r.name], ["Type", (r) => r.payment_type], ["Party", (r) => r.party_name || r.party], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Paid Amount", (r) => money(r.paid_amount)], ["Received Amount", (r) => money(r.received_amount)], ["Status", (r) => <DocumentStatusBadge doctype="Payment Entry" row={r} />]] },
  "Journal Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Journal Entry", (r) => r.name], ["Type", (r) => r.voucher_type], ["Posting Date", (r) => fmtDate(r.posting_date)], ["Company", (r) => r.company], ["Total Debit", (r) => money(r.total_debit)], ["Total Credit", (r) => money(r.total_credit)], ["Status", (r) => <DocumentStatusBadge doctype="Journal Entry" row={r} />]] },
};

export default function AccountingDocumentList({ doctype, base, title }) {
  const navigate = useNavigate(); const [searchParams, setSearchParams] = useSearchParams(); const { page, setPage } = usePagination(1); const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [search, setSearch] = useState(""); const config = CONFIG[doctype];
  const connectionFilters = FILTER_PARAMS[doctype] || [];
  const activeFilters = Object.fromEntries(connectionFilters.map(([key]) => [key, searchParams.get(key) || ""]).filter(([, v]) => v));
  const clearParams = (keys) => { const next = new URLSearchParams(searchParams); keys.forEach((k) => next.delete(k)); setSearchParams(next); setPage(1); };
  // reference_name's chip label depends on which doctype it's pointing at --
  // Purchase Invoice by default (matching old links that omit it), but
  // Sales Invoice (or any future caller) when reference_doctype/reference_type
  // says so. This is the fix for the chip that used to always read
  // "Filtered by Purchase Invoice" even when the reference was a Sales Invoice.
  const referenceLabel = activeFilters.reference_doctype || activeFilters.reference_type || "Purchase Invoice";
  useEffect(() => { getAccountingDocuments(doctype, { page, search, ...activeFilters }).then((result) => { setRows(result.rows || []); setCount(result.count || 0); }); }, [doctype, page, search, JSON.stringify(activeFilters)]);
  return <><PageHeader eyebrow={config.eyebrow} title={title} sub={`${count} records`} button={<button className="btn btn-primary" onClick={() => navigate(`/dashboard/${base}/new`)}><Plus size={15} /> Add {doctype}</button>} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />{connectionFilters.map(([key, label]) => label === null ? null : <ActiveFilterChip key={key} label={key === "reference_name" ? referenceLabel : label} value={activeFilters[key]} onClear={() => clearParams(key === "reference_name" ? [key, "reference_doctype", "reference_type"] : [key])} />)}<div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>{config.columns.map(([label]) => <th key={label}>{label}</th>)}<th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)}>{config.columns.map(([label, render], index) => <td key={label}>{index === 0 ? <b>{render(row) || "—"}</b> : render(row) || "—"}</td>)}<td><RowActionsMenu onView={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit ? () => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}/edit`) : undefined} /></td></tr>)}{!rows.length && <tr><td colSpan={config.columns.length + 1}><EmptyState title={`No ${title.toLowerCase()} found`} /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div></>;
}

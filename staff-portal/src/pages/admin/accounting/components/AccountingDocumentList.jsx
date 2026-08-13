import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { getAccountingDocuments } from "@/services/accounting/documentService";

const CONFIG = {
  "Purchase Invoice": { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.supplier], ["Posting Date", (r) => r.posting_date], ["Due Date", (r) => r.due_date], ["Bill No", (r) => r.bill_no], ["Grand Total", (r) => Number(r.grand_total || 0).toLocaleString()], ["Outstanding", (r) => Number(r.outstanding_amount || 0).toLocaleString()], ["Status", (r) => r.status || "Draft"]] },
  Supplier: { eyebrow: "Accounting · Payables · Invoicing", columns: [["Supplier", (r) => r.supplier_name || r.name], ["Group", (r) => r.supplier_group], ["Type", (r) => r.supplier_type], ["Country", (r) => r.country], ["Disabled", (r) => r.disabled ? "Yes" : "No"]] },
  "Payment Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Payment Entry", (r) => r.name], ["Type", (r) => r.payment_type], ["Party", (r) => r.party_name || r.party], ["Posting Date", (r) => r.posting_date], ["Paid Amount", (r) => Number(r.paid_amount || 0).toLocaleString()], ["Received Amount", (r) => Number(r.received_amount || 0).toLocaleString()], ["Status", (r) => r.status || "Draft"]] },
  "Journal Entry": { eyebrow: "Accounting · Payables · Payments", columns: [["Journal Entry", (r) => r.name], ["Type", (r) => r.voucher_type], ["Posting Date", (r) => r.posting_date], ["Company", (r) => r.company], ["Total Debit", (r) => Number(r.total_debit || 0).toLocaleString()], ["Total Credit", (r) => Number(r.total_credit || 0).toLocaleString()], ["Difference", (r) => Number(r.difference || 0).toLocaleString()]] },
};

export default function AccountingDocumentList({ doctype, base, title }) {
  const navigate = useNavigate(); const { page, setPage } = usePagination(1); const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [search, setSearch] = useState(""); const config = CONFIG[doctype];
  useEffect(() => { getAccountingDocuments(doctype, { page, search }).then((result) => { setRows(result.rows || []); setCount(result.count || 0); }); }, [doctype, page, search]);
  return <><PageHeader eyebrow={config.eyebrow} title={title} sub={`${count} records`} button={<button className="btn btn-primary" onClick={() => navigate(`/dashboard/${base}/new`)}><Plus size={15} /> Add {doctype}</button>} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} /><div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>{config.columns.map(([label]) => <th key={label}>{label}</th>)}<th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)}>{config.columns.map(([label, render], index) => <td key={label}>{index === 0 ? <b>{render(row) || "—"}</b> : render(row) || "—"}</td>)}<td><RowActionsMenu onView={() => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit ? () => navigate(`/dashboard/${base}/${encodeURIComponent(row.name)}/edit`) : undefined} /></td></tr>)}{!rows.length && <tr><td colSpan={config.columns.length + 1}><EmptyState title={`No ${title.toLowerCase()} found`} /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div></>;
}

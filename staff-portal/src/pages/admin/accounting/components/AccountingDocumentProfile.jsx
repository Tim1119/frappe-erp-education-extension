import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, FileText, Plus, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { cancelAccountingDocument, deleteAccountingDocument, getAccountingConnections, getAccountingDocument, getAccountingMeta, submitAccountingDocument } from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";
import { DocumentStatusBadge } from "./documentStatus";

const BREAKS = new Set(["Section Break", "Column Break", "Tab Break"]);
const Field = ({ label, value }) => <div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="whitespace-pre-wrap text-sm font-semibold">{value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}</p></div>;

function formatChildValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.fieldtype === "Date") return fmtDate(value);
  if (["Currency", "Float", "Percent"].includes(field.fieldtype)) return Number(value).toLocaleString();
  if (field.fieldtype === "Check") return Number(value) ? "Yes" : "No";
  return String(value);
}

// Purchase Order / Purchase Receipt connections are intentionally omitted --
// this portal has no module for either doctype, so a count with nowhere to
// drill into would be a dead end rather than a real Connection.
//
// Two shapes of connection item:
//  - `path(name)` + a `key` into the backend get_connections() count -- for
//    counting OTHER documents that point at this one (a real DB lookup).
//  - `compute(doc)` -- for documents THIS record already references in its
//    own child table (Payment Entry.references, Journal Entry.accounts), so
//    the count comes straight out of the doc already loaded, no extra query.
function countByReferenceDoctype(rows, referenceDoctypeField, referenceNameField, targetDoctype) {
  const matches = (rows || []).filter((r) => r[referenceDoctypeField] === targetDoctype && r[referenceNameField]);
  return { count: new Set(matches.map((r) => r[referenceNameField])).size, matches };
}

const CONNECTION_CONFIG = {
  Supplier: [
    { key: "purchase_invoices", label: "Purchase Invoice", icon: FileText, path: (name) => `/dashboard/purchase-invoices?supplier=${encodeURIComponent(name)}` },
    { key: "payments", label: "Payment Entry", icon: Wallet, path: (name) => `/dashboard/payment-entries?party_type=Supplier&party=${encodeURIComponent(name)}` },
  ],
  "Purchase Invoice": [
    { key: "payments", label: "Payment Entry", icon: Wallet, path: (name) => `/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}` },
  ],
  "Payment Entry": [
    {
      key: "purchase_invoice", label: "Purchase Invoice", icon: FileText,
      compute: (doc) => {
        const { count, matches } = countByReferenceDoctype(doc.references, "reference_doctype", "reference_name", "Purchase Invoice");
        return { count, path: count === 1 ? `/dashboard/purchase-invoices/${encodeURIComponent(matches[0].reference_name)}` : count ? `/dashboard/purchase-invoices?supplier=${encodeURIComponent(doc.party || "")}` : null };
      },
    },
    {
      key: "sales_invoice", label: "Sales Invoice", icon: FileText,
      compute: (doc) => {
        const { count, matches } = countByReferenceDoctype(doc.references, "reference_doctype", "reference_name", "Sales Invoice");
        return { count, path: count === 1 ? `/dashboard/sales-invoices/${encodeURIComponent(matches[0].reference_name)}` : count ? `/dashboard/sales-invoices?customer=${encodeURIComponent(doc.party || "")}` : null };
      },
    },
    { key: "journal_entries", label: "Journal Entry", icon: FileText, path: () => `/dashboard/journal-entries` },
  ],
  "Journal Entry": [
    {
      key: "purchase_invoice", label: "Purchase Invoice", icon: FileText,
      compute: (doc) => {
        const { count, matches } = countByReferenceDoctype(doc.accounts, "reference_type", "reference_name", "Purchase Invoice");
        return { count, path: count === 1 ? `/dashboard/purchase-invoices/${encodeURIComponent(matches[0].reference_name)}` : count ? `/dashboard/purchase-invoices` : null };
      },
    },
    {
      key: "sales_invoice", label: "Sales Invoice", icon: FileText,
      compute: (doc) => {
        const { count, matches } = countByReferenceDoctype(doc.accounts, "reference_type", "reference_name", "Sales Invoice");
        return { count, path: count === 1 ? `/dashboard/sales-invoices/${encodeURIComponent(matches[0].reference_name)}` : count ? `/dashboard/sales-invoices` : null };
      },
    },
  ],
  Customer: [
    { key: "sales_invoices", label: "Sales Invoice", icon: FileText, path: (name) => `/dashboard/sales-invoices?customer=${encodeURIComponent(name)}` },
    { key: "payments", label: "Payment Entry", icon: Wallet, path: (name) => `/dashboard/payment-entries?party_type=Customer&party=${encodeURIComponent(name)}` },
    { key: "dunning", label: "Dunning", icon: FileText, path: (name) => `/dashboard/dunning?customer=${encodeURIComponent(name)}` },
  ],
  Dunning: [
    {
      key: "sales_invoice", label: "Sales Invoice", icon: FileText,
      compute: (doc) => {
        const names = [...new Set((doc.overdue_payments || []).filter((r) => r.sales_invoice).map((r) => r.sales_invoice))];
        const count = names.length;
        return { count, path: count === 1 ? `/dashboard/sales-invoices/${encodeURIComponent(names[0])}` : count ? `/dashboard/sales-invoices?customer=${encodeURIComponent(doc.customer || "")}` : null };
      },
    },
  ],
};

// Group each doctype belongs to under Accounting, and the second eyebrow
// segment -- everything not listed defaults to Payables / Invoicing (see
// usage below).
const GROUP = { Customer: "Receivables", Dunning: "Receivables", "Dunning Type": "Receivables" };
const SECTION = { "Payment Entry": "Payments", "Journal Entry": "Payments", Dunning: "Dunning", "Dunning Type": "Dunning" };
const HR_DOCTYPES = new Set(["Expense Claim Type", "Purpose of Travel", "Additional Salary", "Vehicle", "Driver", "Vehicle Service Item", "Vehicle Log"]);

// "Create" dropdown actions per doctype -- a config map instead of a
// bespoke profile page per doctype. Each action decides its own visibility
// from the loaded doc and hands the target FormPage a prefill via router
// state (the same location.state.prefill contract AccountingDocumentFormPage
// already reads for the "make X from Y" flows on Purchase Invoice).
const CREATE_ACTIONS = {
  Supplier: [
    {
      label: "Purchase Invoice",
      show: (doc) => !doc.disabled,
      run: (doc, navigate) => navigate("/dashboard/purchase-invoices/new", { state: { prefill: { supplier: doc.name, supplier_name: doc.supplier_name } } }),
    },
  ],
  Customer: [
    {
      label: "Sales Invoice",
      show: (doc) => !doc.disabled,
      run: (doc, navigate) => navigate("/dashboard/sales-invoices/new", { state: { prefill: { customer: doc.name, customer_name: doc.customer_name } } }),
    },
  ],
  // Mirrors dunning.js refresh(): the "Payment" button appears once
  // submitted and not yet resolved. Unlike Supplier/Customer's client-built
  // prefills, this needs the real get_payment_entry() RPC first (same call
  // Purchase/Sales Invoice's own profile pages already make) since a
  // Dunning's payable total (dunning_amount + outstanding) isn't something
  // to hand-roll here.
  Dunning: [
    {
      label: "Payment",
      show: (doc) => doc.docstatus === 1 && doc.status !== "Resolved",
      run: async (doc, navigate) => {
        try {
          const draft = await callMethod("erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", { dt: "Dunning", dn: doc.name });
          navigate("/dashboard/payment-entries/new", { state: { prefill: draft } });
        } catch { /* no payment entry could be mapped for this dunning */ }
      },
    },
  ],
};

function ConnectionButton({ icon: Icon, label, path, count, loading }) {
  const navigate = useNavigate();
  const clickable = Boolean(path) && !loading;
  return (
    <button
      onClick={() => clickable && navigate(path)}
      disabled={!clickable}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", backgroundColor: "var(--surface-2)", border: "1px solid hsl(var(--border))", borderRadius: 6, cursor: clickable ? "pointer" : "default", width: "100%", textAlign: "left", color: "var(--ink)", fontSize: 12, opacity: clickable ? 1 : 0.7 }}
    >
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {loading ? <span style={{ fontSize: 10, color: "var(--ink-3)" }}>...</span> : <span style={{ fontSize: 10, color: "var(--ink-3)", backgroundColor: "var(--surface)", padding: "1px 6px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>{count ?? 0}</span>}
    </button>
  );
}

// Compact read-only summary table (columns = the child doctype's own
// in_list_view fields) instead of one fully-expanded card per row -- mirrors
// the same in_list_view-driven approach as the form's ChildTable so a row
// with a dozen+ fields (Journal Entry Account) stays scannable.
function ChildRows({ field, rows }) {
  const childFields = field.child_fields || [];
  const summaryFields = childFields.filter((f) => f.in_list_view).length ? childFields.filter((f) => f.in_list_view) : childFields.slice(0, 4);
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <p className="mb-3 text-sm font-bold">{field.label}</p>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr>{summaryFields.map((f) => <th key={f.fieldname}>{f.label || f.fieldname}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => <tr key={row.name || index}>{summaryFields.map((f) => <td key={f.fieldname}>{formatChildValue(f, row[f.fieldname])}</td>)}</tr>)}
            {!rows.length && <tr><td colSpan={summaryFields.length || 1} className="muted" style={{ textAlign: "center", padding: 16 }}>No rows.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AccountingDocumentProfile({ doctype, base }) {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate(); const [doc, setDoc] = useState(null); const [meta, setMeta] = useState(null); const [open, setOpen] = useState({});
  const [connections, setConnections] = useState(null); const [loadingConnections, setLoadingConnections] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const configItems = CONNECTION_CONFIG[doctype] || [];
  const backedItems = configItems.filter((item) => !item.compute);
  const load = () => getAccountingDocument(doctype, name).then(setDoc);
  useEffect(() => { load(); getAccountingMeta(doctype).then(setMeta); }, [doctype, name]);
  useEffect(() => {
    if (!backedItems.length) { setLoadingConnections(false); return; }
    setLoadingConnections(true);
    getAccountingConnections(doctype, name).then(setConnections).catch(() => setConnections({})).finally(() => setLoadingConnections(false));
  }, [doctype, name]);
  const connectionItems = useMemo(() => configItems.map((item) => {
    if (item.compute) { const { count, path } = item.compute(doc || {}) || {}; return { ...item, count, path, loading: false }; }
    return { ...item, count: connections?.[item.key], path: item.path(name), loading: loadingConnections };
  }), [configItems, doc, connections, loadingConnections, name]);
  const sections = useMemo(() => { const out = []; let section = { label: `${doctype} Information`, fields: [], collapsible: false }; for (const field of meta?.fields || []) { if (field.fieldtype === "Section Break" || field.fieldtype === "Tab Break") { if (section.fields.length) out.push(section); section = { label: field.label || "Details", fields: [], collapsible: Boolean(field.collapsible) }; } else if (!BREAKS.has(field.fieldtype)) section.fields.push(field); } if (section.fields.length) out.push(section); return out; }, [doctype, meta]);
  async function action(fn, message) { try { await fn(doctype, name); toast.success(message); load(); } catch (error) { toast.error(getErrorMessage(error)); } }
  async function handleDelete() {
    try { await deleteAccountingDocument(doctype, name); toast.success(`${doctype} deleted`); navigate(`/dashboard/${base}`); }
    catch (error) { toast.error(getErrorMessage(error)); }
  }
  if (!doc || !meta) return <div className="muted">Loading…</div>;
  const createActions = (CREATE_ACTIONS[doctype] || []).filter((item) => item.show(doc));
  const showStatus = doctype in { Supplier: 1, "Purchase Invoice": 1, "Payment Entry": 1, "Journal Entry": 1, Customer: 1, Dunning: 1 };
  return <>
    <PageHeader
      eyebrow={HR_DOCTYPES.has(doctype) ? "HR · Expense Claims" : `Accounting · ${GROUP[doctype] || "Payables"} · ${SECTION[doctype] || "Invoicing"}`}
      title={<span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>{doc.title || doc.party_name || doc.supplier_name || doc.customer_name || doc.name}{showStatus ? <DocumentStatusBadge doctype={doctype} row={doc} /> : null}</span>}
      sub={doc.name}
      button={
        <div className="flex gap-2">
          {doc.can_edit && <Button variant="outline" onClick={() => navigate(`/dashboard/${base}/${encodeURIComponent(name)}/edit`)}>Edit</Button>}
          {Boolean(meta.is_submittable) && doc.docstatus === 0 && <Button variant="default" onClick={() => action(submitAccountingDocument, `${doctype} submitted`)}>Submit</Button>}
          {createActions.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="default" size="sm"><Plus className="mr-1 h-4 w-4" /> Create</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">{createActions.map((item) => <DropdownMenuItem key={item.label} onClick={() => item.run(doc, navigate)}>{item.label}</DropdownMenuItem>)}</DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {Boolean(meta.is_submittable) && doc.docstatus === 1 && <Button variant="destructive" onClick={() => action(cancelAccountingDocument, `${doctype} cancelled`)}>Cancel</Button>}
          {doc.can_delete && <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      }
    />
    {connectionItems.length ? <div className="panel mb-4"><div className="panel-head"><div className="panel-title">Connections</div></div><div className="grid-form" style={{ padding: 20, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>{connectionItems.map((item) => <ConnectionButton key={item.key} icon={item.icon} label={item.label} path={item.path} count={item.count} loading={item.loading} />)}</div></div> : null}
    <div className="space-y-4">{sections.map((section, index) => { const expanded = !section.collapsible || open[index]; return <div className="panel" key={`${section.label}-${index}`}><button type="button" className={`panel-head w-full text-left ${section.collapsible ? "cursor-pointer" : ""}`} onClick={() => section.collapsible && setOpen((current) => ({ ...current, [index]: !expanded }))}><div className="panel-title flex items-center gap-2">{section.collapsible ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : null}{section.label}</div></button>{expanded && <div className="grid-form" style={{ padding: 20 }}>{section.fields.map((field) => field.fieldtype === "Table" ? <ChildRows key={field.fieldname} field={field} rows={doc[field.fieldname] || []} /> : <Field key={field.fieldname} label={field.label || field.fieldname} value={doc[field.fieldname]} />)}</div>}</div>; })}</div>
    <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title={`Delete ${name}?`} description="This action cannot be undone." confirmLabel="Delete" />
  </>;
}

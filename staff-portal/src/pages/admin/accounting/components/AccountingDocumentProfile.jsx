import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, FileText, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { cancelAccountingDocument, getAccountingConnections, getAccountingDocument, getAccountingMeta, submitAccountingDocument } from "@/services/accounting/documentService";

const BREAKS = new Set(["Section Break", "Column Break", "Tab Break"]);
const Field = ({ label, value }) => <div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="whitespace-pre-wrap text-sm font-semibold">{value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}</p></div>;

// Purchase Order / Purchase Receipt connections are intentionally omitted --
// this portal has no module for either doctype, so a count with nowhere to
// drill into would be a dead end rather than a real Connection.
const CONNECTION_CONFIG = {
  Supplier: [
    { key: "purchase_invoices", label: "Purchase Invoice", icon: FileText, path: (name) => `/dashboard/purchase-invoices?supplier=${encodeURIComponent(name)}` },
  ],
  "Purchase Invoice": [
    { key: "payments", label: "Payment Entry", icon: Wallet, path: (name) => `/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}` },
  ],
};

function ConnectionButton({ icon: Icon, label, path, count, loading }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", backgroundColor: "var(--surface-2)", border: "1px solid hsl(var(--border))", borderRadius: 6, cursor: "pointer", width: "100%", textAlign: "left", color: "var(--ink)", fontSize: 12 }}
    >
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {loading ? <span style={{ fontSize: 10, color: "var(--ink-3)" }}>...</span> : <span style={{ fontSize: 10, color: "var(--ink-3)", backgroundColor: "var(--surface)", padding: "1px 6px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>{count ?? 0}</span>}
    </button>
  );
}

function ChildRows({ field, rows }) {
  return <div style={{ gridColumn: "1 / -1" }}><p className="mb-3 text-sm font-bold">{field.label}</p><div className="space-y-3">{rows.map((row, index) => <div className="rounded-lg border bg-card p-4" key={row.name || index}><p className="mb-3 text-sm font-bold">Row {index + 1}</p><div className="grid-form">{(field.child_fields || []).map((child) => <Field key={child.fieldname} label={child.label || child.fieldname} value={row[child.fieldname]} />)}</div></div>)}</div></div>;
}

export default function AccountingDocumentProfile({ doctype, base }) {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate(); const [doc, setDoc] = useState(null); const [meta, setMeta] = useState(null); const [open, setOpen] = useState({});
  const [connections, setConnections] = useState(null); const [loadingConnections, setLoadingConnections] = useState(true);
  const connectionItems = CONNECTION_CONFIG[doctype] || [];
  const load = () => getAccountingDocument(doctype, name).then(setDoc);
  useEffect(() => { load(); getAccountingMeta(doctype).then(setMeta); }, [doctype, name]);
  useEffect(() => {
    if (!connectionItems.length) { setLoadingConnections(false); return; }
    setLoadingConnections(true);
    getAccountingConnections(doctype, name).then(setConnections).catch(() => setConnections({})).finally(() => setLoadingConnections(false));
  }, [doctype, name]);
  const sections = useMemo(() => { const out = []; let section = { label: `${doctype} Information`, fields: [], collapsible: false }; for (const field of meta?.fields || []) { if (field.fieldtype === "Section Break" || field.fieldtype === "Tab Break") { if (section.fields.length) out.push(section); section = { label: field.label || "Details", fields: [], collapsible: Boolean(field.collapsible) }; } else if (!BREAKS.has(field.fieldtype)) section.fields.push(field); } if (section.fields.length) out.push(section); return out; }, [doctype, meta]);
  async function action(fn, message) { try { await fn(doctype, name); toast.success(message); load(); } catch (error) { toast.error(String(error)); } }
  if (!doc || !meta) return <div className="muted">Loading…</div>;
  return <><PageHeader eyebrow={`Accounting · Payables · ${["Payment Entry", "Journal Entry"].includes(doctype) ? "Payments" : "Invoicing"}`} title={doc.title || doc.party_name || doc.supplier_name || doc.name} sub={doc.name} button={<div className="flex gap-2">{doc.can_edit && <button className="btn btn-secondary" onClick={() => navigate(`/dashboard/${base}/${encodeURIComponent(name)}/edit`)}>Edit</button>}{meta.is_submittable && doc.docstatus === 0 && <button className="btn btn-primary" onClick={() => action(submitAccountingDocument, `${doctype} submitted`)}>Submit</button>}{meta.is_submittable && doc.docstatus === 1 && <button className="btn btn-danger" onClick={() => action(cancelAccountingDocument, `${doctype} cancelled`)}>Cancel</button>}</div>} />
    {connectionItems.length ? <div className="panel mb-4"><div className="panel-head"><div className="panel-title">Connections</div></div><div className="grid-form" style={{ padding: 20, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>{connectionItems.map((item) => <ConnectionButton key={item.key} icon={item.icon} label={item.label} path={item.path(name)} count={connections?.[item.key]} loading={loadingConnections} />)}</div></div> : null}
    <div className="space-y-4">{sections.map((section, index) => { const expanded = !section.collapsible || open[index]; return <div className="panel" key={`${section.label}-${index}`}><button type="button" className={`panel-head w-full text-left ${section.collapsible ? "cursor-pointer" : ""}`} onClick={() => section.collapsible && setOpen((current) => ({ ...current, [index]: !expanded }))}><div className="panel-title flex items-center gap-2">{section.collapsible ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : null}{section.label}</div></button>{expanded && <div className="grid-form" style={{ padding: 20 }}>{section.fields.map((field) => field.fieldtype === "Table" ? <ChildRows key={field.fieldname} field={field} rows={doc[field.fieldname] || []} /> : <Field key={field.fieldname} label={field.label || field.fieldname} value={doc[field.fieldname]} />)}</div>}</div>; })}</div></>;
}

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";

const BREAKS = new Set(["Section Break", "Column Break", "Tab Break"]);
const LONG = new Set(["Small Text", "Long Text", "Text", "Text Editor", "Code"]);
const Read = ({ value }) => <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">{value === null || value === undefined || value === "" ? "—" : String(value)}</div>;

function dependencyMet(expression, form) {
  if (!expression) return true;
  if (!expression.startsWith("eval:")) return Boolean(form[expression]);
  const source = expression.slice(5);
  const simple = source.match(/^doc\.([\w]+)\s*={2,3}\s*['\"]([^'\"]+)['\"]$/);
  if (simple) return String(form[simple[1]] ?? "") === simple[2];
  return true;
}

function FieldInput({ field, value, onChange, form, row = {} }) {
  const [options, setOptions] = useState([]);
  const dynamicDoctype = field.fieldtype === "Dynamic Link" ? row[field.options] : field.options;
  const companyRequired = ["paid_from", "paid_to", "cost_center", "account", "bank_account", "receivable_payable_account", "default_advance_account", "bank_cash_account"].includes(field.fieldname);
  const disabled = !dependencyMet(field.depends_on, form) || (companyRequired && !form.company);
  useEffect(() => {
    if (!["Link", "Dynamic Link"].includes(field.fieldtype) || !dynamicDoctype || disabled) { setOptions([]); return; }
    getAccountingLinkOptions(dynamicDoctype, {
      company: form.company, supplier: form.supplier, fieldname: field.fieldname,
      party_type: form.party_type || row.party_type, party: form.party || row.party,
      payment_type: form.payment_type, reference_type: row.reference_doctype || row.reference_type,
      account: row.account,
    }).then((data) => setOptions(data || [])).catch(() => setOptions([]));
  }, [dynamicDoctype, disabled, field.fieldname, field.fieldtype, form.company, form.party, form.party_type, form.payment_type, form.supplier, row.account, row.party, row.party_type, row.reference_doctype, row.reference_type]);
  if (field.read_only || field.fieldtype === "Read Only") return <Read value={value} />;
  if (["Link", "Dynamic Link"].includes(field.fieldtype)) return <SearchableSelect value={value || ""} onChange={onChange} options={options} disabled={disabled} placeholder={disabled ? (companyRequired && !form.company ? "Select a company first" : "Complete the dependent field first") : `Search ${field.label || dynamicDoctype}...`} />;
  if (field.fieldtype === "Select") return <select className="input" value={value || ""} onChange={(e) => onChange(e.target.value)}><option value="">Select...</option>{String(field.options || "").split("\n").filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select>;
  if (field.fieldtype === "Check") return <label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={Boolean(Number(value))} onChange={(e) => onChange(e.target.checked ? 1 : 0)} /> Yes</label>;
  if (LONG.has(field.fieldtype)) return <textarea className="input" rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  const type = field.fieldtype === "Date" ? "date" : field.fieldtype === "Datetime" ? "datetime-local" : field.fieldtype === "Time" ? "time" : ["Int", "Float", "Currency", "Percent"].includes(field.fieldtype) ? "number" : "text";
  return <input className="input" type={type} step={type === "number" ? "any" : undefined} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function FormField({ field, value, onChange, form, row }) {
  return <div className="field" style={LONG.has(field.fieldtype) ? { gridColumn: "1 / -1" } : undefined}><label className="label">{field.label || field.fieldname}{field.reqd ? <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span> : null}</label><FieldInput field={field} value={value} onChange={onChange} form={form} row={row} />{field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}</div>;
}

function ChildTable({ field, rows, form, onChange }) {
  const childFields = field.child_fields || [];
  const update = (index, key, value) => onChange(rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  return <div style={{ gridColumn: "1 / -1" }}><div className="mb-3 flex items-center justify-between"><label className="label">{field.label}</label><button type="button" className="btn btn-secondary" onClick={() => onChange([...rows, {}])}><Plus size={14} /> Add Row</button></div><div className="space-y-3">{rows.map((row, index) => <div className="rounded-lg border bg-card p-4" key={row.name || index}><div className="mb-3 flex items-center justify-between"><strong className="text-sm">Row {index + 1}</strong><button type="button" className="btn btn-ghost" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div><div className="grid-form">{childFields.map((child) => <FormField key={child.fieldname} field={child} value={row[child.fieldname]} onChange={(value) => update(index, child.fieldname, value)} form={form} row={row} />)}</div></div>)}</div>{!rows.length ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No rows added.</div> : null}</div>;
}

export default function AccountingDocumentForm({ meta, initial, onSave, submitLabel = "Save" }) {
  const defaults = useMemo(() => Object.fromEntries(meta.fields.filter((field) => field.default !== undefined && field.default !== null).map((field) => [field.fieldname, field.default])), [meta]);
  const [form, setForm] = useState({ ...defaults, ...(initial || {}) });
  useEffect(() => setForm({ ...defaults, ...(initial || {}) }), [defaults, initial]);
  const tabs = useMemo(() => { let tab = "Details", section = "Information"; const out = { Details: { Information: { fields: [], collapsible: false } } }; for (const field of meta.fields) { if (field.fieldtype === "Tab Break") { tab = field.label || "Details"; section = "Information"; out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: false }; } else if (field.fieldtype === "Section Break") { section = field.label || "Details"; out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: Boolean(field.collapsible) }; } else if (!BREAKS.has(field.fieldtype)) { out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: false }; out[tab][section].fields.push(field); } } return out; }, [meta]);
  const visibleTabs = Object.keys(tabs).filter((tab) => !["Connections", "Dashboard"].includes(tab));
  const [active, setActive] = useState(visibleTabs[0]);
  const [open, setOpen] = useState({});
  useEffect(() => setActive(visibleTabs[0]), [meta]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}><div className="mb-4 flex flex-wrap gap-2">{visibleTabs.length > 1 && visibleTabs.map((tab) => <button type="button" key={tab} className={`btn ${active === tab ? "btn-primary" : "btn-secondary"}`} onClick={() => setActive(tab)}>{tab}</button>)}</div><div className="space-y-4">{Object.entries(tabs[active] || {}).map(([section, config]) => { const expanded = !config.collapsible || open[`${active}-${section}`]; return <div className="panel" key={section}><button type="button" className={`panel-head w-full text-left ${config.collapsible ? "cursor-pointer" : ""}`} onClick={() => config.collapsible && setOpen((current) => ({ ...current, [`${active}-${section}`]: !expanded }))}><div className="panel-title flex items-center gap-2">{config.collapsible ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : null}{section}</div></button>{expanded ? <div className="grid-form" style={{ padding: 20 }}>{config.fields.map((field) => field.fieldtype === "Table" ? <ChildTable key={field.fieldname} field={field} rows={form[field.fieldname] || []} form={form} onChange={(value) => set(field.fieldname, value)} /> : <FormField key={field.fieldname} field={field} value={form[field.fieldname]} onChange={(value) => set(field.fieldname, value)} form={form} />)}</div> : null}</div>; })}</div><div className="mt-4 flex justify-end"><button className="btn btn-primary">{submitLabel}</button></div></form>;
}

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";
import { fmtDate } from "@/utils/format";

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

// Real Desk hooks that fetch related defaults when a key field changes on
// these doctypes (party() -> get_party_details(), etc.) -- called directly
// against the same whitelisted ERPNext methods Desk's own client scripts
// call, rather than reimplementing their account/currency lookup logic here.
const AUTO_FILL = {
  "Payment Entry": {
    async party(value, form) {
      if (!value || !form.party_type || !form.company) return null;
      try {
        const details = await callMethod("erpnext.accounts.doctype.payment_entry.payment_entry.get_party_details", {
          company: form.company, party_type: form.party_type, party: value, date: form.posting_date,
        });
        const accountField = form.payment_type === "Pay" ? "paid_to" : "paid_from";
        return { party_name: details?.party_name || value, [accountField]: details?.party_account || form[accountField] };
      } catch { return null; }
    },
    async party_type() { return { party: "", party_name: "" }; },
  },
  // customer_name is fetch_from: "customer.customer_name" in the real
  // DocType -- Frappe applies fetch_from server-side on save regardless, but
  // without this the read-only field would stay blank until the user saves.
  // dunning_type's own fetch_if_empty fields (dunning_fee, rate_of_interest,
  // income_account, cost_center) are mirrored the same way, only filling
  // whichever of them are still empty on this form.
  Dunning: {
    async customer(value) {
      if (!value) return { customer_name: "" };
      try {
        const data = await callMethod("frappe.client.get_value", { doctype: "Customer", filters: { name: value }, fieldname: ["customer_name"] });
        return { customer_name: data?.customer_name || value };
      } catch { return { customer_name: value }; }
    },
    async dunning_type(value, form) {
      if (!value) return null;
      try {
        const data = await callMethod("frappe.client.get_value", {
          doctype: "Dunning Type", filters: { name: value },
          fieldname: ["dunning_fee", "rate_of_interest", "income_account", "cost_center"],
        });
        return {
          dunning_fee: form.dunning_fee || data?.dunning_fee || 0,
          rate_of_interest: form.rate_of_interest || data?.rate_of_interest || 0,
          income_account: form.income_account || data?.income_account || "",
          cost_center: form.cost_center || data?.cost_center || "",
        };
      } catch { return null; }
    },
  },
};

function formatChildValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.fieldtype === "Date") return fmtDate(value);
  if (["Currency", "Float", "Percent"].includes(field.fieldtype)) return Number(value).toLocaleString();
  if (field.fieldtype === "Check") return Number(value) ? "Yes" : "No";
  return String(value);
}

function FieldInput({ field, value, onChange, form, row = {} }) {
  const [options, setOptions] = useState([]);
  const dynamicDoctype = field.fieldtype === "Dynamic Link" ? row[field.options] : field.options;
  const companyRequired = ["paid_from", "paid_to", "cost_center", "account", "bank_account", "receivable_payable_account", "default_advance_account", "bank_cash_account", "income_account"].includes(field.fieldname);
  const disabled = !dependencyMet(field.depends_on, form) || (companyRequired && !form.company);
  useEffect(() => {
    if (!["Link", "Dynamic Link"].includes(field.fieldtype) || !dynamicDoctype || disabled) { setOptions([]); return; }
    getAccountingLinkOptions(dynamicDoctype, {
      company: form.company, supplier: form.supplier, fieldname: field.fieldname,
      party_type: form.party_type || row.party_type, party: form.party || row.party,
      payment_type: form.payment_type, reference_type: row.reference_doctype || row.reference_type,
      account: row.account, customer: form.customer,
    }).then((data) => setOptions(data || [])).catch(() => setOptions([]));
  }, [dynamicDoctype, disabled, field.fieldname, field.fieldtype, form.company, form.customer, form.party, form.party_type, form.payment_type, form.supplier, row.account, row.party, row.party_type, row.reference_doctype, row.reference_type]);
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

// Compact summary table (columns = the child doctype's own in_list_view
// fields, same signal Desk's own grid view uses) + a modal for the full
// row -- replaces dumping every child field into an always-expanded card,
// which got unreadable once a row has a dozen+ fields (Journal Entry
// Account, Payment Entry Reference).
function ChildTable({ field, rows, form, onChange }) {
  const childFields = field.child_fields || [];
  const summaryFields = childFields.filter((f) => f.in_list_view).length ? childFields.filter((f) => f.in_list_view) : childFields.slice(0, 4);
  const [modal, setModal] = useState(null); // { row, index } | null
  const [deleteIndex, setDeleteIndex] = useState(null);
  function saveModal() {
    const rowsNext = [...rows];
    if (modal.index === null) rowsNext.push(modal.row); else rowsNext[modal.index] = modal.row;
    onChange(rowsNext);
    setModal(null);
  }
  const setModalField = (key, value) => setModal((m) => ({ ...m, row: { ...m.row, [key]: value } }));
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div className="mb-3 flex items-center justify-between">
        <label className="label">{field.label}</label>
        <Button type="button" variant="outline" size="sm" onClick={() => setModal({ row: {}, index: null })}><Plus size={14} className="mr-1" /> Add Row</Button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr>{summaryFields.map((f) => <th key={f.fieldname}>{f.label || f.fieldname}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.name || index} className="cursor-pointer" onClick={() => setModal({ row, index })}>
                {summaryFields.map((f) => <td key={f.fieldname}>{formatChildValue(f, row[f.fieldname])}</td>)}
                <td onClick={(e) => e.stopPropagation()}><button type="button" className="btn btn-ghost" onClick={() => setDeleteIndex(index)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={summaryFields.length + 1} className="muted" style={{ textAlign: "center", padding: 16 }}>No rows added.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(modal)} onClose={() => setModal(null)} title={field.label}
        footer={<><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button type="button" variant="default" onClick={saveModal}>Save Row</Button></>}
      >
        {modal ? <div className="grid-form">{childFields.map((f) => dependencyMet(f.depends_on, modal.row) && <FormField key={f.fieldname} field={f} value={modal.row[f.fieldname]} onChange={(v) => setModalField(f.fieldname, v)} form={form} row={modal.row} />)}</div> : null}
      </Modal>
      <ConfirmDialog
        open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}
        onConfirm={() => { onChange(rows.filter((_, i) => i !== deleteIndex)); setDeleteIndex(null); }}
        title="Remove this row?" description="This action cannot be undone." confirmLabel="Remove"
      />
    </div>
  );
}

export default function AccountingDocumentForm({ doctype, meta, initial, onSave, submitLabel = "Save" }) {
  const defaults = useMemo(() => Object.fromEntries(meta.fields.filter((field) => field.default !== undefined && field.default !== null).map((field) => [field.fieldname, field.default])), [meta]);
  const [form, setForm] = useState({ ...defaults, ...(initial || {}) });
  useEffect(() => setForm({ ...defaults, ...(initial || {}) }), [defaults, initial]);

  // Posting Date starts locked (matching real Desk's default posture on a
  // submittable doc) -- an explicit "Edit" toggle is required to change it,
  // so a draft can't silently drift off today's date from an accidental
  // click. This is a client-only UI toggle, not a persisted field.
  const hasPostingDate = meta.fields.some((f) => f.fieldname === "posting_date");
  const [dateUnlocked, setDateUnlocked] = useState(false);

  const tabs = useMemo(() => { let tab = "Details", section = "Information"; const out = { Details: { Information: { fields: [], collapsible: false } } }; for (const field of meta.fields) { if (field.fieldtype === "Tab Break") { tab = field.label || "Details"; section = "Information"; out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: false }; } else if (field.fieldtype === "Section Break") { section = field.label || "Details"; out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: Boolean(field.collapsible) }; } else if (!BREAKS.has(field.fieldtype)) { out[tab] ||= {}; out[tab][section] ||= { fields: [], collapsible: false }; out[tab][section].fields.push(field); } } return out; }, [meta]);
  // Excluding fields per-doctype (see EXCLUDE_FIELDS in document_api.py) can
  // leave a Tab Break with every one of its fields trimmed away -- e.g.
  // Customer's Sales Team / Portal Users tabs once loyalty/POS fields are
  // hidden. Drop those instead of rendering a clickable tab with nothing in it.
  const visibleTabs = Object.keys(tabs).filter((tab) => !["Connections", "Dashboard"].includes(tab) && Object.values(tabs[tab]).some((section) => section.fields.length));
  const [active, setActive] = useState(visibleTabs[0]);
  const [open, setOpen] = useState({});
  useEffect(() => setActive(visibleTabs[0]), [meta]);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    const hook = AUTO_FILL[doctype]?.[key];
    if (hook) {
      hook(value, { ...form, [key]: value }).then((patch) => { if (patch) setForm((current) => ({ ...current, ...patch })); });
    }
  }

  return <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}><div className="mb-4 flex flex-wrap gap-2">{visibleTabs.length > 1 && visibleTabs.map((tab) => <button type="button" key={tab} className={`btn ${active === tab ? "btn-primary" : "btn-secondary"}`} onClick={() => setActive(tab)}>{tab}</button>)}</div><div className="space-y-4">{Object.entries(tabs[active] || {}).filter(([, config]) => config.fields.length).map(([section, config]) => { const expanded = !config.collapsible || open[`${active}-${section}`]; return <div className="panel" key={section}><button type="button" className={`panel-head w-full text-left ${config.collapsible ? "cursor-pointer" : ""}`} onClick={() => config.collapsible && setOpen((current) => ({ ...current, [`${active}-${section}`]: !expanded }))}><div className="panel-title flex items-center gap-2">{config.collapsible ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />: null}{section}</div></button>{expanded ? <div className="grid-form" style={{ padding: 20 }}>{config.fields.map((field) => {
    if (field.fieldtype === "Table") return dependencyMet(field.depends_on, form) ? <ChildTable key={field.fieldname} field={field} rows={form[field.fieldname] || []} form={form} onChange={(value) => set(field.fieldname, value)} /> : null;
    if (field.fieldname === "posting_date" && hasPostingDate && meta.is_submittable) {
      return (
        <div className="field" key={field.fieldname}>
          <label className="label">{field.label}{field.reqd ? <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span> : null}</label>
          <div className="flex items-center gap-2">
            <input className="input" type="date" disabled={!dateUnlocked} value={form.posting_date || ""} onChange={(e) => set("posting_date", e.target.value)} />
            <label className="flex min-h-10 items-center gap-1 whitespace-nowrap text-xs font-medium text-muted-foreground"><input type="checkbox" checked={dateUnlocked} onChange={(e) => setDateUnlocked(e.target.checked)} /> Edit</label>
          </div>
        </div>
      );
    }
    return <FormField key={field.fieldname} field={field} value={form[field.fieldname]} onChange={(value) => set(field.fieldname, value)} form={form} />;
  })}</div> : null}</div>; })}</div><div className="mt-4 flex justify-end"><button className="btn btn-primary">{submitLabel}</button></div></form>;
}

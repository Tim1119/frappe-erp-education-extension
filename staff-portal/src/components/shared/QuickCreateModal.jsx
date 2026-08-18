import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";

export default function QuickCreateModal({ open, onClose, doctype, onCreated, defaults = {} }) {
  const [fields, setFields] = useState([]); const [form, setForm] = useState({}); const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open || !doctype) return;
    setLoading(true); setFields([]); setForm({ ...defaults });
    callMethod("education_extension.staff_portal_api.portal_api.get_quick_entry_fields", { doctype })
      .then((data) => { const visible = data || []; setFields(visible); const initial = { ...defaults }; visible.forEach((f) => { if (f.default && !initial[f.fieldname]) initial[f.fieldname] = f.default === "Today" ? new Date().toISOString().split("T")[0] : f.default; }); setForm(initial); })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [open, doctype, JSON.stringify(defaults)]);
  async function save() { for (const f of fields) { if (f.reqd && !form[f.fieldname]) { toast.error(`${f.label} is required`); return; } } setSaving(true); try { const doc = await callMethod("education_extension.staff_portal_api.portal_api.quick_create_document", { doctype, data: JSON.stringify(form) }); const name = doc?.name || doc; toast.success(`${doctype} created`); onCreated?.(name, doc); onClose?.(); } catch (error) { toast.error(getErrorMessage(error)); } finally { setSaving(false); } }
  function renderField(f) { const value = form[f.fieldname] ?? ""; const change = (next) => setForm((current) => ({ ...current, [f.fieldname]: next })); if (f.fieldtype === "Select") return <select className="input" value={value} onChange={(e) => change(e.target.value)}><option value="">Select...</option>{String(f.options || "").split("\n").filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select>; if (f.fieldtype === "Check") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(Number(value))} onChange={(e) => change(e.target.checked ? 1 : 0)} /> Yes</label>; if (["Small Text", "Text", "Long Text"].includes(f.fieldtype)) return <textarea className="input" rows={3} value={value} onChange={(e) => change(e.target.value)} />; const type = f.fieldtype === "Date" ? "date" : ["Int", "Float", "Currency"].includes(f.fieldtype) ? "number" : "text"; return <input className="input" type={type} value={value} onChange={(e) => change(e.target.value)} />; }
  return <Modal open={open} onClose={onClose} title={`Create ${doctype}`} footer={<><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="button" onClick={save} disabled={saving || loading}>{saving ? "Creating..." : "Create"}</Button></>}><div className="space-y-4">{fields.map((f) => <div key={f.fieldname}><label className="mb-1 block text-sm font-medium">{f.label}{f.reqd ? <span className="ml-1 text-destructive">*</span> : null}</label>{renderField(f)}</div>)}{loading && <p className="text-sm text-muted-foreground">Loading...</p>}{!loading && !fields.length && <p className="text-sm text-muted-foreground">No quick-entry fields are available for this document type.</p>}</div></Modal>;
}

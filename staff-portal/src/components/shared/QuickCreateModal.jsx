import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";
import SearchableSelect from "@/components/shared/SearchableSelect";

function LinkFieldSelect({ doctype, value, onChange, placeholder, parentDefaults = {} }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;
    const fields = doctype === "Employee" ? ["name", "employee_name"]
      : doctype === "User" ? ["name", "full_name"]
        : doctype === "Training Event" ? ["name", "event_name"] : ["name"];
    const filters = doctype === "Department" && parentDefaults.company
      ? { company: parentDefaults.company } : undefined;
    callMethod("frappe.client.get_list", {
      doctype,
      fields,
      filters,
      order_by: doctype === "Employee" ? "employee_name asc" : doctype === "User" ? "full_name asc" : "name asc",
      limit_page_length: 100,
    }).then((rows) => { if (active) setOptions(rows || []); })
      .catch((error) => { if (active) { setOptions([]); toast.error(getErrorMessage(error)); } });
    return () => { active = false; };
  }, [doctype, parentDefaults.company]);

  const displayField = doctype === "Employee" ? "employee_name"
    : doctype === "User" ? "full_name"
      : doctype === "Training Event" ? "event_name" : undefined;
  return <SearchableSelect value={value} onChange={onChange} options={options} displayField={displayField} showId={Boolean(displayField)} placeholder={placeholder} label={doctype} linkedDoctype={null} />;
}

export default function QuickCreateModal({ open, onClose, doctype, onCreated, defaults = {} }) {
  const [fields, setFields] = useState([]); const [form, setForm] = useState({}); const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(false);
  const [policyDetails, setPolicyDetails] = useState([]); const [leaveTypes, setLeaveTypes] = useState([]);
  useEffect(() => {
    if (!open || !doctype) return;
    setLoading(true); setFields([]); setForm({ ...defaults });
    setPolicyDetails(doctype === "Leave Policy" ? [{ leave_type: "", annual_allocation: "" }] : []);
    setLeaveTypes([]);
    callMethod("education_extension.staff_portal_api.portal_api.get_quick_entry_fields", { doctype })
      .then((data) => { const visible = data || []; setFields(visible); const initial = { ...defaults }; visible.forEach((f) => { if (f.default && !initial[f.fieldname]) initial[f.fieldname] = f.default === "Today" ? new Date().toISOString().split("T")[0] : f.default; }); setForm(initial); })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    if (doctype === "Leave Policy") {
      callMethod("frappe.client.get_list", { doctype: "Leave Type", fields: ["name", "max_leaves_allowed"], order_by: "name asc", limit_page_length: 500 })
        .then((rows) => setLeaveTypes(rows || []))
        .catch((error) => toast.error(getErrorMessage(error)));
    }
  }, [open, doctype, JSON.stringify(defaults)]);
  async function save() { for (const f of fields) { if (f.reqd && !form[f.fieldname]) { toast.error(`${f.label} is required`); return; } } if (doctype === "Leave Policy") { if (!policyDetails.length) { toast.error("Add at least one Leave Policy Detail"); return; } if (policyDetails.some((row) => !row.leave_type || row.annual_allocation === "" || row.annual_allocation === null || row.annual_allocation === undefined)) { toast.error("Leave Type and Annual Allocation are required in every row"); return; } } setSaving(true); try { const data = doctype === "Leave Policy" ? { ...form, leave_policy_details: policyDetails } : form; const doc = doctype === "Leave Policy" ? await callMethod("education_extension.staff_portal_api.hr.leaves.leave_policy_api.create_leave_policy", { data }) : await callMethod("education_extension.staff_portal_api.portal_api.quick_create_document", { doctype, data: JSON.stringify(data) }); const name = doc?.name || doc; if (doctype === "Leave Policy") await callMethod("education_extension.staff_portal_api.hr.leaves.leave_policy_api.submit_leave_policy", { name }); toast.success(`${doctype} created${doctype === "Leave Policy" ? " and submitted" : ""}`); onCreated?.(name, { ...form, ...(typeof doc === "object" ? doc : {}), name, title: form.title }); onClose?.(); } catch (error) { toast.error(getErrorMessage(error)); } finally { setSaving(false); } }
  function renderField(f) { const value = form[f.fieldname] ?? ""; const change = (next) => setForm((current) => ({ ...current, [f.fieldname]: next })); if (f.fieldtype === "Link" && f.options) return <LinkFieldSelect doctype={f.options} value={value} onChange={change} placeholder={`Search ${f.label || f.options}...`} parentDefaults={{ company: form.company || defaults.company }} />; if (f.fieldtype === "Select") return <select className="input" value={value} onChange={(e) => change(e.target.value)}><option value="">Select...</option>{String(f.options || "").split("\n").filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select>; if (f.fieldtype === "Check") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(Number(value))} onChange={(e) => change(e.target.checked ? 1 : 0)} /> Yes</label>; if (["Small Text", "Text", "Long Text"].includes(f.fieldtype)) return <textarea className="input" rows={3} value={value} onChange={(e) => change(e.target.value)} />; const type = f.fieldtype === "Date" ? "date" : ["Int", "Float", "Currency"].includes(f.fieldtype) ? "number" : "text"; return <input className="input" type={type} value={value} onChange={(e) => change(e.target.value)} />; }
  return <Modal open={open} onClose={onClose} title={`Create ${doctype}`} size={doctype === "Leave Policy" ? "lg" : undefined} footer={<><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="button" onClick={save} disabled={saving || loading}>{saving ? "Creating..." : doctype === "Leave Policy" ? "Create & Submit" : "Create"}</Button></>}><div className="space-y-4">{fields.map((f) => <div key={f.fieldname}><label className="mb-1 block text-sm font-medium">{f.label}{f.reqd ? <span className="ml-1 text-destructive">*</span> : null}</label>{renderField(f)}</div>)}{doctype === "Leave Policy" && <div><div className="mb-2 flex items-center justify-between"><div><p className="text-sm font-medium">Leave Policy Details <span className="text-destructive">*</span></p><p className="text-xs text-muted-foreground">Add each leave type and its annual allocation.</p></div><button type="button" className="btn btn-primary" onClick={() => setPolicyDetails((rows) => [...rows, { leave_type: "", annual_allocation: "" }])}>+ Add Leave Type</button></div><div className="overflow-x-auto rounded-md border"><table className="tbl"><thead><tr><th>Leave Type</th><th>Annual Allocation</th><th /></tr></thead><tbody>{policyDetails.map((row, index) => <tr key={index}><td style={{ minWidth: 220 }}><SearchableSelect value={row.leave_type || ""} onChange={(value) => { const selected = leaveTypes.find((item) => item.name === value); setPolicyDetails((rows) => rows.map((item, rowIndex) => rowIndex === index ? { ...item, leave_type: value, annual_allocation: item.annual_allocation === "" ? selected?.max_leaves_allowed ?? "" : item.annual_allocation } : item)); }} options={leaveTypes} label="Leave Type" placeholder="Search leave type..." linkedDoctype={null} /></td><td style={{ minWidth: 160 }}><input className="input" type="number" min="0" step="0.5" value={row.annual_allocation ?? ""} onChange={(event) => setPolicyDetails((rows) => rows.map((item, rowIndex) => rowIndex === index ? { ...item, annual_allocation: event.target.value } : item))} /></td><td><Button type="button" variant="ghost" size="sm" onClick={() => setPolicyDetails((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}>Remove</Button></td></tr>)}{!policyDetails.length && <tr><td colSpan={3} className="text-sm text-muted-foreground">No policy details added.</td></tr>}</tbody></table></div><button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => setPolicyDetails((rows) => [...rows, { leave_type: "", annual_allocation: "" }])}>+ Add Another Leave Type and Annual Allocation</button></div>}{loading && <p className="text-sm text-muted-foreground">Loading...</p>}{!loading && !fields.length && <p className="text-sm text-muted-foreground">No quick-entry fields are available for this document type.</p>}</div></Modal>;
}

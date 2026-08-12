import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EmployeeMetadataLayout from "./EmployeeMetadataLayout";
import { getEmployeeMeta } from "@/services/hr/employeeService";
import { getErrorMessage } from "@/utils/errors";

const NON_VALUES = new Set(["Tab Break", "Section Break", "Column Break", "HTML", "Button"]);
const NUMERIC_TYPES = new Set(["Check", "Int", "Float", "Currency", "Percent"]);

function initial(field) {
  if (field.fieldtype === "Table") return [];
  if (field.fieldtype === "Check") return Number(field.default || 0);
  if (NUMERIC_TYPES.has(field.fieldtype) && field.default != null) return Number(field.default) || 0;
  return field.default ?? "";
}

function normalized(field, value) {
  if (value === null || value === undefined) return initial(field);
  if ((value === 0 || value === "0") && !NUMERIC_TYPES.has(field.fieldtype) && field.default !== "0") return "";
  return value;
}

export default function EmployeeForm({ employee, onSave }) {
  const [meta, setMeta] = useState(null); const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  useEffect(() => { getEmployeeMeta().then(setMeta).catch((error) => toast.error(getErrorMessage(error))).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!meta) return;
    const next = {};
    for (const field of meta.fields || []) {
      if (!NON_VALUES.has(field.fieldtype) && !field.hidden) next[field.fieldname] = normalized(field, employee?.[field.fieldname]);
    }
    if (employee) { next.name = employee.name; next.can_edit = employee.can_edit; }
    setForm(next);
  }, [meta, employee]);
  const required = useMemo(() => (meta?.fields || []).filter((field) => field.reqd && !field.hidden && !field.read_only && !NON_VALUES.has(field.fieldtype)), [meta]);
  const change = (field, value) => setForm((old) => {
    const next = { ...old, [field]: value };
    if (field === "company" && value !== old.company) { next.department = ""; next.payroll_cost_center = ""; }
    if (["company_email", "personal_email", "user_id", "prefered_contact_email"].includes(field)) {
      const preferred = field === "prefered_contact_email" ? value : next.prefered_contact_email;
      const map = { "Company Email": "company_email", "Personal Email": "personal_email", "User ID": "user_id" };
      next.prefered_email = next[map[preferred]] || "";
    }
    return next;
  });
  async function submit(event) {
    event.preventDefault();
    const missing = required.find((field) => form[field.fieldname] === "" || form[field.fieldname] == null);
    if (missing) return toast.error(`${missing.label || missing.fieldname} is required`);
    setSaving(true); try { await onSave(form); } finally { setSaving(false); }
  }
  if (loading) return <div className="muted" style={{ padding: 20 }}>Loading Employee fields…</div>;
  return <form onSubmit={submit}><EmployeeMetadataLayout meta={meta} value={form} onChange={change} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 20px 20px" }}><button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : employee ? "Update Employee" : "Create Employee"}</button></div></form>;
}

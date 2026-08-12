import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CompanyMetadataLayout from "./CompanyMetadataLayout";
import { getCompanyMeta } from "@/services/hr/companyService";
import { getErrorMessage } from "@/utils/errors";

const NON_VALUE_TYPES = new Set(["Section Break", "Column Break", "Tab Break", "HTML", "Button"]);

function defaultValue(field) {
  if (field.fieldtype === "Check") return Number(field.default || 0);
  if (["Int", "Float", "Currency", "Percent"].includes(field.fieldtype) && field.default !== undefined && field.default !== null) return Number(field.default) || 0;
  return field.default ?? "";
}

export default function CompanyForm({ company, onSave }) {
  const [meta, setMeta] = useState(null); const [form, setForm] = useState({}); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  useEffect(() => { getCompanyMeta().then(setMeta).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!meta) return; const values = {}; for (const field of meta.fields || []) if (!NON_VALUE_TYPES.has(field.fieldtype)) values[field.fieldname] = company?.[field.fieldname] ?? defaultValue(field); if (company) Object.assign(values, company); setForm(values); }, [meta, company]);
  const requiredFields = useMemo(() => (meta?.fields || []).filter((field) => field.reqd && !field.hidden && !field.read_only && !NON_VALUE_TYPES.has(field.fieldtype)), [meta]);
  function update(field, value) { setForm((old) => ({ ...old, [field]: value })); }
  async function submit(event) { event.preventDefault(); const missing = requiredFields.find((field) => form[field.fieldname] === "" || form[field.fieldname] === null || form[field.fieldname] === undefined); if (missing) return toast.error(`${missing.label || missing.fieldname} is required`); setSaving(true); try { await onSave(form); } finally { setSaving(false); } }
  if (loading) return <div className="muted" style={{ padding: 20 }}>Loading Company fields…</div>; if (!meta) return <div className="muted" style={{ padding: 20 }}>Company metadata could not be loaded.</div>;
  return <form onSubmit={submit}><CompanyMetadataLayout meta={meta} value={form} onChange={update} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 20px 20px" }}><button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : company ? "Update Company" : "Create Company"}</button></div></form>;
}

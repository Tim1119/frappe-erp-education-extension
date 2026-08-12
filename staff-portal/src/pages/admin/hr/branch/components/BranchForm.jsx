import { useState } from "react";
import toast from "react-hot-toast";

export default function BranchForm({ onSave }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!value.trim()) return toast.error("Branch is required");
    setSaving(true);
    try { await onSave({ branch: value.trim() }); } finally { setSaving(false); }
  }
  return <form onSubmit={submit}><div className="panel-head"><div className="panel-title">Branch Information</div></div><div style={{ padding: 20 }}><div className="field" style={{ maxWidth: 560 }}><label className="label">Branch <span style={{ color: "var(--danger)" }}>*</span></label><input className="input" value={value} onChange={(event) => setValue(event.target.value)} /></div></div><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 20px 20px" }}><button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Create Branch"}</button></div></form>;
}

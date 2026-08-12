import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import DesignationForm from "./components/DesignationForm";
import { createDesignation, getDesignation, updateDesignation } from "@/services/hr/designationService";
import { getErrorMessage } from "@/utils/errors";

export default function DesignationFormPage() {
  const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const [designation, setDesignation] = useState(null); const [loading, setLoading] = useState(editing);
  useEffect(() => { if (editing) getDesignation(name).then(setDesignation).catch((error) => toast.error(getErrorMessage(error))).finally(() => setLoading(false)); }, [editing, name]);
  async function save(data) { try { const result = editing ? await updateDesignation(name, data) : await createDesignation(data); toast.success(editing ? "Designation updated" : "Designation created"); navigate(`/dashboard/designations/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (loading) return <div className="muted">Loading designation…</div>;
  if (editing && designation && !designation.can_edit) return <><PageHeader eyebrow="HR" title="Designation" /><div className="panel" style={{ padding: 20 }}><div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">You do not have permission to edit this designation.</div></div></>;
  return <><PageHeader eyebrow="HR" title={editing ? "Edit Designation" : "Create Designation"} /><div className="panel"><DesignationForm designation={designation} onSave={save} /></div></>;
}

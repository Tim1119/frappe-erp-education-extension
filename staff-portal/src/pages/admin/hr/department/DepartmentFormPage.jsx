import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { createDepartment, getDepartment, updateDepartment } from "@/services/hr/departmentService";
import { getErrorMessage } from "@/utils/errors";
import DepartmentForm from "./components/DepartmentForm";

export default function DepartmentFormPage() {
  const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const [department, setDepartment] = useState(null); const [loading, setLoading] = useState(editing);
  useEffect(() => { if (editing) getDepartment(name).then(setDepartment).catch((error) => toast.error(getErrorMessage(error))).finally(() => setLoading(false)); }, [editing, name]);
  async function save(data) { try { const result = editing ? await updateDepartment(name, data) : await createDepartment(data); toast.success(editing ? "Department updated" : "Department created"); navigate(`/dashboard/departments/${encodeURIComponent(result.name)}`); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (loading) return <div className="muted">Loading department…</div>;
  if (editing && department && !department.can_edit) return <><PageHeader eyebrow="HR" title="Department" /><div className="panel" style={{ padding: 20 }}><div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">{!department.parent_department ? "This is a root department and cannot be edited." : "You do not have permission to edit this department."}</div></div></>;
  return <><PageHeader eyebrow="HR" title={editing ? "Edit Department" : "Create Department"} /><div className="panel"><DepartmentForm department={department} onSave={save} /></div></>;
}

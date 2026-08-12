import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import EmployeeGradeForm from "./components/EmployeeGradeForm";
import { createEmployeeGrade, getEmployeeGrade, updateEmployeeGrade } from "@/services/hr/employeeGradeService";
import { getErrorMessage } from "@/utils/errors";

export default function EmployeeGradeFormPage() {
  const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : ""; const [grade, setGrade] = useState(null); const [loading, setLoading] = useState(editing);
  useEffect(() => { if (editing) getEmployeeGrade(name).then(setGrade).catch((error) => toast.error(getErrorMessage(error))).finally(() => setLoading(false)); }, [editing, name]);
  async function save(data) { try { const result = editing ? await updateEmployeeGrade(name, data) : await createEmployeeGrade(data); toast.success(editing ? "Employee Grade updated" : "Employee Grade created"); navigate(`/dashboard/employee-grades/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (loading) return <div className="muted">Loading employee grade…</div>;
  if (editing && grade && !grade.can_edit) return <><PageHeader eyebrow="HR" title="Employee Grade" /><div className="panel" style={{ padding: 20 }}><div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">You do not have permission to edit this employee grade.</div></div></>;
  return <><PageHeader eyebrow="HR" title={editing ? "Edit Employee Grade" : "Create Employee Grade"} /><div className="panel"><EmployeeGradeForm grade={grade} onSave={save} /></div></>;
}

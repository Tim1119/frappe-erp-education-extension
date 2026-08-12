import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import EmployeeForm from "./components/EmployeeForm";
import { createEmployee, getEmployee, updateEmployee } from "@/services/hr/employeeService";
import { getErrorMessage } from "@/utils/errors";

export default function EmployeeFormPage() { const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const [employee, setEmployee] = useState(null); const [loading, setLoading] = useState(editing); useEffect(() => { if (editing) getEmployee(name).then(setEmployee).catch((error) => toast.error(getErrorMessage(error))).finally(() => setLoading(false)); }, [editing, name]); async function save(data) { try { const result = editing ? await updateEmployee(name, data) : await createEmployee(data); toast.success(editing ? "Employee updated" : "Employee created"); navigate(`/dashboard/employees/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(getErrorMessage(error)); } } if (loading) return <div className="muted">Loading employee…</div>; if (editing && employee && !employee.can_edit) return <><PageHeader eyebrow="HR" title="Employee" /><div className="panel" style={{ padding: 20 }}><div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">You do not have permission to edit this employee.</div></div></>; return <><PageHeader eyebrow="HR" title={editing ? "Edit Employee" : "Create Employee"} /><div className="panel"><EmployeeForm employee={employee} onSave={save} /></div></>; }

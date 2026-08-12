import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Award, ClipboardList, LogOut, Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ConnectionsPanel from "../components/ConnectionsPanel";
import { deleteEmployeeGrade, getEmployeeGrade, getEmployeeGradeConnections } from "@/services/hr/employeeGradeService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value === null || value === undefined || value === "" ? "—" : value}</p></div>; }
export default function EmployeeGradeProfilePage() {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate();
  const [grade, setGrade] = useState(null); const [connections, setConnections] = useState({}); const [removeOpen, setRemoveOpen] = useState(false);
  useEffect(() => { Promise.all([getEmployeeGrade(name), getEmployeeGradeConnections(name)]).then(([doc, counts]) => { setGrade(doc); setConnections(counts || {}); }).catch((error) => toast.error(getErrorMessage(error))); }, [name]);
  async function remove() { try { await deleteEmployeeGrade(name); toast.success("Employee Grade deleted"); navigate("/dashboard/employee-grades"); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (!grade) return <div className="muted">Loading employee grade…</div>;
  const actions = <div style={{ display: "flex", gap: 10 }}>{grade.can_edit && <button className="btn btn-secondary" onClick={() => navigate(`/dashboard/employee-grades/${encodeURIComponent(name)}/edit`)}>Edit</button>}<button className="btn btn-danger" onClick={() => setRemoveOpen(true)}>Delete</button></div>;
  return <><PageHeader eyebrow="HR" title={grade.name} button={actions} /><div className="panel"><div className="panel-head"><div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Award size={15} style={{ color: "var(--ink-4)" }} /> Employee Grade Information</div></div><div className="grid-form" style={{ padding: "10px 20px 26px" }}><Field label="Employee Grade Name" value={grade.name} /><Field label="Default Salary Structure" value={grade.default_salary_structure} /><Field label="Currency" value={grade.currency} /><Field label="Default Base Pay" value={grade.default_base_pay ? Number(grade.default_base_pay).toLocaleString() : "—"} /></div></div><ConnectionsPanel groups={[{ label: "HR", items: [{ icon: Users, label: "Employees", count: connections.employees, onClick: () => navigate(`/dashboard/employees?grade=${encodeURIComponent(name)}`) }, { icon: ClipboardList, label: "Onboarding Templates", count: connections.onboarding_templates, onClick: () => navigate(`/dashboard/employee-onboarding-templates?employee_grade=${encodeURIComponent(name)}`) }, { icon: LogOut, label: "Separation Templates", count: connections.separation_templates, onClick: () => navigate(`/dashboard/employee-separation-templates?employee_grade=${encodeURIComponent(name)}`) }] }]} /><ConfirmDialog open={removeOpen} onClose={() => setRemoveOpen(false)} onConfirm={remove} title={`Delete ${grade.name}?`} description="Linked HR records may prevent deletion." confirmLabel="Delete" /></>;
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BriefcaseBusiness, Network, Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ConnectionsPanel from "../components/ConnectionsPanel";
import { deleteDepartment, getDepartment, getDepartmentConnections } from "@/services/hr/departmentService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {value === undefined || value === null || value === "" ? "—" : value}
      </p>
    </div>
  );
}
export default function DepartmentProfilePage() {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate();
  const [department, setDepartment] = useState(null); const [connections, setConnections] = useState({}); const [removeOpen, setRemoveOpen] = useState(false);
  useEffect(() => { Promise.all([getDepartment(name), getDepartmentConnections(name)]).then(([doc, counts]) => { setDepartment(doc); setConnections(counts || {}); }).catch((error) => toast.error(getErrorMessage(error))); }, [name]);
  async function remove() { try { await deleteDepartment(name); toast.success("Department deleted"); navigate("/dashboard/departments"); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (!department) return <div className="muted">Loading department…</div>;
  const isRoot = !department.parent_department; const actions = department.can_edit ? <div style={{ display: "flex", gap: 10 }}><button className="btn btn-secondary" onClick={() => navigate(`/dashboard/departments/${encodeURIComponent(name)}/edit`)}>Edit</button><button className="btn btn-danger" onClick={() => setRemoveOpen(true)}>Delete</button></div> : null;
  return <><PageHeader eyebrow="HR" title={department.department_name || department.name} sub={department.company} button={actions} />{isRoot && <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground" style={{ marginBottom: 18 }}>This is a root department and cannot be edited.</div>}<div className="panel"><div className="panel-head"><div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Network size={17} /> Department Information</div></div><div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}><Field label="Department" value={department.department_name} /><Field label="Company" value={department.company} /><Field label="Parent Department" value={department.parent_department} /><Field label="Is Group" value={department.is_group ? "Yes" : "No"} /><Field label="Disabled" value={department.disabled ? "Yes" : "No"} /></div></div><ConnectionsPanel groups={[{ label: "HR", items: [{ icon: Users, label: "Employees", count: connections.employees, onClick: () => navigate(`/dashboard/employees?department=${encodeURIComponent(name)}`) }, { icon: BriefcaseBusiness, label: "Job Openings", count: connections.job_openings, onClick: () => navigate(`/dashboard/job-openings?department=${encodeURIComponent(name)}`) }, { icon: Network, label: "Child Departments", count: connections.child_departments, onClick: () => navigate(`/dashboard/departments?parent_department=${encodeURIComponent(name)}`) }] }]} /><ConfirmDialog open={removeOpen} onClose={() => setRemoveOpen(false)} onConfirm={remove} title={`Delete ${department.department_name}?`} description="This action cannot be undone." confirmLabel="Delete" /></>;
}

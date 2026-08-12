import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BriefcaseBusiness, GitBranch, Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ConnectionsPanel from "../components/ConnectionsPanel";
import { deleteBranch, getBranch, getBranchConnections } from "@/services/hr/branchService";
import { getErrorMessage } from "@/utils/errors";

export default function BranchProfilePage() {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate();
  const [branch, setBranch] = useState(null); const [connections, setConnections] = useState({}); const [removeOpen, setRemoveOpen] = useState(false);
  useEffect(() => { Promise.all([getBranch(name), getBranchConnections(name)]).then(([doc, counts]) => { setBranch(doc); setConnections(counts || {}); }).catch((error) => toast.error(getErrorMessage(error))); }, [name]);
  async function remove() { try { await deleteBranch(name); toast.success("Branch deleted"); navigate("/dashboard/branches"); } catch (error) { toast.error(getErrorMessage(error)); } }
  if (!branch) return <div className="muted">Loading branch…</div>;
  const actions = <button className="btn btn-danger" onClick={() => setRemoveOpen(true)}>Delete</button>;
  return <><PageHeader eyebrow="HR" title={branch.branch || branch.name} button={actions} /><div className="panel"><div className="panel-head"><div className="panel-title">Branch Information</div></div><div style={{ padding: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><GitBranch size={22} style={{ color: "var(--brand)" }} /><div><div className="label">Branch</div><div style={{ fontWeight: 600 }}>{branch.branch}</div></div></div></div></div><ConnectionsPanel groups={[{ label: "HR", items: [{ icon: Users, label: "Employees", count: connections.employees, onClick: () => navigate(`/dashboard/employees?branch=${encodeURIComponent(name)}`) }, { icon: BriefcaseBusiness, label: "Job Openings", count: connections.job_openings, onClick: () => navigate(`/dashboard/job-openings?branch=${encodeURIComponent(name)}`) }] }]} /><ConfirmDialog open={removeOpen} onClose={() => setRemoveOpen(false)} onConfirm={remove} title={`Delete ${branch.branch}?`} description="This action cannot be undone." confirmLabel="Delete" /></>;
}

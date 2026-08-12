import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Network, Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import CompanyMetadataLayout from "./components/CompanyMetadataLayout";
import { deleteCompany, getCompany, getCompanyConnections, getCompanyMeta } from "@/services/hr/companyService";
import { getErrorMessage } from "@/utils/errors";

function Connection({ icon: Icon, label, count, onClick }) { return <button type="button" onClick={onClick} className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent" style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} /></div><div><div className="text-sm font-medium">{label}</div><div className="text-xs text-muted-foreground">{Number(count || 0).toLocaleString()} records</div></div></button>; }

export default function CompanyProfilePage() {
  const { id } = useParams(); const navigate = useNavigate(); const name = decodeURIComponent(id);
  const [company, setCompany] = useState(null); const [meta, setMeta] = useState(null); const [connections, setConnections] = useState({}); const [loading, setLoading] = useState(true); const [deleteOpen, setDeleteOpen] = useState(false);
  useEffect(() => { Promise.all([getCompany(name), getCompanyMeta(), getCompanyConnections(name)]).then(([doc, metadata, counts]) => { setCompany(doc); setMeta(metadata); setConnections(counts || {}); }).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false)); }, [name]);
  async function remove() { try { await deleteCompany(name); toast.success("Company deleted successfully"); navigate("/dashboard/company"); } catch (err) { toast.error(getErrorMessage(err)); } }
  if (loading) return <div className="muted">Loading company…</div>; if (!company || !meta) return <div className="muted">Company not found</div>;
  return <><PageHeader eyebrow="HR" title={company.company_name || company.name} sub={company.abbr} button={<div style={{ display: "flex", gap: 10 }}><button className="btn btn-secondary" onClick={() => navigate(`/dashboard/company/${encodeURIComponent(name)}/edit`)}>Edit</button><button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>Delete</button></div>} />
    <div className="panel" style={{ marginBottom: 18 }}><div style={{ padding: 20, display: "flex", alignItems: "center", gap: 15 }}><div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={26} /></div><div><div style={{ fontSize: 19, fontWeight: 650 }}>{company.company_name}</div><div className="muted">{company.abbr || "No abbreviation"}</div></div></div></div>
    <div className="panel" style={{ marginBottom: 18 }}><CompanyMetadataLayout meta={meta} value={company} onChange={() => {}} mode="view" /></div>
    <div className="panel"><div className="panel-head"><div className="panel-title">Connections</div></div><div style={{ padding: "14px 20px 24px" }}><div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>HR</div><div className="grid gap-3 sm:grid-cols-2"><Connection icon={Users} label="Employees" count={connections.employees} onClick={() => navigate(`/dashboard/employees?company=${encodeURIComponent(name)}`)} /><Connection icon={Network} label="Departments" count={connections.departments} onClick={() => navigate(`/dashboard/departments?company=${encodeURIComponent(name)}`)} /></div></div></div>
    <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} title={`Delete ${company.company_name}?`} description="This action cannot be undone. Frappe will prevent deletion when linked transactions exist." confirmLabel="Delete" />
  </>;
}

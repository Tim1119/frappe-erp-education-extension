import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, EmptyState } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { deleteCompany, getCompanies, getCountries } from "@/services/hr/companyService";
import { getErrorMessage } from "@/utils/errors";

function GroupBadge({ isGroup }) {
  return <span className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold" style={isGroup ? { background: "var(--info-soft)", color: "var(--info)" } : { background: "var(--surface-2)", color: "var(--ink-3)" }}>{isGroup ? "Group" : "Single"}</span>;
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { page, setPage } = usePagination(1);
  const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [country, setCountry] = useState(""); const [countries, setCountries] = useState([]); const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { getCountries().then((data) => setCountries((data || []).map((row) => row.name))).catch(() => setCountries([])); }, []);
  async function load() { try { setLoading(true); const result = await getCompanies({ page, search, country: country || undefined }); setRows(result.rows || []); setCount(result.count || 0); } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, search, country]);
  async function confirmDelete() { try { await deleteCompany(deleteTarget.name); toast.success("Company deleted"); setDeleteTarget(null); load(); } catch (err) { toast.error(getErrorMessage(err)); } }

  return <>
    <PageHeader eyebrow="HR" title="Companies" sub={loading ? "Loading..." : `${count} companies`} button={<button className="btn btn-primary" onClick={() => navigate("/dashboard/company/new")}><Plus size={15} /> Add Company</button>} />
    <Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} filters={[{ key: "country", label: "Country", value: country, onChange: (value) => { setCountry(value); setPage(1); }, options: countries }]} />
    <div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Company Name</th><th>Abbreviation</th><th>Country</th><th>Default Currency</th><th>Parent Company</th><th>Type</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/company/${encodeURIComponent(row.name)}`)}><td><div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 550 }}><Building2 size={17} style={{ color: "var(--ink-4)" }} />{row.company_name || row.name}</div></td><td className="muted2">{row.abbr || "—"}</td><td>{row.country || "—"}</td><td>{row.default_currency || "—"}</td><td>{row.parent_company || "—"}</td><td><GroupBadge isGroup={row.is_group} /></td><td onClick={(e) => e.stopPropagation()}><RowActionsMenu onView={() => navigate(`/dashboard/company/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit ? () => navigate(`/dashboard/company/${encodeURIComponent(row.name)}/edit`) : undefined} onDelete={row.can_delete ? () => setDeleteTarget(row) : undefined} /></td></tr>)}{!loading && !rows.length && <tr><td colSpan={7}><EmptyState title="No companies found" sub="No company records available." /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div>
    <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={`Delete ${deleteTarget?.company_name || deleteTarget?.name}?`} description="This action cannot be undone. Frappe will prevent deletion when linked transactions exist." confirmLabel="Delete" />
  </>;
}

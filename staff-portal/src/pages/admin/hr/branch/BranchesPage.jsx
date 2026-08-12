import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { deleteBranch, getBranches } from "@/services/hr/branchService";
import { getErrorMessage } from "@/utils/errors";

export default function BranchesPage() {
  const navigate = useNavigate(); const { page, setPage } = usePagination(1);
  const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [target, setTarget] = useState(null);
  async function load() { try { setLoading(true); const result = await getBranches({ page, search }); setRows(result.rows || []); setCount(result.count || 0); } catch (error) { toast.error(getErrorMessage(error)); } finally { setLoading(false); } }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, search]);
  async function remove() { try { await deleteBranch(target.name); toast.success("Branch deleted"); setTarget(null); load(); } catch (error) { toast.error(getErrorMessage(error)); } }
  return <><PageHeader eyebrow="HR" title="Branches" sub={loading ? "Loading..." : `${count} branches`} button={<button className="btn btn-primary" onClick={() => navigate("/dashboard/branches/new")}><Plus size={15} /> Add Branch</button>} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} /><div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Branch</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/branches/${encodeURIComponent(row.name)}`)}><td><div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 550 }}><GitBranch size={17} />{row.branch || row.name}</div></td><td onClick={(event) => event.stopPropagation()}><RowActionsMenu onView={() => navigate(`/dashboard/branches/${encodeURIComponent(row.name)}`)} onDelete={() => setTarget(row)} /></td></tr>)}{!loading && !rows.length && <tr><td colSpan={2}><EmptyState title="No branches found" sub="No branch records available." /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div><ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} title={`Delete ${target?.branch || target?.name}?`} description="This action cannot be undone." confirmLabel="Delete" /></>;
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Network, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { deleteDepartment, getCompanies, getDepartments } from "@/services/hr/departmentService";
import { getErrorMessage } from "@/utils/errors";

const Badge = ({ children, active }) => <span className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold" style={{ background: active ? "var(--info-soft)" : "var(--surface-2)", color: active ? "var(--info)" : "var(--ink-3)" }}>{children}</span>;
export default function DepartmentsPage() {
  const navigate = useNavigate(); const [searchParams] = useSearchParams(); const { page, setPage } = usePagination(1); const initialCompany = searchParams.get("company") || ""; const parentDepartment = searchParams.get("parent_department") || "";
  const [rows, setRows] = useState([]); const [count, setCount] = useState(0); const [search, setSearch] = useState(""); const [company, setCompany] = useState(initialCompany); const [companies, setCompanies] = useState([]); const [loading, setLoading] = useState(true); const [target, setTarget] = useState(null);
  useEffect(() => { getCompanies().then((data) => setCompanies((data || []).map((row) => row.name))).catch(() => setCompanies([])); }, []);
  async function load() { try { setLoading(true); const result = await getDepartments({ page, search, company: company || undefined, parent_department: parentDepartment || undefined }); setRows(result.rows || []); setCount(result.count || 0); } catch (error) { toast.error(getErrorMessage(error)); } finally { setLoading(false); } }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, search, company, parentDepartment]);
  async function remove() { try { await deleteDepartment(target.name); toast.success("Department deleted"); setTarget(null); load(); } catch (error) { toast.error(getErrorMessage(error)); } }
  return <><PageHeader eyebrow="HR" title="Departments" sub={loading ? "Loading..." : `${count} departments`} button={<button className="btn btn-primary" onClick={() => navigate("/dashboard/departments/new")}><Plus size={15} /> Add Department</button>} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} filters={[{ key: "company", label: "Company", value: company, onChange: (value) => { setCompany(value); setPage(1); }, options: companies }]} /><div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Department</th><th>Company</th><th>Parent Department</th><th>Type</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/departments/${encodeURIComponent(row.name)}`)}><td><div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 550 }}><Network size={17} />{row.department_name || row.name}</div></td><td>{row.company}</td><td>{row.parent_department || "—"}</td><td><Badge active={row.is_group}>{row.is_group ? "Group" : "Department"}</Badge></td><td><Badge active={!row.disabled}>{row.disabled ? "Disabled" : "Active"}</Badge></td><td onClick={(event) => event.stopPropagation()}><RowActionsMenu onView={() => navigate(`/dashboard/departments/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit ? () => navigate(`/dashboard/departments/${encodeURIComponent(row.name)}/edit`) : undefined} onDelete={() => setTarget(row)} /></td></tr>)}{!loading && !rows.length && <tr><td colSpan={6}><EmptyState title="No departments found" sub="No department records available." /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div><ConfirmDialog open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} title={`Delete ${target?.department_name || target?.name}?`} description="This action cannot be undone. Child departments and linked records may prevent deletion." confirmLabel="Delete" /></>;
}

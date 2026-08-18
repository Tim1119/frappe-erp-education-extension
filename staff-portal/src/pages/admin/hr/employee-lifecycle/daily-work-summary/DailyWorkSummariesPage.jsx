import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import StatusBadge from "@/components/shared/StatusBadge";
import { usePagination } from "@/hooks";
import { getDailyWorkSummaries, getDailyWorkSummaryGroups } from "@/services/employee-lifecycle/dailyWorkSummaryService";
import { getErrorMessage } from "@/utils/errors";

export default function DailyWorkSummariesPage() {
  const navigate = useNavigate();
  const { page, setPage } = usePagination(1);
  const [rows, setRows] = useState([]); const [count, setCount] = useState(0);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const [group, setGroup] = useState(""); const [groups, setGroups] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getDailyWorkSummaryGroups().then((data) => setGroups(data || [])).catch(() => setGroups([])); }, []);
  useEffect(() => { let active = true; setLoading(true); getDailyWorkSummaries({ page, search, status: status || undefined, daily_work_summary_group: group || undefined }).then((result) => { if (active) { setRows(result.rows || []); setCount(result.count || 0); } }).catch((error) => toast.error(getErrorMessage(error))).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [page, search, status, group]);
  return <><PageHeader eyebrow="HR · Employee Lifecycle" title="Daily Work Summaries" sub={loading ? "Loading..." : `${count} summaries`} /><Toolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} filters={[{ key: "status", label: "Status", value: status, onChange: (value) => { setStatus(value); setPage(1); }, options: ["Open", "Sent"] }, { key: "group", label: "Group", value: group, onChange: (value) => { setGroup(value); setPage(1); }, options: groups.map((row) => row.name) }]} /><div className="panel"><div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Summary</th><th>Group</th><th>Status</th><th>Email Sent To</th><th>Created</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="cursor-pointer" onClick={() => navigate(`/dashboard/daily-work-summaries/${encodeURIComponent(row.name)}`)}><td><div className="flex items-center gap-2 font-medium"><ClipboardList size={15} />{row.name}</div></td><td>{row.daily_work_summary_group || "—"}</td><td><StatusBadge status={row.status} /></td><td className="max-w-xs truncate">{row.email_sent_to || "—"}</td><td>{row.creation ? new Date(row.creation).toLocaleString() : "—"}</td></tr>)}{!loading && !rows.length && <tr><td colSpan={5}><EmptyState icon={ClipboardList} title="No daily work summaries found" sub="Summaries are generated automatically by the system." /></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count} /></div></>;
}

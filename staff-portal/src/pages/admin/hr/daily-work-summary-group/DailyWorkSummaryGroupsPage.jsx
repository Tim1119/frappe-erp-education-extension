import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { deleteDailyWorkSummaryGroup, getDailyWorkSummaryGroups, getDailyWorkSummaryHolidayLists } from "@/services/hr/dailyWorkSummaryGroupService";
import { getErrorMessage } from "@/utils/errors";

export default function DailyWorkSummaryGroupsPage() {
  const nav = useNavigate(); const { page, setPage } = usePagination(1);
  const [rows,setRows]=useState([]), [count,setCount]=useState(0), [search,setSearch]=useState("");
  const [enabled,setEnabled]=useState(""), [holiday,setHoliday]=useState(""), [holidays,setHolidays]=useState([]);
  const [loading,setLoading]=useState(true), [target,setTarget]=useState(null);
  useEffect(()=>{ getDailyWorkSummaryHolidayLists().then(x=>setHolidays(x||[])); },[]);
  async function load(){try{setLoading(true);const enabledValue=enabled==="Enabled"?1:enabled==="Disabled"?0:undefined;const r=await getDailyWorkSummaryGroups({page,search,enabled:enabledValue,holiday_list:holiday||undefined});setRows(r.rows||[]);setCount(r.count||0);}catch(e){toast.error(getErrorMessage(e));}finally{setLoading(false);}}
  useEffect(()=>{load();/* eslint-disable-next-line react-hooks/exhaustive-deps */},[page,search,enabled,holiday]);
  async function remove(){try{await deleteDailyWorkSummaryGroup(target.name);toast.success("Group deleted");setTarget(null);load();}catch(e){toast.error(getErrorMessage(e));}}
  return <><PageHeader eyebrow="HR · Settings" title="Daily Work Summary Groups" sub={loading?"Loading...":`${count} groups`} button={<button className="btn btn-primary" onClick={()=>nav("/dashboard/daily-work-summary-groups/new")}><Plus size={15}/> Add Group</button>}/><Toolbar search={search} onSearch={v=>{setSearch(v);setPage(1);}} filters={[{key:"enabled",label:"Status",value:enabled,onChange:setEnabled,options:["Enabled","Disabled"]},{key:"holiday",label:"Holiday List",value:holiday,onChange:setHoliday,options:holidays.map(x=>x.name)}]}/><div className="panel"><div style={{overflowX:"auto"}}><table className="tbl"><thead><tr><th>Group</th><th>Status</th><th>Users</th><th>Send Emails At</th><th>Holiday List</th><th>Subject</th><th/></tr></thead><tbody>{rows.map(r=><tr key={r.name} className="cursor-pointer" onClick={()=>nav(`/dashboard/daily-work-summary-groups/${encodeURIComponent(r.name)}`)}><td><b>{r.name}</b></td><td><span className={`badge ${r.enabled?"badge-green":"badge-gray"}`}>{r.enabled?"Enabled":"Disabled"}</span></td><td><span className="flex items-center gap-1"><UsersRound size={15}/>{r.user_count||0}</span></td><td>{r.send_emails_at||"—"}</td><td>{r.holiday_list||"—"}</td><td>{r.subject||"—"}</td><td onClick={e=>e.stopPropagation()}><RowActionsMenu onView={()=>nav(`/dashboard/daily-work-summary-groups/${encodeURIComponent(r.name)}`)} onEdit={r.can_edit?()=>nav(`/dashboard/daily-work-summary-groups/${encodeURIComponent(r.name)}/edit`):undefined} onDelete={r.can_delete?()=>setTarget(r):undefined}/></td></tr>)}{!loading&&!rows.length&&<tr><td colSpan={7}><EmptyState title="No daily work summary groups found" sub="No groups match these filters."/></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count}/></div><ConfirmDialog open={!!target} onClose={()=>setTarget(null)} onConfirm={remove} title={`Delete ${target?.name}?`} description="Linked summaries may prevent deletion." confirmLabel="Delete"/></>;
}

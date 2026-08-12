import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquareText, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import { usePagination } from "@/hooks";
import { getTeamUpdates, getTeamUpdateSenders } from "@/services/hr/teamUpdatesService";
import { getErrorMessage } from "@/utils/errors";

function plain(value) { if (!value) return ""; const node = document.createElement("div"); node.innerHTML = value; return node.textContent || node.innerText || ""; }
export default function TeamUpdatesPage() {
  const [searchParams] = useSearchParams(); const group = searchParams.get("group") || "";
  const { page, setPage } = usePagination(1); const [rows,setRows]=useState([]), [count,setCount]=useState(0);
  const [search,setSearch]=useState(""), [sender,setSender]=useState(""), [from,setFrom]=useState(""), [to,setTo]=useState("");
  const [senders,setSenders]=useState([]), [loading,setLoading]=useState(true);
  useEffect(()=>{getTeamUpdateSenders().then(x=>setSenders(x||[])).catch(()=>setSenders([]));},[]);
  useEffect(()=>{async function load(){try{setLoading(true);const r=await getTeamUpdates({page,search,group:group||undefined,sender:sender||undefined,date_from:from||undefined,date_to:to||undefined});setRows(r.rows||[]);setCount(r.count||0);}catch(e){toast.error(getErrorMessage(e));}finally{setLoading(false);}}load();},[page,search,sender,from,to,group]);
  return <><PageHeader eyebrow="HR · Settings" title="Team Updates" sub={loading?"Loading...":`${count} updates`}/><Toolbar search={search} onSearch={v=>{setSearch(v);setPage(1);}} filters={[{key:"sender",label:"Sender",value:sender,onChange:setSender,options:senders.map(x=>x.name)}]}/><div className="mb-4 grid gap-3 sm:grid-cols-2 sm:max-w-xl"><div className="field"><label className="label">From Date</label><input className="input" type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}}/></div><div className="field"><label className="label">To Date</label><input className="input" type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}}/></div></div><div className="space-y-3">{rows.map(row=><article key={row.name} className="panel" style={{padding:20}}><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"><UserRound size={17}/></div><div><p className="text-sm font-bold">{row.sender_name||row.sender}</p><p className="text-xs text-muted-foreground">{row.sender} · {new Date(row.creation).toLocaleString()}</p></div></div>{row.reference_name&&<span className="badge badge-gray">{row.reference_name}</span>}</div>{row.subject&&<p className="mt-4 text-sm font-bold">{row.subject}</p>}<p className="mt-3 whitespace-pre-wrap text-sm leading-6">{plain(row.display_content)}</p></article>)}{!loading&&!rows.length&&<div className="panel"><EmptyState icon={MessageSquareText} title="No team updates found" sub="Replies to Daily Work Summary emails will appear here."/></div>}<div className="panel"><Pager page={page} setPage={setPage} pageSize={20} count={count}/></div></div></>;
}

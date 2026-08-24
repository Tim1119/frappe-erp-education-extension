import { useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { EmptyState, PageHeader } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import { getErrorMessage } from "@/utils/errors";

const Status=({value})=><span className={`badge ${Number(value)===1?"badge-green":Number(value)===2?"badge-red":"badge-gray"}`}>{Number(value)===1?"Submitted":Number(value)===2?"Cancelled":"Draft"}</span>;

export default function LeaveListPage({config}) {
  const navigate=useNavigate(); const [searchParams]=useSearchParams(); const {page,setPage}=usePagination(1); const [rows,setRows]=useState([]); const [count,setCount]=useState(0); const [search,setSearch]=useState(""); const [loading,setLoading]=useState(true); const [target,setTarget]=useState(null);
  const queryFilters=Object.fromEntries([...searchParams.entries()].filter(([key])=>key!=="page"));
  async function load(){try{setLoading(true);const result=await config.service.list({page,search,filters:queryFilters});setRows(result.rows||[]);setCount(result.count||0);}catch(error){toast.error(getErrorMessage(error));}finally{setLoading(false);}}
  useEffect(()=>{load();/* eslint-disable-next-line react-hooks/exhaustive-deps */},[page,search,searchParams.toString()]);
  async function remove(){try{await config.service.delete(target.name);toast.success(`${config.singular} deleted`);setTarget(null);load();}catch(error){toast.error(getErrorMessage(error));}}
  async function submit(row){try{await config.service.submit(row.name);toast.success(`${config.singular} submitted`);load();}catch(error){toast.error(getErrorMessage(error));}}
  return <><PageHeader eyebrow="HR · Leaves" title={config.plural} sub={loading?"Loading...":`${count} records`} button={<button className="btn btn-primary" onClick={()=>navigate(`/dashboard/${config.path}/new`)}><Plus size={15}/> Add {config.singular}</button>}/><Toolbar search={search} onSearch={value=>{setSearch(value);setPage(1);}}/><div className="panel"><div className="overflow-x-auto"><table className="tbl"><thead><tr>{config.columns.map(column=><th key={column.name}>{column.label}</th>)}<th/></tr></thead><tbody>{rows.map(row=><tr key={row.name} className="cursor-pointer" onClick={()=>navigate(`/dashboard/${config.path}/${encodeURIComponent(row.name)}`)}>{config.columns.map(column=><td key={column.name}>{column.name==="docstatus"?<Status value={row.docstatus}/>:column.format?column.format(row[column.name],row):(row[column.name]??"—")}</td>)}<td onClick={event=>event.stopPropagation()}><div className="flex items-center gap-2">{config.status?.(row)&&<span className={`badge ${config.status(row).className}`}>{config.status(row).text}</span>}<RowActionsMenu onView={()=>navigate(`/dashboard/${config.path}/${encodeURIComponent(row.name)}`)} onEdit={row.can_edit?()=>navigate(`/dashboard/${config.path}/${encodeURIComponent(row.name)}/edit`):undefined} onDelete={row.can_delete?()=>setTarget(row):undefined} extra={config.submittable&&Number(row.docstatus)===0?[{label:"Submit",icon:Send,onClick:()=>submit(row)}]:[]}/></div></td></tr>)}{!loading&&!rows.length&&<tr><td colSpan={config.columns.length+1}><EmptyState title={`No ${config.plural.toLowerCase()} found`} sub="No records match the current filters."/></td></tr>}</tbody></table></div><Pager page={page} setPage={setPage} pageSize={20} count={count}/></div><ConfirmDialog open={!!target} onClose={()=>setTarget(null)} onConfirm={remove} title={`Delete ${target?.name}?`} description="This action cannot be undone." confirmLabel="Delete"/></>;
}

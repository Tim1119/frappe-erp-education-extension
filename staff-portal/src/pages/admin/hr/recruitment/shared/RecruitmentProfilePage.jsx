import { useEffect, useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ConnectionsPanel from "../../components/ConnectionsPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/utils/errors";
import RecruitmentStatusBadge from "./RecruitmentStatusBadge";

const Value=({label,value,full})=><div style={full?{gridColumn:"1 / -1"}:undefined}><p className="text-xs text-muted-foreground">{label}</p><div className="text-sm font-medium">{value===undefined||value===null||value===""?"—":String(value)}</div></div>;

export default function RecruitmentProfilePage({config}){
  const{id}=useParams(),name=decodeURIComponent(id),nav=useNavigate();
  const[doc,setDoc]=useState(null),[connections,setConnections]=useState({}),[removeOpen,setRemoveOpen]=useState(false);
  async function load(){try{const request=config.connectionItems?.length?config.service.getConnections(name):Promise.resolve({});const[d,c]=await Promise.all([config.service.getSingle(name),request]);setDoc(d);setConnections(c||{})}catch(e){toast.error(getErrorMessage(e))}}
  useEffect(()=>{load();/* eslint-disable-next-line */},[name]);
  async function action(fn,message){try{await fn(name);toast.success(message);load()}catch(e){toast.error(getErrorMessage(e))}}
  async function remove(){try{await config.service.remove(name);toast.success(`${config.title} deleted`);nav(`/dashboard/${config.base}`)}catch(e){toast.error(getErrorMessage(e))}}
  if(!doc)return <div className="muted">Loading {config.title.toLowerCase()}…</div>;
  const statusActions=(config.getStatusActions?.(doc)||[]).filter(item=>item.show!==false);
  const createActions=(config.getCreateActions?.(doc)||[]).filter(item=>item.show!==false);
  return <>
    <PageHeader eyebrow={config.eyebrow||"HR · Recruitment"} title={doc[config.titleField]||doc.name} sub={doc.name} button={<div className="flex flex-wrap gap-2">
      {doc.can_edit&&<button className="btn btn-secondary" onClick={()=>nav(`/dashboard/${config.base}/${encodeURIComponent(name)}/edit`)}>Edit</button>}
      {config.submittable&&doc.docstatus===0&&<button className="btn btn-primary" onClick={()=>action(config.service.submit,`${config.title} submitted`)}>Submit</button>}
      {statusActions.map(item=><button key={item.label} className="btn btn-secondary" onClick={()=>action(item.run,item.success||`${item.label} completed`)}>{item.label}</button>)}
      {createActions.length>0&&<DropdownMenu><DropdownMenuTrigger asChild><button className="btn btn-primary">Create <ChevronDown className="ml-1 h-4 w-4"/></button></DropdownMenuTrigger><DropdownMenuContent align="end">{createActions.map(item=><DropdownMenuItem key={item.label} onClick={()=>nav(item.path,{state:{prefill:item.prefill(doc)}})}>{item.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
      {config.submittable&&doc.docstatus===1&&<button className="btn btn-danger" onClick={()=>action(config.service.cancel,`${config.title} cancelled`)}>Cancel</button>}
      {doc.can_delete&&<button className="btn btn-danger" onClick={()=>setRemoveOpen(true)}>Delete</button>}
    </div>}/>
    <div className="panel"><div className="panel-head"><div className="panel-title">{config.title} Information</div>{config.statusField&&<RecruitmentStatusBadge config={config} status={doc[config.statusField]}/>}</div><div className="grid-form p-5">{config.fields.map(field=><Value key={field.name} label={field.label} value={field.type==="check"?(Number(doc[field.name])?"Yes":"No"):doc[field.name]} full={field.full}/>)}</div>{(config.tables||[]).filter(t=>doc[t.name]?.length).map(table=><section key={table.name}><div className="panel-head"><div className="panel-title">{table.label}</div></div><div className="overflow-x-auto px-5 pb-6"><table className="tbl"><thead><tr>{table.summary.map(field=><th key={field}>{table.fields.find(x=>x.name===field)?.label}</th>)}</tr></thead><tbody>{doc[table.name].map((row,i)=><tr key={i}>{table.summary.map(field=><td key={field}>{row[field]||"—"}</td>)}</tr>)}</tbody></table></div></section>)}</div>
    {Boolean(config.connectionItems?.length)&&<ConnectionsPanel groups={[{label:config.eyebrow||"Recruitment",items:config.connectionItems.map(item=>({icon:Link2,label:item.label,count:connections[item.key]||0,onClick:()=>nav(`${item.path}?${item.filter}=${encodeURIComponent(name)}`)}))}]}/>}
    <ConfirmDialog open={removeOpen} onClose={()=>setRemoveOpen(false)} onConfirm={remove} title={`Delete ${doc.name}?`} description="This action cannot be undone." confirmLabel="Delete"/>
  </>;
}

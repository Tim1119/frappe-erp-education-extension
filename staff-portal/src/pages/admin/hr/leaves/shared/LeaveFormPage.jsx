import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { getErrorMessage } from "@/utils/errors";
import LeaveDocumentForm from "./LeaveDocumentForm";

export default function LeaveFormPage({config}) {
  const navigate=useNavigate();const{id}=useParams();const editing=!!id;const name=id?decodeURIComponent(id):"";const[document,setDocument]=useState(null);const[loading,setLoading]=useState(editing);
  useEffect(()=>{if(!editing)return;let active=true;config.service.get(name).then(value=>active&&setDocument(value)).catch(error=>toast.error(getErrorMessage(error))).finally(()=>active&&setLoading(false));return()=>{active=false};},[config,editing,name]);
  async function save(data){try{const result=editing?await config.service.update(name,data):await config.service.create(data);toast.success(`${config.singular} ${editing?"updated":"created"}`);navigate(`/dashboard/${config.path}/${encodeURIComponent(result.name||name)}`);}catch(error){toast.error(getErrorMessage(error));}}
  if(loading)return <div className="text-sm text-muted-foreground">Loading {config.singular.toLowerCase()}…</div>;
  if(editing&&document&&!document.can_edit)return <><PageHeader eyebrow="HR · Leaves" title={config.singular}/><div className="panel p-5"><div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">This document is read-only. Only draft submittable documents can be edited.</div></div></>;
  return <><PageHeader eyebrow="HR · Leaves" title={`${editing?"Edit":"Create"} ${config.singular}`}/><div className="panel"><LeaveDocumentForm config={config} document={document} onSave={save}/></div></>;
}

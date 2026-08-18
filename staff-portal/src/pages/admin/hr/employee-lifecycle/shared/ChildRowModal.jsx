import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import SearchableSelect from "@/components/shared/SearchableSelect";

function ReadOnlyValue({value}){return <div className="flex min-h-[40px] items-center rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">{value===undefined||value===null||value===""?"—":String(value)}</div>}

function Input({field,value,onChange,options}){
  if(field.type==="link") return <SearchableSelect value={value||""} onChange={onChange} options={options||[]} displayField={field.displayField} showId={field.showId} label={field.label} placeholder={`Search ${field.label.toLowerCase()}...`} linkedDoctype={["Employee","Student","User","Account"].includes(field.doctype)?null:field.doctype}/>;
  if(field.type==="select") return <select className="input" value={value||""} onChange={e=>onChange(e.target.value)}><option value="">Select...</option>{field.options.map(x=><option key={x}>{x}</option>)}</select>;
  if(field.type==="check") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(Number(value))} onChange={e=>onChange(e.target.checked?1:0)}/> Yes</label>;
  if(field.type==="textarea") return <textarea className="input" rows={3} style={{height:"auto"}} value={value||""} onChange={e=>onChange(e.target.value)}/>;
  return <input className="input" type={field.type==="number"?"number":field.type==="date"?"date":"text"} min={field.min} max={field.max} value={value||""} onChange={e=>onChange(e.target.value)}/>;
}

export default function ChildRowModal({open,onClose,onSave,fields,row,optionMap}){
  const[form,setForm]=useState({}); useEffect(()=>{if(open)setForm(row||{})},[open,row]);
  function change(field,value){const selected=(optionMap[field.doctype]||[]).find(option=>option.name===value);setForm(old=>({...old,[field.name]:value,...(field.doctype==="Employee"?{employee_name:selected?.employee_name||"",department:selected?.department||""}:{})}))}
  return <Modal open={open} onClose={onClose} title={row?"Edit Row":"Add Row"} size="lg" footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(form)}>Save Row</button></>}><div className="grid-form">{fields.map(field=><div className="field" key={field.name} style={field.full?{gridColumn:"1 / -1"}:undefined}><label className="label">{field.label}{field.required&&<span style={{color:"var(--danger)",marginLeft:3}}>*</span>}</label>{field.readOnly?<ReadOnlyValue value={form[field.name]}/>:<Input field={field} value={form[field.name]} onChange={value=>change(field,value)} options={optionMap[field.doctype]}/>}</div>)}</div></Modal>;
}

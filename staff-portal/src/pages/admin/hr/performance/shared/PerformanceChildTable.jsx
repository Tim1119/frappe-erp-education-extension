import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";
import SearchableSelect from "@/components/shared/SearchableSelect";

const emptyRow=fields=>Object.fromEntries(fields.map(field=>[field.name,field.type==="check"?0:""]));
const requiredMissing=(field,value)=>field.required&&(value===undefined||value===null||value==="");

function RowField({field,value,onChange,options,onRefreshOptions}){
  if(field.readOnly)return <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{value===undefined||value===null||value===""?"—":String(value)}</div>;
  if(field.type==="link")return <SearchableSelect value={value||""} onChange={onChange} options={field.inlineOptions||options[field.options]||[]} displayField={field.displayField} showId={field.showId} linkedDoctype={field.linkedDoctype??null} label={field.label} placeholder={`Search ${field.label.toLowerCase()}...`} onRefreshOptions={onRefreshOptions}/>;
  if(field.type==="select")return <select className="input" value={value||""} onChange={event=>onChange(event.target.value)}><option value="">Select {field.label}</option>{(field.values||[]).map(option=><option key={option}>{option}</option>)}</select>;
  if(field.type==="check")return <label className="flex h-9 items-center gap-2"><input type="checkbox" checked={!!Number(value)} onChange={event=>onChange(event.target.checked?1:0)}/> Yes</label>;
  return <input className="input" type={field.type==="date"?"date":field.type==="number"||field.type==="rating"?"number":"text"} min={field.min} max={field.max} step={field.step||((field.type==="number"||field.type==="rating")?"any":undefined)} value={value??""} onChange={event=>onChange(event.target.value)}/>;
}

export default function PerformanceChildTable({table,rows,onChange,options,onRefreshOptions,context,resolveProperty,disabled=false}){
  const[editing,setEditing]=useState(null);const[draft,setDraft]=useState(null);
  const visibleFields=table.fields.filter(field=>!field.show||field.show(draft||{}));
  const listFields=table.fields.filter(field=>!field.hiddenInList&&!field.hidden);
  const propertyMeta=detail=>({
    _newDatatype:detail.datatype||"Data",
    _newDoctype:detail.options||"",
    _newOptions:detail.link_options||[],
    _newSelectOptions:detail.datatype==="Select"?String(detail.options||"").split("\n").filter(Boolean):[],
  });
  async function open(index){
    setEditing(index);
    const row=index===null?emptyRow(table.fields):{...rows[index]};
    setDraft(row);
    if(table.propertyTable&&row.fieldname&&context.employee&&resolveProperty){
      try{const detail=await resolveProperty(context.employee,row.fieldname);setDraft(current=>current?{...current,...propertyMeta(detail),property:detail.label||current.property,current:detail.value??current.current}:current);}catch{toast.error("Unable to load the employee property details");}
    }
  }
  async function setField(field,value,selectedOption){
    setDraft(current=>({...current,[field.name]:value}));
    if(field.name==="employee"&&selectedOption){
      setDraft(current=>({...current,employee:value,employee_name:selectedOption.employee_name||"",department:selectedOption.department||"",designation:selectedOption.designation||"",branch:selectedOption.branch||""}));
    }
    if(table.propertyTable&&field.name==="fieldname"&&value&&context.employee&&resolveProperty){
      try{const detail=await resolveProperty(context.employee,value);setDraft(current=>({...current,fieldname:value,property:detail.label||selectedOption?.label||value,current:detail.value??"",new:"",...propertyMeta(detail)}));}catch{toast.error("Unable to load the current employee property value");}
    }
  }
  function effectiveField(field){
    if(!table.propertyTable||field.name!=="new"||!draft)return field;
    const datatype=draft._newDatatype;
    if(datatype==="Link")return{...field,type:"link",inlineOptions:draft._newOptions||[],linkedDoctype:draft._newDoctype||null};
    if(datatype==="Select")return{...field,type:"select",values:draft._newSelectOptions||[]};
    if(datatype==="Check")return{...field,type:"check"};
    if(datatype==="Date")return{...field,type:"date"};
    if(["Int","Float","Currency"].includes(datatype))return{...field,type:"number"};
    return field;
  }
  function save(){const missing=visibleFields.find(field=>requiredMissing(field,draft[field.name]));if(missing)return toast.error(`${missing.label} is required`);if(table.propertyTable&&rows.some((row,index)=>index!==editing&&row.fieldname===draft.fieldname))return toast.error("This employee property is already added");onChange(editing===null?[...rows,draft]:rows.map((row,index)=>index===editing?draft:row));setDraft(null);}
  return <section style={{gridColumn:"1 / -1"}}>
    <div className="mb-2 flex items-center justify-between"><div><div className="font-medium">{table.label}{table.required&&<span className="text-destructive"> *</span>}</div><div className="text-xs text-muted-foreground">{rows.length} row{rows.length===1?"":"s"}</div></div>{!disabled&&<button type="button" className="btn btn-secondary" onClick={()=>open(null)}><Plus size={15}/> {table.addLabel||"Add Row"}</button>}</div>
    <div className="overflow-x-auto rounded-md border"><table className="tbl"><thead><tr>{listFields.map(field=><th key={field.name}>{field.label}</th>)}{!disabled&&<th/>}</tr></thead><tbody>{rows.map((row,index)=><tr key={row.name||index}>{listFields.map(field=><td key={field.name}>{field.type==="check"?(Number(row[field.name])?"Yes":"No"):(row[field.name]??"—")}</td>)}{!disabled&&<td><div className="flex gap-1"><button type="button" className="btn btn-ghost" aria-label="Edit row" onClick={()=>open(index)}><Pencil size={14}/></button><button type="button" className="btn btn-ghost" aria-label="Remove row" onClick={()=>onChange(rows.filter((_,i)=>i!==index))}><Trash2 size={14}/></button></div></td>}</tr>)}{!rows.length&&<tr><td colSpan={listFields.length+1} className="text-sm text-muted-foreground">No rows added.</td></tr>}</tbody></table></div>
    <Modal open={!!draft} onClose={()=>setDraft(null)} title={`${editing===null?"Add":"Edit"} ${table.label} Row`} footer={<><button type="button" className="btn btn-secondary" onClick={()=>setDraft(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={save}>Save Row</button></>}>
      <div className="grid gap-4 sm:grid-cols-2">{draft&&visibleFields.filter(field=>!field.hidden).map(field=>{const rendered=effectiveField(field);return <div className="field" key={field.name}><label className="label">{field.label}{field.required&&<span className="text-destructive"> *</span>}</label><RowField field={rendered} value={draft[field.name]} onChange={(value,selectedOption)=>setField(field,value,selectedOption)} options={options} onRefreshOptions={onRefreshOptions}/></div>})}</div>
    </Modal>
  </section>;
}

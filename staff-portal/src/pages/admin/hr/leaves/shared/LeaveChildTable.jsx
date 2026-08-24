import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/shared/Modal";
import SearchableSelect from "@/components/shared/SearchableSelect";

const emptyRow = fields => Object.fromEntries(fields.map(field => [field.name, field.type === "check" ? 0 : ""]));

function RowField({field,value,onChange,options}) {
  if (field.type === "link") return <SearchableSelect value={value||""} onChange={onChange} options={options[field.options]||[]} displayField={field.displayField} showId={field.showId} linkedDoctype={field.linkedDoctype} label={field.label} placeholder={`Search ${field.label.toLowerCase()}...`}/>;
  if (field.type === "check") return <label className="flex items-center gap-2"><input type="checkbox" checked={!!Number(value)} onChange={event=>onChange(event.target.checked?1:0)}/> Yes</label>;
  return <input className="input" type={field.type==="date"?"date":field.type==="number"?"number":"text"} step={field.type==="number"?"any":undefined} value={value??""} onChange={event=>onChange(event.target.value)}/>;
}

export default function LeaveChildTable({table,rows,onChange,options,disabled=false}) {
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);
  function open(index) { setEditing(index); setDraft(index===null?emptyRow(table.fields):{...rows[index]}); }
  function save() {
    const missing=table.fields.find(field=>field.required&&(draft[field.name]===undefined||draft[field.name]===null||draft[field.name]===""));
    if(missing) return;
    onChange(editing===null?[...rows,draft]:rows.map((row,index)=>index===editing?draft:row)); setDraft(null);
  }
  return <section style={{gridColumn:"1 / -1"}}>
    <div className="mb-2 flex items-center justify-between"><div><div className="font-medium">{table.label}{table.required&&<span className="text-destructive"> *</span>}</div><div className="text-xs text-muted-foreground">{rows.length} row{rows.length===1?"":"s"}</div></div>{!disabled&&<button type="button" className="btn btn-secondary" onClick={()=>open(null)}><Plus size={15}/> Add Row</button>}</div>
    <div className="overflow-x-auto rounded-md border"><table className="tbl"><thead><tr>{table.fields.map(field=><th key={field.name}>{field.label}</th>)}{!disabled&&<th/>}</tr></thead><tbody>{rows.map((row,index)=><tr key={row.name||index}>{table.fields.map(field=><td key={field.name}>{field.type==="check"?(Number(row[field.name])?"Yes":"No"):(row[field.name]??"—")}</td>)}{!disabled&&<td><div className="flex gap-1"><button type="button" className="btn btn-ghost" aria-label="Edit row" onClick={()=>open(index)}><Pencil size={14}/></button><button type="button" className="btn btn-ghost" aria-label="Remove row" onClick={()=>onChange(rows.filter((_,i)=>i!==index))}><Trash2 size={14}/></button></div></td>}</tr>)}{!rows.length&&<tr><td colSpan={table.fields.length+1} className="text-sm text-muted-foreground">No rows added.</td></tr>}</tbody></table></div>
    <Modal open={!!draft} onClose={()=>setDraft(null)} title={`${editing===null?"Add":"Edit"} ${table.label} Row`} footer={<><button type="button" className="btn btn-secondary" onClick={()=>setDraft(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={save}>Save Row</button></>}>
      <div className="grid gap-4 sm:grid-cols-2">{draft&&table.fields.map(field=><div className="field" key={field.name}><label className="label">{field.label}{field.required&&<span className="text-destructive"> *</span>}</label><RowField field={field} value={draft[field.name]} onChange={value=>setDraft(current=>({...current,[field.name]:value}))} options={options}/></div>)}</div>
    </Modal>
  </section>;
}

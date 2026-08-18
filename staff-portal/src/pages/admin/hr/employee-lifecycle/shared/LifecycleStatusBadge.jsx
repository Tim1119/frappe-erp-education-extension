import StatusBadge from "@/components/shared/StatusBadge";
const colors={Open:"#dc2626",Investigated:"#d97706",Resolved:"#16a34a",Invalid:"#6b7280",Scheduled:"#2563eb",Completed:"#16a34a",Cancelled:"#dc2626",Pending:"#d97706","In Process":"#2563eb"};
export default function LifecycleStatusBadge({status}){return <span style={colors[status]?{display:"inline-flex",alignItems:"center",border:`1px solid ${colors[status]}55`,borderRadius:999,padding:"2px 9px",fontSize:12,fontWeight:600,color:colors[status]}:undefined}>{colors[status]?status:<StatusBadge status={status}/>}</span>}

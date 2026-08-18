import StatusBadge from "@/components/shared/StatusBadge";
import { badgeTone } from "./recruitmentConfig";
const styles={success:"#16a34a",warning:"#d97706",info:"#2563eb",danger:"#dc2626",neutral:"#6b7280"};
const documentTones={Draft:"neutral",Submitted:"info",Cancelled:"danger"};
export default function RecruitmentStatusBadge({config,status,documentStatus=false}){const tone=documentStatus?documentTones[status]:badgeTone(config,status);const color=styles[tone];return color?<span style={{display:"inline-flex",border:`1px solid ${color}55`,borderRadius:999,padding:"2px 9px",fontSize:12,fontWeight:600,color}}>{status}</span>:<StatusBadge status={status}/>}

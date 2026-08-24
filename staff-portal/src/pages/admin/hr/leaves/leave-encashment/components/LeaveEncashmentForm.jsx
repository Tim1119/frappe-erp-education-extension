import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeaveEncashmentForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leaveEncashment} document={document} onSave={onSave}/>;}

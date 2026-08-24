import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeaveTypeForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leaveType} document={document} onSave={onSave}/>;}

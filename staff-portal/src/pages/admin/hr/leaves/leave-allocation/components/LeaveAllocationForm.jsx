import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeaveAllocationForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leaveAllocation} document={document} onSave={onSave}/>;}

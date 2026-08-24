import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeavePolicyForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leavePolicy} document={document} onSave={onSave}/>;}

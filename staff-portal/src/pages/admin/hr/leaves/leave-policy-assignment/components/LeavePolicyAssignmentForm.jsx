import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeavePolicyAssignmentForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leavePolicyAssignment} document={document} onSave={onSave}/>;}

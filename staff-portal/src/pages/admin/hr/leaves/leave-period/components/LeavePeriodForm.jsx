import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeavePeriodForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leavePeriod} document={document} onSave={onSave}/>;}

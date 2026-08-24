import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function LeaveBlockListForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.leaveBlockList} document={document} onSave={onSave}/>;}

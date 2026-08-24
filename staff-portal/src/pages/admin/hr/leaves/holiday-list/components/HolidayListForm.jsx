import LeaveDocumentForm from "../../shared/LeaveDocumentForm";
import { leaveConfigs } from "../../shared/leaveConfigs";
export default function HolidayListForm({document,onSave}){return <LeaveDocumentForm config={leaveConfigs.holidayList} document={document} onSave={onSave}/>;}

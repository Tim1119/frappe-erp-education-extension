import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import StatusBadge from "@/components/shared/StatusBadge";
import { getDailyWorkSummary } from "@/services/employee-lifecycle/dailyWorkSummaryService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, value, full }) { return <div style={full ? { gridColumn: "1 / -1" } : undefined}><p className="text-xs text-muted-foreground">{label}</p><p className="whitespace-pre-wrap text-sm font-medium">{value === undefined || value === null || value === "" ? "—" : String(value)}</p></div>; }
export default function DailyWorkSummaryProfilePage() {
  const { id } = useParams(); const name = decodeURIComponent(id); const [doc, setDoc] = useState(null);
  useEffect(() => { getDailyWorkSummary(name).then(setDoc).catch((error) => toast.error(getErrorMessage(error))); }, [name]);
  if (!doc) return <div className="muted">Loading daily work summary…</div>;
  return <><PageHeader eyebrow="HR · Employee Lifecycle · Daily Work Summary" title={doc.name} sub="System-generated summary" /><div className="panel"><div className="panel-head"><div className="panel-title flex items-center gap-2"><ClipboardList size={15} /> Daily Work Summary</div><StatusBadge status={doc.status} /></div><div className="grid-form" style={{ padding: "10px 20px 26px" }}><Field label="Daily Work Summary Group" value={doc.daily_work_summary_group} /><Field label="Status" value={doc.status} /><Field label="Created" value={doc.creation ? new Date(doc.creation).toLocaleString() : ""} /><Field label="Modified" value={doc.modified ? new Date(doc.modified).toLocaleString() : ""} /><Field label="Email Sent To" value={doc.email_sent_to} full /></div></div></>;
}

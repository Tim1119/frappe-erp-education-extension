import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { callMethod } from "@/services/frappeClient";
import { getLinkOptions } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const date = new Date(); date.setMonth(date.getMonth() - 1); return date.toISOString().slice(0, 10); };
const CHARTS = [
  { value: "sales_funnel", label: "Sales Funnel" },
  { value: "sales_pipeline", label: "Sales Pipeline" },
  { value: "opp_by_lead_source", label: "Opportunities by Lead Source" },
];

export default function SalesFunnelPage() {
  const [form, setForm] = useState({ company: "", from_date: monthAgo(), to_date: today(), chart: "sales_funnel" });
  const [companies, setCompanies] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getLinkOptions("Company").then((rows) => { setCompanies(rows); if (rows[0]) setForm((old) => ({ ...old, company: old.company || rows[0].name })); }); }, []);

  async function run() {
    if (!form.company) return toast.error("Company is required.");
    if (!form.from_date || !form.to_date) return toast.error("From Date and To Date are required.");
    if (form.from_date >= form.to_date) return toast.error("To Date must be greater than From Date.");
    try {
      setLoading(true);
      setData(await callMethod("education_extension.staff_portal_api.selling.sales_funnel_api.get_data", form));
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  }

  const funnelRows = Array.isArray(data) ? data : [];
  const chartData = data && !Array.isArray(data) && data !== "empty" ? data : null;
  return <>
    <PageHeader eyebrow="Selling · Reports" title="Sales Funnel" />
    <div className="panel no-print mb-4"><div className="grid items-end gap-4 p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
      <div className="field min-w-0"><label className="label">Company <span className="text-destructive">*</span></label><SearchableSelect value={form.company} onChange={(company) => setForm((old) => ({ ...old, company }))} options={companies} linkedDoctype="Company" /></div>
      <div className="field min-w-0"><label className="label">From Date <span className="text-destructive">*</span></label><input className="input" type="date" max={form.to_date || undefined} value={form.from_date} onChange={(event) => setForm((old) => ({ ...old, from_date: event.target.value }))} /></div>
      <div className="field min-w-0"><label className="label">To Date <span className="text-destructive">*</span></label><input className="input" type="date" min={form.from_date || undefined} value={form.to_date} onChange={(event) => setForm((old) => ({ ...old, to_date: event.target.value }))} /></div>
      <div className="field min-w-0"><label className="label">Chart <span className="text-destructive">*</span></label><select className="input" value={form.chart} onChange={(event) => setForm((old) => ({ ...old, chart: event.target.value }))}>{CHARTS.map((chart) => <option key={chart.value} value={chart.value}>{chart.label}</option>)}</select></div>
      <button className="btn btn-primary" onClick={run} disabled={loading}><RefreshCw size={14} />{loading ? " Loading..." : " Run Report"}</button>
    </div></div>
    {data === "empty" && <div className="panel p-8 text-center text-muted-foreground">No data for this period.</div>}
    {funnelRows.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{funnelRows.map((row) => <div key={row.title} className="panel border-t-4 p-5" style={{ borderTopColor: row.color }}><p className="text-sm text-muted-foreground">{row.title}</p><p className="mt-2 text-3xl font-semibold">{row.value}</p></div>)}</div>}
    {chartData && <div className="panel overflow-x-auto"><table className="tbl min-w-max"><thead><tr><th>Stage</th>{(chartData.labels || []).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{(chartData.datasets || []).map((row) => <tr key={row.name}><td className="font-semibold">{row.name}</td>{(row.values || []).map((value, index) => <td key={`${row.name}-${index}`}>{Number(value || 0).toLocaleString()}</td>)}</tr>)}</tbody></table></div>}
  </>;
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { getLinkOptions, getReportData } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const date = new Date(); date.setMonth(date.getMonth() - 1); return date.toISOString().slice(0, 10); };
const field = (fieldname, label, fieldtype, extra = {}) => ({ fieldname, label, fieldtype, ...extra });

// Real Desk's Accounts Receivable / Accounts Receivable Summary filters use
// MultiSelectList (cost_center, project, party, customer_group) and an
// Autocomplete party_type -- both downgraded to single-value Link/Select
// here, mirroring the same simplification PayablesReportPage.jsx already
// applies to the mirror-image Accounts Payable filters.
const commonAgeing = [
  field("company", "Company", "Link", { options: "Company", reqd: true }), field("report_date", "Posting Date", "Date", { default: today }),
  field("ageing_based_on", "Ageing Based On", "Select", { options: ["Posting Date", "Due Date"], default: "Due Date" }),
  field("calculate_ageing_with", "Calculate Ageing With", "Select", { options: ["Report Date", "Today Date"], default: "Report Date" }), field("range", "Ageing Range", "Data", { default: "30, 60, 90, 120" }),
  field("finance_book", "Finance Book", "Link", { options: "Finance Book" }), field("cost_center", "Cost Center", "Link", { options: "Cost Center", companyFilter: true }), field("project", "Project", "Link", { options: "Project", companyFilter: true }),
  field("party_type", "Party Type", "Select", { options: ["Customer", "Employee", "Shareholder"], default: "Customer" }), field("party", "Party", "Dynamic Link", { dependsOn: "party_type" }), field("payment_terms_template", "Payment Terms Template", "Link", { options: "Payment Terms Template" }), field("territory", "Territory", "Link", { options: "Territory" }), field("customer_group", "Customer Group", "Link", { options: "Customer Group" }),
];

export const REPORTS = {
  "Accounts Receivable": { slug: "accounts-receivable", fields: [...commonAgeing.slice(0, 2), field("party_account", "Receivable Account", "Link", { options: "Account", companyFilter: true, filters: { account_type: "Receivable", is_group: 0 } }), ...commonAgeing.slice(2), field("sales_partner", "Sales Partner", "Link", { options: "Sales Partner" }), field("sales_person", "Sales Person", "Link", { options: "Sales Person" }), field("group_by_party", "Group By Customer", "Check"), field("based_on_payment_terms", "Based On Payment Terms", "Check"), field("show_future_payments", "Show Future Payments", "Check"), field("show_delivery_notes", "Show Linked Delivery Notes", "Check"), field("show_sales_person", "Show Sales Person", "Check"), field("show_remarks", "Show Remarks", "Check"), field("for_revaluation_journals", "Revaluation Journals", "Check"), field("ignore_accounts", "Group by Voucher", "Check"), field("in_party_currency", "In Party Currency", "Check")] },
  "Accounts Receivable Summary": { slug: "accounts-receivable-summary", fields: [...commonAgeing, field("sales_partner", "Sales Partner", "Link", { options: "Sales Partner" }), field("sales_person", "Sales Person", "Link", { options: "Sales Person" }), field("based_on_payment_terms", "Based On Payment Terms", "Check"), field("show_future_payments", "Show Future Payments", "Check"), field("show_gl_balance", "Show GL Balance", "Check"), field("for_revaluation_journals", "Revaluation Journals", "Check")] },
  "Sales Register": { slug: "sales-register", fields: [field("from_date", "From Date", "Date", { default: monthAgo }), field("to_date", "To Date", "Date", { default: today }), field("customer", "Customer", "Link", { options: "Customer" }), field("customer_group", "Customer Group", "Link", { options: "Customer Group" }), field("company", "Company", "Link", { options: "Company" }), field("mode_of_payment", "Mode of Payment", "Link", { options: "Mode of Payment" }), field("owner", "Owner", "Link", { options: "User" }), field("cost_center", "Cost Center", "Link", { options: "Cost Center", companyFilter: true }), field("warehouse", "Warehouse", "Link", { options: "Warehouse", companyFilter: true }), field("brand", "Brand", "Link", { options: "Brand" }), field("item_group", "Item Group", "Link", { options: "Item Group" }), field("include_payments", "Show Ledger View", "Check")] },
  "Item-wise Sales Register": { slug: "item-wise-sales-register", fields: [field("from_date", "From Date", "Date", { default: monthAgo, reqd: true }), field("to_date", "To Date", "Date", { default: today, reqd: true }), field("customer", "Customer", "Link", { options: "Customer" }), field("company", "Company", "Link", { options: "Company" }), field("mode_of_payment", "Mode of Payment", "Link", { options: "Mode of Payment" }), field("warehouse", "Warehouse", "Link", { options: "Warehouse", companyFilter: true }), field("brand", "Brand", "Link", { options: "Brand" }), field("item_code", "Item", "Link", { options: "Item" }), field("item_group", "Item Group", "Link", { options: "Item Group" }), field("group_by", "Group By", "Select", { options: ["", "Customer Group", "Customer", "Item Group", "Item", "Territory", "Invoice"] })] },
  "Delivered Items To Be Billed": { slug: "delivered-items-to-be-billed", fields: [field("company", "Company", "Link", { options: "Company", reqd: true }), field("posting_date", "As on Date", "Date", { default: today, reqd: true }), field("delivery_note", "Delivery Note", "Link", { options: "Delivery Note" })] },
};

function Filter({ config, value, values, onChange }) {
  const [options, setOptions] = useState([]); const linked = config.fieldtype === "Dynamic Link" ? values[config.dependsOn] : config.options; const disabled = Boolean((config.dependsOn && !values[config.dependsOn]) || (config.companyFilter && !values.company));
  useEffect(() => { if (!["Link", "Dynamic Link"].includes(config.fieldtype) || !linked || disabled) { setOptions([]); return; } const filters = { ...(config.filters || {}) }; if (config.companyFilter && values.company) filters.company = values.company; getLinkOptions(linked, filters).then(setOptions).catch(() => setOptions([])); }, [config, disabled, linked, values.company]);
  return <div className={config.fieldtype === "Check" ? "flex min-h-16 items-end" : "space-y-2"}><Label className="font-semibold">{config.fieldtype !== "Check" && config.label}{config.reqd ? <span className="text-destructive"> *</span> : null}</Label>{["Link", "Dynamic Link"].includes(config.fieldtype) ? <div className="w-56"><SearchableSelect value={value || ""} onChange={onChange} options={options} disabled={disabled} placeholder={disabled ? (config.companyFilter ? "Select a company first" : `Select ${config.dependsOn.replaceAll("_", " ")} first`) : `Select ${config.label.toLowerCase()}`} /></div> : config.fieldtype === "Select" ? <select className="input w-56" value={value || ""} onChange={(e) => onChange(e.target.value)}><option value="">All</option>{config.options.map((option) => <option key={option}>{option}</option>)}</select> : config.fieldtype === "Check" ? <label className="flex h-9 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked ? 1 : 0)} />{config.label}</label> : <Input className="w-56" type={config.fieldtype === "Date" ? "date" : "text"} value={value || ""} onChange={(e) => onChange(e.target.value)} />}</div>;
}

export default function ReceivablesReportPage({ reportName }) {
  const config = REPORTS[reportName]; const navigate = useNavigate(); const [searchParams] = useSearchParams(); const queryParty = searchParams.get("party") || ""; const queryPartyType = searchParams.get("party_type") || ""; const defaults = useMemo(() => ({ ...Object.fromEntries(config.fields.map((f) => [f.fieldname, typeof f.default === "function" ? f.default() : f.default ?? (f.fieldtype === "Check" ? 0 : "")])), ...(queryParty ? { party: queryParty } : {}), ...(queryPartyType ? { party_type: queryPartyType } : {}) }), [config, queryParty, queryPartyType]); const [values, setValues] = useState(defaults); const [columns, setColumns] = useState([]); const [rows, setRows] = useState([]); const [visibleRows, setVisibleRows] = useState([]); const [loading, setLoading] = useState(false); const [hasRun, setHasRun] = useState(false);
  async function load() { const missing = config.fields.find((f) => f.reqd && !values[f.fieldname]); if (missing) { toast.error(`${missing.label} is required.`); return; } try { setLoading(true); const result = await getReportData(reportName, Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== undefined))); setColumns((result.columns || []).map((column) => ({ ...column, label: t(column.label) }))); setRows((result.result || []).filter((row) => !Array.isArray(row))); setHasRun(true); } catch (error) { toast.error(getErrorMessage(error)); } finally { setLoading(false); } }
  const printFilters = config.fields.map((f) => ({ label: f.label, value: values[f.fieldname] })).filter((f) => f.value !== "" && f.value !== 0);
  // Sales Order / Delivery Note are intentionally excluded here -- this
  // portal has no module for either doctype, so linking to one would be a
  // dead 404 rather than a real destination.
  function openRow(row) { const routes = [["sales_invoice", "sales-invoices"], ["customer", "customers"], ["voucher_no", row.voucher_type === "Sales Invoice" ? "sales-invoices" : null]]; const match = routes.find(([key, route]) => route && row[key]); if (match) navigate(`/dashboard/${match[1]}/${encodeURIComponent(row[match[0]])}`); }
  return <><PageHeader title={reportName} description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}><ReportToolbar filenameBase={config.slug} columns={columns} rows={visibleRows} /></PageHeader><Card className="no-print mb-4 p-4"><div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">{config.fields.map((filter) => <Filter key={filter.fieldname} config={filter} value={values[filter.fieldname]} values={values} onChange={(value) => setValues((current) => ({ ...current, [filter.fieldname]: value, ...(filter.fieldname === "company" ? { cost_center: "", project: "", party_account: "", warehouse: "" } : {}), ...(filter.fieldname === "party_type" ? { party: "" } : {}) }))} />)}<Button onClick={load} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" /> Run Report</Button></div></Card>{hasRun && <div className="report-printable rounded-md border"><ReportPrintHeader title={reportName} filters={printFilters} /><ReportTable columns={columns} rows={rows} onVisibleRowsChange={setVisibleRows} onRowClick={openRow} emptyMessage={`No ${reportName.toLowerCase()} data found`} /></div>}</>;
}

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, ChevronDown, ChevronRight, FileText, Landmark } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import * as companyService from "@/services/hr/companyService";
import { fmtDate } from "@/utils/format";

const SKIP_TYPES = new Set(["HTML", "Button"]);
const TEXT_TYPES = new Set(["Text Editor", "Small Text", "Long Text", "Text", "Code"]);
const TAB_ICONS = { details: FileText, accounts: Landmark, "buying-and-selling": BarChart3, "stock-and-manufacturing": Boxes };

const FILTERED_LINK_LOADERS = {
  parent_company: companyService.getParentCompanies,
  default_operating_cost_account: companyService.getOperatingCostAccounts,
  default_selling_terms: companyService.getSellingTerms,
  default_sales_contact: companyService.getSalesContacts,
  default_buying_terms: companyService.getBuyingTerms,
  default_in_transit_warehouse: companyService.getInTransitWarehouses,
  default_warehouse_for_sales_return: companyService.getSalesReturnWarehouses,
  default_bank_account: companyService.getBankAccounts,
  default_cash_account: companyService.getCashAccounts,
  default_receivable_account: companyService.getReceivableAccounts,
  default_payable_account: companyService.getPayableAccounts,
  default_expense_account: companyService.getExpenseAccounts,
  default_income_account: companyService.getIncomeAccounts,
  round_off_account: companyService.getRoundOffAccounts,
  round_off_for_opening: companyService.getOpeningRoundOffAccounts,
  write_off_account: companyService.getWriteOffAccounts,
  default_deferred_expense_account: companyService.getDeferredExpenseAccounts,
  default_deferred_revenue_account: companyService.getDeferredRevenueAccounts,
  default_discount_account: companyService.getDiscountAccounts,
  exchange_gain_loss_account: companyService.getExchangeGainLossAccounts,
  unrealized_exchange_gain_loss_account: companyService.getUnrealizedExchangeGainLossAccounts,
  accumulated_depreciation_account: companyService.getAccumulatedDepreciationAccounts,
  depreciation_expense_account: companyService.getDepreciationExpenseAccounts,
  disposal_account: companyService.getDisposalAccounts,
  default_inventory_account: companyService.getInventoryAccounts,
  cost_center: companyService.getCostCenters,
  round_off_cost_center: companyService.getCostCenters,
  depreciation_cost_center: companyService.getCostCenters,
  expenses_included_in_asset_valuation: companyService.getAssetValuationAccounts,
  capital_work_in_progress_account: companyService.getCapitalWorkInProgressAccounts,
  asset_received_but_not_billed: companyService.getAssetReceivedNotBilledAccounts,
  unrealized_profit_loss_account: companyService.getUnrealizedProfitLossAccounts,
  default_provisional_account: companyService.getProvisionalAccounts,
  default_advance_received_account: companyService.getAdvanceReceivedAccounts,
  default_advance_paid_account: companyService.getAdvancePaidAccounts,
  stock_adjustment_account: companyService.getStockAdjustmentAccounts,
  expenses_included_in_valuation: companyService.getExpensesIncludedValuationAccounts,
  stock_received_but_not_billed: companyService.getStockReceivedNotBilledAccounts,
};

const COMPANY_DEPENDENT_LINKS = new Set([
  "default_operating_cost_account", "default_sales_contact", "default_in_transit_warehouse",
  "default_warehouse_for_sales_return", "default_bank_account", "default_cash_account",
  "default_receivable_account", "default_payable_account", "default_expense_account",
  "default_income_account", "round_off_account", "round_off_for_opening", "write_off_account",
  "default_deferred_expense_account", "default_deferred_revenue_account", "default_discount_account",
  "exchange_gain_loss_account", "unrealized_exchange_gain_loss_account",
  "accumulated_depreciation_account", "depreciation_expense_account", "disposal_account",
  "default_inventory_account", "cost_center", "round_off_cost_center", "depreciation_cost_center",
  "expenses_included_in_asset_valuation", "capital_work_in_progress_account",
  "asset_received_but_not_billed", "unrealized_profit_loss_account", "default_provisional_account",
  "default_advance_received_account", "default_advance_paid_account", "stock_adjustment_account",
  "expenses_included_in_valuation", "stock_received_but_not_billed",
]);

function slug(label) { return String(label || "Details").toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"); }

function buildTabs(fields) {
  const tabs = [{ key: "details", label: "Details", fields: [] }];
  let current = tabs[0];
  for (const field of fields || []) {
    if (field.fieldtype === "Tab Break") {
      current = { key: slug(field.label), label: field.label || "Details", fields: [] };
      tabs.push(current);
    } else {
      current.fields.push(field);
    }
  }
  return tabs.filter((tab) => tab.fields.some((field) => !field.hidden && !["Section Break", "Column Break"].includes(field.fieldtype) && !SKIP_TYPES.has(field.fieldtype)));
}

function buildSections(fields) {
  const sections = [];
  let section = { key: "main", label: "", collapsible: false, columns: [[]] };
  sections.push(section);
  for (const field of fields || []) {
    if (field.hidden) continue;
    if (field.fieldtype === "Section Break") {
      section = { key: field.fieldname, label: field.label || "", collapsible: Boolean(field.collapsible), columns: [[]] };
      sections.push(section);
    } else if (field.fieldtype === "Column Break") {
      section.columns.push([]);
    } else if (field.fieldtype !== "Tab Break" && !SKIP_TYPES.has(field.fieldtype)) {
      section.columns[section.columns.length - 1].push(field);
    }
  }
  return sections.filter((item) => item.columns.some((column) => column.length));
}

function dependencyState(field, value, labels) {
  const expression = field.depends_on;
  if (!expression) return { enabled: true, note: "" };
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expression)) {
    return { enabled: Boolean(value[expression]), note: `Enable ${labels[expression] || expression} first` };
  }
  const truthy = expression.match(/^eval:\s*doc\.([A-Za-z_][A-Za-z0-9_]*)\s*$/);
  if (truthy) return { enabled: Boolean(value[truthy[1]]), note: `Enable ${labels[truthy[1]] || truthy[1]} first` };
  const comparison = expression.match(/^eval:\s*doc\.([A-Za-z_][A-Za-z0-9_]*)\s*={2,3}\s*["']?([^"']+?)["']?\s*$/);
  if (comparison) {
    const expected = comparison[2] === "1" ? 1 : comparison[2] === "0" ? 0 : comparison[2];
    return { enabled: String(value[comparison[1]] ?? "") === String(expected), note: `Set ${labels[comparison[1]] || comparison[1]} to ${comparison[2]} first` };
  }
  return { enabled: true, note: "" };
}

function displayValue(field, raw) {
  if (raw === null || raw === undefined || raw === "") return "—";
  if (field.fieldtype === "Check") return Number(raw) ? "Yes" : "No";
  if (field.fieldtype === "Date") return fmtDate(raw);
  if (field.fieldtype === "Currency") return `₦${Number(raw || 0).toLocaleString()}`;
  if (["Int", "Float", "Percent"].includes(field.fieldtype)) return Number(raw).toLocaleString();
  return String(raw);
}

function LinkInput({ field, value, onChange, disabled, company }) {
  const [options, setOptions] = useState(value ? [{ name: value, display_name: value }] : []);
  const requiresCompany = COMPANY_DEPENDENT_LINKS.has(field.fieldname);
  useEffect(() => {
    let active = true;
    if (requiresCompany && !company) {
      setOptions(value ? [{ name: value, display_name: value }] : []);
      return () => { active = false; };
    }
    const load = FILTERED_LINK_LOADERS[field.fieldname]
      ? () => FILTERED_LINK_LOADERS[field.fieldname](company)
      : () => companyService.getLinkOptions(field.options);
    load().then((rows) => {
      if (!active) return;
      const next = rows || [];
      if (value && !next.some((row) => row.name === value)) next.unshift({ name: value, display_name: value });
      setOptions(next);
    }).catch(() => setOptions(value ? [{ name: value, display_name: value }] : []));
    return () => { active = false; };
  }, [field.fieldname, field.options, company, requiresCompany, value]);
  return <SearchableSelect value={value || ""} onChange={onChange} options={options} displayField="display_name" placeholder={requiresCompany && !company ? "Save the company first to set this" : `Search ${field.label || field.fieldname}...`} label={field.label || field.fieldname} disabled={disabled || (requiresCompany && !company)} showId={options.some((row) => row.display_name && row.display_name !== row.name)} />;
}

function EditControl({ field, value, onChange, disabled, company, docname }) {
  if (field.fieldtype === "Link") return <LinkInput field={field} value={value} onChange={onChange} disabled={disabled} company={company} />;
  if (field.fieldtype === "Select") return <select className="select" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>{String(field.options || "").split("\n").map((option, index) => <option key={`${option}-${index}`} value={option}>{option || `Select ${field.label || "value"}`}</option>)}</select>;
  if (field.fieldtype === "Check") return <label className="flex h-9 items-center gap-2"><input type="checkbox" checked={Boolean(Number(value))} onChange={(e) => onChange(e.target.checked ? 1 : 0)} disabled={disabled} /><span className="text-sm">{Number(value) ? "Yes" : "No"}</span></label>;
  if (TEXT_TYPES.has(field.fieldtype)) return <textarea className="input" rows={field.fieldtype === "Small Text" ? 2 : 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
  if (["Image", "Attach Image"].includes(field.fieldtype)) return <div>{value && <img src={value} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}<input type="file" accept="image/*" disabled={disabled} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("file", file); body.append("doctype", "Company"); body.append("docname", docname || ""); body.append("fieldname", field.fieldname); const response = await fetch("/api/method/upload_file", { method: "POST", body, credentials: "same-origin" }); const result = await response.json(); if (result.message?.file_url) onChange(result.message.file_url); }} /></div>;
  const type = field.fieldtype === "Date" ? "date" : ["Int", "Float", "Currency", "Percent"].includes(field.fieldtype) ? "number" : "text";
  return <input className="input" type={type} step={type === "number" ? "any" : undefined} value={value ?? ""} onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} disabled={disabled} />;
}

function FieldBlock({ field, value, document, labels, onChange, mode, company, docname }) {
  const dependency = dependencyState(field, document, labels);
  const disabled = Boolean(field.read_only) || !dependency.enabled;
  return <div className="field"><label className="label">{field.label || field.fieldname}{field.reqd ? <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span> : null}</label>{mode === "view" || field.read_only ? <div className={field.read_only ? "rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground" : "text-sm font-medium"} style={{ minHeight: 36 }}>{displayValue(field, value)}</div> : <EditControl field={field} value={value} onChange={onChange} disabled={disabled} company={company} docname={docname} />}{!dependency.enabled && <p className="text-xs text-muted-foreground" style={{ marginTop: 3 }}>{dependency.note}</p>}{field.description && <p className="text-xs text-muted-foreground" style={{ marginTop: 3 }}>{field.description}</p>}</div>;
}

function SectionPanel({ section, children }) {
  const [open, setOpen] = useState(!section.collapsible);
  return <div className="panel" style={{ marginBottom: 18, overflow: "visible" }}>{section.label && <button type="button" className="panel-head" onClick={() => section.collapsible && setOpen((value) => !value)} style={{ width: "100%", border: 0, background: "transparent", textAlign: "left", cursor: section.collapsible ? "pointer" : "default" }}><div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>{section.collapsible && (open ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}{section.label}</div></button>}{open && children}</div>;
}

export default function CompanyMetadataLayout({ meta, value, onChange, mode = "edit" }) {
  const tabs = useMemo(() => buildTabs(meta?.fields), [meta]); const [active, setActive] = useState("details");
  const tab = tabs.find((item) => item.key === active) || tabs[0];
  const labels = useMemo(() => Object.fromEntries((meta?.fields || []).map((field) => [field.fieldname, field.label || field.fieldname])), [meta]);
  const company = value.name || "";
  return <div><div style={{ display: "flex", gap: 4, padding: "0 20px", overflowX: "auto", borderBottom: "1px solid hsl(var(--border))", backgroundColor: "var(--surface-2)" }}>{tabs.map((item) => { const Icon = TAB_ICONS[item.key] || FileText; const selected = item.key === tab?.key; return <button key={item.key} type="button" onClick={() => setActive(item.key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", whiteSpace: "nowrap", border: "none", borderBottom: selected ? "2px solid var(--brand)" : "2px solid transparent", background: selected ? "var(--surface)" : "transparent", color: selected ? "var(--brand)" : "var(--ink-3)", fontSize: 13, fontWeight: selected ? 600 : 400, cursor: "pointer" }}><Icon size={15} />{item.label}</button>; })}</div>
    <div style={{ padding: 20 }}>{buildSections(tab?.fields).map((section) => { const fullWidth = section.columns.flat().filter((field) => TEXT_TYPES.has(field.fieldtype)); const columns = section.columns.map((column) => column.filter((field) => !TEXT_TYPES.has(field.fieldtype))); return <SectionPanel key={section.key} section={section}><div style={{ padding: section.label ? "14px 20px 24px" : 20 }}><div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(columns.length, 3)}, minmax(0, 1fr))`, gap: 20 }}>{columns.map((column, index) => <div key={index} style={{ display: "grid", gap: 14, alignContent: "start", minWidth: 0 }}>{column.map((field) => <FieldBlock key={field.fieldname} field={field} value={value[field.fieldname]} document={value} labels={labels} onChange={(next) => onChange(field.fieldname, next)} mode={mode} company={company} docname={value.name} />)}</div>)}</div>{fullWidth.map((field) => <div key={field.fieldname} style={{ marginTop: 14 }}><FieldBlock field={field} value={value[field.fieldname]} document={value} labels={labels} onChange={(next) => onChange(field.fieldname, next)} mode={mode} company={company} docname={value.name} /></div>)}</div></SectionPanel>; })}</div>
  </div>;
}

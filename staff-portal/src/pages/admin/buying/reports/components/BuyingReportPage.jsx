import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getReportData, getLinkOptions } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};
const monthEnd = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
};
const monthAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 10);
};
const yearStart = () => `${new Date().getFullYear()}-01-01`;
const yearEnd = () => `${new Date().getFullYear()}-12-31`;

function initialValue(field) {
  const dynamicDefaults = { today, monthStart, monthEnd, monthAgo, yearStart, yearEnd };
  if (dynamicDefaults[field.default]) return dynamicDefaults[field.default]();
  if (field.default === "currentFiscalYear") return "";
  if (field.type === "check") return field.default ?? 0;
  if (field.multiple) return [];
  return field.default ?? "";
}

function Field({ label, required, children }) {
  return (
    <div className="field min-w-0">
      <label className="label">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function MultiSelectFilter({ value = [], options = [], getLabel, placeholder, onChange }) {
  const [search, setSearch] = useState("");
  const selected = new Set(value);
  const filtered = options.filter((option) => `${option.name} ${getLabel(option)}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = (name) => onChange(selected.has(name) ? value.filter((item) => item !== name) : [...value, name]);
  return <details className="group relative min-w-0"><summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-md border border-input px-3 text-sm"><span className="truncate">{value.length ? `${value.length} selected` : placeholder}</span><span className="text-muted-foreground">⌄</span></summary><div className="absolute left-0 z-50 mt-1 flex max-h-80 w-[min(32rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border bg-popover shadow-lg"><div className="border-b p-2"><input className="input h-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${placeholder.toLowerCase()}...`} /></div><div className="overflow-y-auto p-1">{filtered.map((option) => <label key={option.name} className="flex cursor-pointer items-start gap-2 rounded px-2 py-2 text-sm hover:bg-accent"><input className="mt-0.5" type="checkbox" checked={selected.has(option.name)} onChange={() => toggle(option.name)} /><span className="min-w-0"><span className="block font-medium">{option.name}</span>{getLabel(option) !== option.name && <span className="block truncate text-xs text-muted-foreground">{getLabel(option)}</span>}</span></label>)}{!filtered.length && <p className="p-3 text-center text-sm text-muted-foreground">No results found</p>}</div>{value.length > 0 && <button type="button" className="border-t p-2 text-left text-sm text-primary" onClick={() => onChange([])}>Clear selection</button>}</div></details>;
}

function normalizeColumn(column, index) {
  if (typeof column !== "string") return column;
  const [label = `Column ${index + 1}`, typeAndOptions = "Data", width] = column.split(":");
  const [fieldtype = "Data", options] = typeAndOptions.split("/");
  return {
    label,
    fieldname: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `column_${index}`,
    fieldtype,
    options,
    width: Number(width) || undefined,
  };
}

export default function BuyingReportPage({ title, report, filters = [], eyebrow = "Buying · Reports" }) {
  const initial = useMemo(
    () => Object.fromEntries(filters.map((field) => [field.name, initialValue(field)])),
    [filters],
  );
  const [form, setForm] = useState(initial);
  const [options, setOptions] = useState({});
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const linkFields = filters.filter((field) => field.doctype);
    Promise.all(linkFields.map(async (field) => {
      const { doctype } = field;
      if (["Warehouse", "Cost Center", "Account"].includes(doctype) && !form.company) return [field.name, []];
      const scoped = { ...(["Warehouse", "Cost Center", "Account"].includes(doctype) ? { company: form.company, is_group: 0 } : {}), ...(field.optionFilters?.(form) || field.filters || {}) };
      return [field.name, await getLinkOptions(doctype, scoped, field.optionFields || [])];
    })).then((values) => {
      const nextOptions = Object.fromEntries(values);
      setOptions(nextOptions);
      setForm((current) => {
        const next = { ...current };
        filters.forEach((field) => {
          const choices = nextOptions[field.name] || [];
          if (!next[field.name] && field.doctype === "Company" && (field.required || field.defaultFirst) && choices[0]) {
            next[field.name] = choices[0].name;
          }
          if (!next[field.name] && field.default === "currentFiscalYear") {
            const year = String(new Date().getFullYear());
            next[field.name] = choices.find((choice) => choice.name.includes(year))?.name || choices[0]?.name || "";
          }
        });
        return next;
      });
    });
  }, [filters, form.company, form.from_date, form.to_date]);

  async function run() {
    const missing = filters.find((field) => field.required && (!form[field.name] || (Array.isArray(form[field.name]) && !form[field.name].length)));
    if (missing) {
      toast.error(`${missing.label} is required.`);
      return;
    }
    const dateRanges = [["from_date", "to_date"], ["start_date", "end_date"], ["period_start_date", "period_end_date"]];
    const invalidRange = dateRanges.find(([from, to]) => form[from] && form[to] && form[from] > form[to]);
    if (invalidRange) {
      const fromLabel = filters.find((field) => field.name === invalidRange[0])?.label || "From Date";
      const toLabel = filters.find((field) => field.name === invalidRange[1])?.label || "To Date";
      toast.error(`${toLabel} cannot be before ${fromLabel}.`);
      return;
    }
    const invalidNumber = filters.find((field) => field.type === "number" && field.min !== undefined && form[field.name] !== "" && Number(form[field.name]) < field.min);
    if (invalidNumber) {
      toast.error(`${invalidNumber.label} must be greater than or equal to ${invalidNumber.min}.`);
      return;
    }
    try {
      setLoading(true);
      const response = await getReportData(
        report,
        Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "" && value !== undefined && (!Array.isArray(value) || value.length))),
      );
      const nextColumns = (response?.columns || []).map(normalizeColumn);
      const rawRows = response?.result || response?.data || [];
      const nextRows = rawRows.map((row) => (
        Array.isArray(row)
          ? Object.fromEntries(nextColumns.map((column, index) => [column.fieldname, row[index]]))
          : row
      ));
      setColumns(nextColumns);
      setRows(nextRows);
      setRan(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title}>
        <ReportToolbar filenameBase={report.toLowerCase().replaceAll(" ", "-")} columns={columns} rows={visible} />
      </PageHeader>
      <div className="panel no-print mb-4">
        <div className="grid items-end gap-4 overflow-visible p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
          {filters.map((field) => (
            <Field key={field.name} label={field.label} required={field.required}>
              {field.type === "date" || field.type === "number" ? (
                <input className="input" type={field.type} min={field.type === "date" && field.name === "to_date" ? form.from_date || undefined : field.min} max={field.type === "date" && field.name === "from_date" ? form.to_date || undefined : field.max} value={form[field.name]} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))} />
              ) : field.type === "check" ? (
                <label className="flex min-h-10 items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.checked ? 1 : 0 }))} />
                  {field.label}
                </label>
              ) : field.multiple ? (
                <MultiSelectFilter value={form[field.name] || []} options={field.doctype ? options[field.name] || [] : (field.options || []).map((option) => typeof option === "object" ? { name: option.value, label: option.label } : { name: option })} placeholder={field.label} getLabel={(option) => field.optionLabel ? field.optionLabel(option) : option.label || option.name} onChange={(value) => setForm((old) => ({ ...old, [field.name]: value }))} />
              ) : field.type === "select" ? (
                <select className="input" value={form[field.name]} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))}>
                  {!field.required && <option value="">All</option>}
                  {field.options.map((option) => {
                    const value = typeof option === "object" ? option.value : option;
                    const label = typeof option === "object" ? option.label : option;
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              ) : (
                <SearchableSelect
                  value={form[field.name]}
                  onChange={(value) => setForm((old) => ({
                    ...old,
                    [field.name]: value,
                    ...(field.name === "company" ? { warehouse: "", cost_center: "", account: "" } : {}),
                  }))}
                  options={options[field.name] || []}
                  displayField={field.doctype === "Supplier" ? "supplier_name" : field.doctype === "Item" ? "item_name" : field.doctype === "Customer" ? "customer_name" : undefined}
                  showId={["Supplier", "Item", "Customer"].includes(field.doctype)}
                  disabled={["Warehouse", "Cost Center", "Account"].includes(field.doctype) && !form.company}
                  placeholder={["Warehouse", "Cost Center", "Account"].includes(field.doctype) && !form.company ? "Select a company first" : `Search ${field.label.toLowerCase()}...`}
                  linkedDoctype={["Item", "Supplier"].includes(field.doctype) ? null : field.doctype}
                />
              )}
            </Field>
          ))}
          <button className="btn btn-primary" onClick={run} disabled={loading}>
            <RefreshCw size={14} />{loading ? " Running..." : " Run Report"}
          </button>
        </div>
      </div>
      {ran && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title={title} filters={filters.map((field) => ({ label: field.label, value: form[field.name] }))} />
          <ReportTable columns={columns} rows={rows} onVisibleRowsChange={setVisible} emptyMessage="No report data found" />
        </div>
      )}
    </>
  );
}

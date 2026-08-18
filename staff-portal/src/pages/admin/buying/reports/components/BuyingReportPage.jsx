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
    <div className="field">
      <label className="label">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
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

export default function BuyingReportPage({ title, report, filters = [] }) {
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
    const doctypes = [...new Set(filters.filter((field) => field.doctype).map((field) => field.doctype))];
    Promise.all(doctypes.map(async (doctype) => {
      if (["Warehouse", "Cost Center", "Account"].includes(doctype) && !form.company) return [doctype, []];
      const scoped = ["Warehouse", "Cost Center", "Account"].includes(doctype)
        ? { company: form.company, is_group: 0 }
        : {};
      return [doctype, await getLinkOptions(doctype, scoped)];
    })).then((values) => {
      const nextOptions = Object.fromEntries(values);
      setOptions(nextOptions);
      setForm((current) => {
        const next = { ...current };
        filters.forEach((field) => {
          const choices = nextOptions[field.doctype] || [];
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
  }, [filters, form.company]);

  async function run() {
    const missing = filters.find((field) => field.required && !form[field.name]);
    if (missing) {
      toast.error(`${missing.label} is required.`);
      return;
    }
    try {
      setLoading(true);
      const response = await getReportData(
        report,
        Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "" && value !== undefined)),
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
      <PageHeader eyebrow="Buying · Reports" title={title}>
        <ReportToolbar filenameBase={report.toLowerCase().replaceAll(" ", "-")} columns={columns} rows={visible} />
      </PageHeader>
      <div className="panel no-print mb-4">
        <div className="grid grid-cols-1 items-end gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((field) => (
            <Field key={field.name} label={field.label} required={field.required}>
              {field.type === "date" ? (
                <input className="input" type="date" value={form[field.name]} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))} />
              ) : field.type === "check" ? (
                <label className="flex min-h-10 items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.checked ? 1 : 0 }))} />
                  {field.label}
                </label>
              ) : field.type === "select" ? (
                <select className="input" value={form[field.name]} onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))}>
                  {!field.required && <option value="">All</option>}
                  {field.options.map((option) => {
                    const value = typeof option === "object" ? option.value : option;
                    const label = typeof option === "object" ? option.label : option;
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              ) : field.multiple ? (
                <select
                  multiple
                  className="input min-h-24 py-1"
                  value={form[field.name] || []}
                  onChange={(event) => setForm((old) => ({ ...old, [field.name]: [...event.target.selectedOptions].map((option) => option.value) }))}
                >
                  {(options[field.doctype] || []).map((option) => <option key={option.name} value={option.name}>{option.name}</option>)}
                </select>
              ) : (
                <SearchableSelect
                  value={form[field.name]}
                  onChange={(value) => setForm((old) => ({
                    ...old,
                    [field.name]: value,
                    ...(field.name === "company" ? { warehouse: "", cost_center: "", account: "" } : {}),
                  }))}
                  options={options[field.doctype] || []}
                  displayField={field.doctype === "Supplier" ? "supplier_name" : field.doctype === "Item" ? "item_name" : undefined}
                  showId={field.doctype === "Supplier" || field.doctype === "Item"}
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

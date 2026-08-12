import { Fragment, useEffect, useMemo, useState } from "react";
import { Banknote, ChevronDown, ChevronRight, FileText, Info, MapPin, Plus, ReceiptText, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { searchLinkOptions } from "@/services/salesInvoiceService";
import { fmtDate } from "@/utils/format";

const LAYOUT_TYPES = new Set(["Section Break", "Column Break", "Tab Break"]);
const VALUELESS_TYPES = new Set(["HTML", "Button"]);
const TAB_ICONS = {
  details: ReceiptText,
  payments: Banknote,
  "address-contact": MapPin,
  terms: FileText,
  "more-info": Info,
};

function keyFor(label) {
  return String(label || "Details").toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");
}

export function buildInvoiceTabs(fields = []) {
  const tabs = [{ key: "details", label: "Details", fields: [] }];
  let current = tabs[0];
  for (const field of fields) {
    if (field.fieldtype === "Tab Break") {
      if (field.label === "Connections") {
        current = null;
        continue;
      }
      current = { key: keyFor(field.label), label: field.label, fields: [] };
      tabs.push(current);
    } else if (current) {
      current.fields.push(field);
    }
  }
  return tabs;
}

function sectionsFor(fields) {
  const sections = [];
  let section = { key: "main", label: "", collapsible: false, collapsibleDependsOn: "", columns: [[]] };
  sections.push(section);
  for (const field of fields) {
    if (field.hidden) continue;
    if (field.fieldtype === "Section Break") {
      section = {
        key: field.fieldname,
        label: field.label || "",
        collapsible: Boolean(field.collapsible),
        collapsibleDependsOn: field.collapsible_depends_on || "",
        columns: [[]],
      };
      sections.push(section);
    } else if (field.fieldtype === "Column Break") {
      section.columns.push([]);
    } else if (field.fieldtype !== "Tab Break") {
      section.columns[section.columns.length - 1].push(field);
    }
  }
  return sections.filter((item) => item.columns.some((column) => column.length));
}

function displayValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.fieldtype === "Check") return Number(value) ? "Yes" : "No";
  if (field.fieldtype === "Date") return fmtDate(value);
  if (["Currency", "Float", "Percent"].includes(field.fieldtype)) {
    const number = Number(value);
    return Number.isNaN(number) ? value : number.toLocaleString();
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function LinkField({ field, value, onChange, disabled }) {
  const [options, setOptions] = useState(value ? [{ name: value }] : []);

  useEffect(() => {
    if (!field.options || field.options.includes(":")) return;
    let active = true;
    searchLinkOptions(field.options)
      .then((rows) => {
        if (!active) return;
        const next = [...(rows || [])];
        if (value && !next.some((row) => row.name === value)) next.unshift({ name: value });
        setOptions(next);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [field.options, value]);

  return (
    <SearchableSelect
      value={value || ""}
      onChange={onChange}
      options={options}
      displayField="display_name"
      placeholder={`Search ${field.label || field.fieldname}...`}
      label={field.label || field.fieldname}
      disabled={disabled}
      showId={Boolean(options.some((option) => option.display_name && option.display_name !== option.name))}
    />
  );
}

function EditField({ field, value, onChange, disabled }) {
  const isDisabled = disabled || Boolean(field.read_only);
  if (field.fieldtype === "Link") {
    return <LinkField field={field} value={value} onChange={onChange} disabled={isDisabled} />;
  }
  if (field.fieldtype === "Select") {
    const options = String(field.options || "").split("\n");
    return (
      <select className="select" value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={isDisabled}>
        {options.map((option, index) => <option key={`${option}-${index}`} value={option}>{option || `Select ${field.label || "value"}`}</option>)}
      </select>
    );
  }
  if (field.fieldtype === "Check") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 38 }}>
        <input type="checkbox" checked={Boolean(Number(value))} onChange={(event) => onChange(event.target.checked ? 1 : 0)} disabled={isDisabled} />
        <span className="muted">{Number(value) ? "Yes" : "No"}</span>
      </label>
    );
  }
  if (["Small Text", "Text", "Long Text", "Text Editor", "Code"].includes(field.fieldtype)) {
    return <textarea className="input" rows={field.fieldtype === "Small Text" ? 2 : 4} value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={isDisabled} />;
  }
  const type = field.fieldtype === "Date" ? "date"
    : field.fieldtype === "Datetime" ? "datetime-local"
      : field.fieldtype === "Time" ? "time"
        : ["Currency", "Float", "Int", "Percent"].includes(field.fieldtype) ? "number"
          : "text";
  return <input className="input" type={type} step={type === "number" ? "any" : undefined} value={value ?? ""} onChange={(event) => onChange(type === "number" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value)} disabled={isDisabled} />;
}

function FieldBlock({ field, value, mode, onChange, disabled, error, style }) {
  if (VALUELESS_TYPES.has(field.fieldtype)) {
    return field.fieldtype === "Button" ? <button type="button" className="btn btn-secondary" disabled>{field.label}</button> : null;
  }
  return (
    <div className="field" style={style}>
      <label className="label">
        {field.label || field.fieldname}
        {field.reqd ? <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span> : null}
      </label>
      {mode === "view" ? (
        <div style={{ minHeight: 36, padding: "8px 0", fontSize: 14, fontWeight: field.read_only ? 500 : 400 }}>{displayValue(field, value)}</div>
      ) : (
        <EditField field={field} value={value} onChange={onChange} disabled={disabled} />
      )}
      {field.description && <p className="text-xs text-muted-foreground" style={{ marginTop: 3 }}>{field.description}</p>}
      {error && <div style={{ color: "var(--danger)", fontSize: 11, marginTop: 3 }}>{error}</div>}
    </div>
  );
}

function isFullWidth(field) {
  return ["Text Editor", "Small Text", "Long Text"].includes(field.fieldtype)
    || field.fieldtype === "Table";
}

function SectionPanel({ section, meta, value, onChange, mode, disabled, errors }) {
  const [expanded, setExpanded] = useState(!section.collapsible);
  const columnCount = Math.max(1, Math.min(section.columns.length, 3));

  return (
    <div className="panel" style={{ marginBottom: 18, overflow: "visible" }}>
      {section.label && (
        <button
          type="button"
          className="panel-head"
          onClick={() => section.collapsible && setExpanded((open) => !open)}
          aria-expanded={expanded}
          style={{
            width: "100%",
            border: "none",
            cursor: section.collapsible ? "pointer" : "default",
            background: "transparent",
            textAlign: "left",
          }}
        >
          <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {section.collapsible && (expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}
            {section.label}
          </div>
        </button>
      )}
      {expanded && (
        <div
          style={{
            padding: section.label ? "14px 20px 24px" : "20px",
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            gridAutoFlow: "row dense",
            alignItems: "start",
            gap: "14px 20px",
          }}
        >
          {section.columns.flatMap((column, columnIndex) => column.map((field) => {
            const placement = isFullWidth(field)
              ? { gridColumn: "1 / -1" }
              : { gridColumn: columnIndex + 1 };
            return field.fieldtype === "Table" ? (
              <ChildTable
                key={field.fieldname}
                field={field}
                childMeta={meta.children?.[field.options]}
                rows={value[field.fieldname] || []}
                mode={mode}
                disabled={disabled}
                onChange={(rows) => onChange(field.fieldname, rows)}
              />
            ) : (
              <FieldBlock
                key={field.fieldname}
                field={field}
                value={value[field.fieldname]}
                mode={mode}
                disabled={disabled}
                error={errors[field.fieldname]}
                style={placement}
                onChange={(next) => onChange(field.fieldname, next)}
              />
            );
          }))}
        </div>
      )}
    </div>
  );
}

function ChildTable({ field, childMeta, rows, mode, disabled, onChange }) {
  const [expanded, setExpanded] = useState(null);
  const visible = (childMeta?.fields || []).filter((item) => !item.hidden && !LAYOUT_TYPES.has(item.fieldtype) && !VALUELESS_TYPES.has(item.fieldtype) && item.fieldtype !== "Table");
  let listFields = visible.filter((item) => item.in_list_view);
  if (!listFields.length) listFields = visible.filter((item) => !item.read_only).slice(0, 5);
  listFields = listFields.slice(0, 6);
  const editable = mode === "edit" && !disabled && !field.read_only;

  function updateRow(index, fieldname, value) {
    const next = rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const updated = { ...row, [fieldname]: value };
      if (field.options === "Sales Invoice Item" && ["qty", "rate"].includes(fieldname)) {
        updated.amount = Number(updated.qty || 0) * Number(updated.rate || 0);
      }
      return updated;
    });
    onChange(next);
  }

  return (
    <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
      {editable && <button type="button" className="btn btn-secondary" onClick={() => onChange([...rows, {}])} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><Plus size={14} /> Add Row</button>}
      <table className="tbl">
        <thead><tr>{listFields.map((item) => <th key={item.fieldname}>{item.label || item.fieldname}</th>)}<th style={{ width: 120 }} /></tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <Fragment key={`${field.fieldname}-${index}`}>
              <tr>
                {listFields.map((item) => <td key={item.fieldname}>{displayValue(item, row[item.fieldname])}</td>)}
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setExpanded(expanded === index ? null : index)}>{expanded === index ? "Close" : mode === "view" ? "View" : "Edit"}</button>
                    {editable && <button type="button" className="iconbtn" style={{ color: "var(--danger)" }} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 size={14} /></button>}
                  </div>
                </td>
              </tr>
              {expanded === index && (
                <tr>
                  <td colSpan={listFields.length + 1} style={{ background: "var(--surface-2)", padding: 16 }}>
                    <div className="grid-form">
                      {visible.map((item) => <FieldBlock key={item.fieldname} field={item} value={row[item.fieldname]} mode={mode} disabled={!editable} style={isFullWidth(item) ? { gridColumn: "1 / -1" } : undefined} onChange={(value) => updateRow(index, item.fieldname, value)} />)}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {!rows.length && <tr><td colSpan={listFields.length + 1} className="muted" style={{ textAlign: "center", padding: 20 }}>No rows.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TabButtons({ tabs, activeTab, setActiveTab }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "0 20px", overflowX: "auto", borderBottom: "1px solid hsl(var(--border))", backgroundColor: "var(--surface-2)" }}>
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.key] || FileText;
        const active = tab.key === activeTab;
        return (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", whiteSpace: "nowrap", border: "none", borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent", background: active ? "var(--surface)" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--brand)" : "var(--ink-3)", borderRadius: "4px 4px 0 0" }}>
            <Icon size={15} /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SalesInvoiceMetadataLayout({ meta, value, onChange, mode = "edit", disabled = false, errors = {} }) {
  const tabs = useMemo(() => buildInvoiceTabs(meta?.fields), [meta]);
  const [activeTab, setActiveTab] = useState("details");
  const tab = tabs.find((item) => item.key === activeTab) || tabs[0];

  return (
    <div>
      <TabButtons tabs={tabs} activeTab={tab?.key} setActiveTab={setActiveTab} />
      <div style={{ padding: 20 }}>
        {sectionsFor(tab?.fields || []).map((section) => (
          <SectionPanel key={section.key} section={section} meta={meta} value={value} onChange={onChange} mode={mode} disabled={disabled} errors={errors} />
        ))}
      </div>
    </div>
  );
}

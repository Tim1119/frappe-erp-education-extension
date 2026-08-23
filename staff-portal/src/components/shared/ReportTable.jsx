import { useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NUMERIC_TYPES = ["Currency", "Int", "Float", "Percent"];

function isNumeric(fieldtype) {
  return NUMERIC_TYPES.includes(fieldtype);
}

function cellText(row, col) {
  const v = row[col.fieldname];
  return v === null || v === undefined ? "" : String(v);
}

export function formatDisplay(value, fieldtype) {
  if (value === null || value === undefined || value === "") return "—";
  if (fieldtype === "Currency") return `₦${Number(value).toLocaleString()}`;
  if (isNumeric(fieldtype)) return Number(value).toLocaleString();
  return value;
}

/**
 * Dense, spreadsheet-style report table -- shared by every Frappe Report
 * page (Fee Collection reports today, Assessment/Other Reports later).
 * Column shape matches frappe.desk.query_report.run's own "columns"
 * output: { fieldname, label, fieldtype, options, width }.
 *
 * @param {Array}    columns
 * @param {Array}    rows              — plain dicts only, no server total row
 * @param {function} [onRowClick]
 * @param {function} [onVisibleRowsChange] — called with the filtered+sorted
 *   rows currently on screen, so a sibling export/print toolbar can act on
 *   exactly what the user sees rather than the full unfiltered dataset.
 * @param {string}   [emptyMessage]
 * @param {boolean}  [showTotals] — mirrors the real report's own
 *   add_total_row flag; default true to match the reports already built
 *   against this component (both had add_total_row: 1).
 * @param {Array}    [footerRows] — summary rows already calculated by the
 *   report backend. When present these are rendered verbatim instead of
 *   calculating another total from the body rows.
 * @param {boolean}  [showColumnFilters] — per-column filter input row;
 *   default true. Set false for reports with many single-character/
 *   low-cardinality columns (e.g. one column per day of the month) where
 *   a filter box per column adds clutter without real filtering value.
 */
export default function ReportTable({
  columns,
  rows,
  onRowClick,
  onVisibleRowsChange,
  emptyMessage = "No data found",
  showTotals = true,
  footerRows = [],
  showColumnFilters = true,
}) {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: null, dir: null });

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((col) => {
        const f = (filters[col.fieldname] || "").trim().toLowerCase();
        if (!f) return true;
        return cellText(row, col).toLowerCase().includes(f);
      }),
    );
  }, [rows, columns, filters]);

  const sortedRows = useMemo(() => {
    if (!sort.field) return filteredRows;
    const col = columns.find((c) => c.fieldname === sort.field);
    const copy = [...filteredRows];
    copy.sort((a, b) => {
      if (isNumeric(col?.fieldtype)) {
        const av = Number(a[sort.field]) || 0;
        const bv = Number(b[sort.field]) || 0;
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      const av = String(a[sort.field] ?? "");
      const bv = String(b[sort.field] ?? "");
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return copy;
  }, [filteredRows, sort, columns]);

  useEffect(() => {
    onVisibleRowsChange?.(sortedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedRows]);

  const totals = useMemo(() => {
    const t = {};
    columns.forEach((col, i) => {
      if (isNumeric(col.fieldtype)) {
        t[col.fieldname] = sortedRows.reduce((sum, r) => sum + (Number(r[col.fieldname]) || 0), 0);
      } else {
        t[col.fieldname] = i === 0 ? "Total" : "";
      }
    });
    return t;
  }, [sortedRows, columns]);

  function handleSort(col) {
    setSort((prev) => {
      if (prev.field !== col.fieldname) return { field: col.fieldname, dir: "asc" };
      if (prev.dir === "asc") return { field: col.fieldname, dir: "desc" };
      return { field: null, dir: null };
    });
  }

  return (
    <div className="report-table-scroll block min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
      <table className="min-w-max w-full border-collapse text-xs">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.fieldname}
                style={{ width: col.width }}
                className="cursor-pointer select-none whitespace-nowrap border-b border-r px-2 py-1.5 text-left font-semibold text-muted-foreground last:border-r-0 hover:bg-muted/50"
                onClick={() => handleSort(col)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sort.field === col.fieldname ? (
                    sort.dir === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  ) : (
                    <ChevronsUpDown className="h-3 w-3 opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
          {showColumnFilters && (
            <tr className="no-print">
              {columns.map((col) => (
                <th key={col.fieldname} className="border-b border-r px-1 py-1 last:border-r-0">
                  <input
                    value={filters[col.fieldname] || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, [col.fieldname]: e.target.value }))}
                    placeholder="Filter…"
                    className="h-6 w-full rounded border border-input bg-transparent px-1.5 text-xs font-normal outline-none focus:border-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {sortedRows.map((row, rIndex) => (
            <tr
              key={rIndex}
              className={cn(
                "border-b",
                onRowClick && "cursor-pointer hover:bg-muted/50",
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.fieldname} className="border-r px-2 py-1 align-middle last:border-r-0">
                  {formatDisplay(row[col.fieldname], col.fieldtype)}
                </td>
              ))}
            </tr>
          ))}
          {sortedRows.length === 0 && (
            <tr>
              <td colSpan={columns.length || 1} className="px-2 py-6 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        {footerRows.length > 0 ? (
          <tfoot>
            {footerRows.map((row, rowIndex) => (
              <tr key={`${row.account || "summary"}-${rowIndex}`} className={cn("bg-muted/40 font-semibold", rowIndex === 0 && "border-t-2")}>
                {columns.map((col) => {
                  const value = row[col.fieldname];
                  return <td key={col.fieldname} className="border-r px-2 py-1.5 last:border-r-0">{value === null || value === undefined || value === "" ? "" : formatDisplay(value, col.fieldtype)}</td>;
                })}
              </tr>
            ))}
          </tfoot>
        ) : showTotals && sortedRows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 bg-muted/50 font-semibold">
              {columns.map((col) => (
                <td key={col.fieldname} className="border-r px-2 py-1.5 last:border-r-0">
                  {isNumeric(col.fieldtype)
                    ? formatDisplay(totals[col.fieldname], col.fieldtype)
                    : totals[col.fieldname]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

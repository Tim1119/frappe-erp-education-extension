import { formatDisplay } from "./ReportTable";

/**
 * Static, non-interactive table for the standalone report print view
 * (ReportPrintPage) -- deliberately has NO width or overflow constraint
 * of any kind, unlike ReportTable's on-screen "w-full overflow-auto"
 * container. This is the actual fix for wide reports (e.g. one column
 * per day of the month): with nothing clipping it, the table renders at
 * its full natural width and the browser's own print engine paginates
 * it across as many physical pages as it needs, same as Frappe Desk's
 * own separate print view.
 *
 * No sorting, no column filters, no row click -- this is a frozen
 * snapshot of exactly what the report page had on screen when Print was
 * clicked, not a live re-render of the interactive report.
 */
export default function ReportPrintTable({ columns, rows }) {
  return (
    <table className="border-collapse text-xs">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.fieldname}
              className="whitespace-nowrap border px-2 py-1 text-left font-semibold"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIndex) => (
          <tr key={rIndex}>
            {columns.map((col) => (
              <td key={col.fieldname} className="whitespace-nowrap border px-2 py-1">
                {formatDisplay(row[col.fieldname], col.fieldtype)}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length || 1} className="border px-2 py-6 text-center text-muted-foreground">
              No data
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

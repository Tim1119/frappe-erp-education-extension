/**
 * Title + applied-filters summary shown ONLY when a report is printed or
 * saved to PDF (see .print-only in index.css) -- makes a printed/exported
 * copy self-describing without the on-screen filter bar, which .no-print
 * correctly hides in that same context.
 *
 * @param {string} title
 * @param {Array<{label: string, value: string}>} [filters] -- entries
 *   with an empty/falsy value are dropped, so callers can pass every
 *   filter unconditionally without checking for "not selected yet".
 */
export default function ReportPrintHeader({ title, filters = [] }) {
  const summary = filters
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`)
    .join(" · ");

  return (
    <div className="print-only mb-3">
      <h1 className="text-base font-semibold">{title}</h1>
      {summary && <p className="text-xs text-muted-foreground">{summary}</p>}
    </div>
  );
}

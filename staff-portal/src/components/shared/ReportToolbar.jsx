import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToXLSX } from "@/utils/reportExport";

/**
 * Export/Print controls shared by every report page. Operates on whatever
 * rows are currently visible in the paired ReportTable (post column-filter),
 * not the full unfiltered dataset -- pass the rows lifted via
 * ReportTable's onVisibleRowsChange.
 *
 * @param {string}   filenameBase — no extension, e.g. "student-fee-collection"
 * @param {Array}    columns
 * @param {Array}    rows
 * @param {function} [onPrint] — optional override for the Print button.
 *   Default is window.print() on the live page (correct for reports with
 *   a normal, bounded column count). Pass this for reports whose on-
 *   screen table is horizontally scroll-clipped (e.g. one column per day
 *   of the month) -- see utils/reportPrintView.js's openReportPrintView,
 *   which opens a separate, unconstrained print view in a new tab
 *   instead, the same mechanism Frappe Desk's own report print uses.
 */
export default function ReportToolbar({ filenameBase, columns, rows, onPrint }) {
  return (
    <div className="no-print flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV(`${filenameBase}.csv`, columns, rows)}
        disabled={!rows.length}
      >
        <Download className="mr-2 h-4 w-4" /> CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToXLSX(`${filenameBase}.xlsx`, columns, rows)}
        disabled={!rows.length}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint || (() => window.print())}>
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import { getReportData } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// The real report ("Student Fee Collection") is a Query Report whose SQL
// (student_fee_collection.json's "query" field) reads from `tabSales
// Invoice` joined to `tabStudent` -- NOT from the Fees doctype, despite
// its ref_doctype metadata saying "Fees". It also takes zero filters
// ("filters": [] in the report JSON), so there is nothing to build a
// filter bar out of here -- only the per-column filter row ReportTable
// already provides.
export default function StudentFeeCollectionReportPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Student Fee Collection");
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
      // Frappe appends a totals row as a positional array (not a
      // fieldname-keyed dict) when add_total_row is set; ReportTable
      // computes its own totals live from whatever is visible after
      // column filtering, so the server's static one is dropped here.
      const cleanRows = (r.result || []).filter((row) => !Array.isArray(row));
      setColumns(displayColumns);
      setRows(cleanRows);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Student Fee Collection Report"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <div className="flex items-center gap-2">
          <ReportToolbar filenameBase="student-fee-collection-report" columns={columns} rows={visibleRows} />
          <Button variant="outline" size="sm" className="no-print" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="report-printable rounded-md border">
        <ReportTable
          columns={columns}
          rows={rows}
          onVisibleRowsChange={setVisibleRows}
          onRowClick={(row) => {
            if (row.student) navigate(`/dashboard/students/${encodeURIComponent(row.student)}`);
          }}
          emptyMessage="No fee collection data found"
        />
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { getReportData } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// Real report ("Employee Information", report_type: "Report Builder",
// ref_doctype: Employee). Report Builder reports store their columns in an
// embedded "json" string rather than a real "filters" array -- this one's
// embedded filters list is empty ("filters": []), so there's nothing to
// build a filter bar out of, same as Student Fee Collection. Its embedded
// columns: name, employee_number, date_of_joining, branch, department,
// designation, gender, status, company, employment_type, reports_to,
// company_email -- frappe.desk.query_report.run() normalizes these into
// the standard {fieldname, label, fieldtype} shape regardless of report
// type, so no special handling is needed here.
export default function EmployeeInformationPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Employee Information");
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
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
        title="Employee Information"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <div className="flex items-center gap-2">
          <ReportToolbar filenameBase="employee-information" columns={columns} rows={visibleRows} />
          <Button variant="outline" size="sm" className="no-print" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="report-printable rounded-md border">
        <ReportPrintHeader title="Employee Information" />
        <ReportTable
          columns={columns}
          rows={rows}
          onVisibleRowsChange={setVisibleRows}
          onRowClick={(row) => {
            if (row.name) navigate(`/dashboard/employees/${encodeURIComponent(row.name)}`);
          }}
          emptyMessage="No employee information found"
        />
      </div>
    </>
  );
}

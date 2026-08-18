import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { getReportData, getLinkOptions } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

const PARAMETERS = ["Branch", "Grade", "Department", "Designation", "Employment Type"];

// Real report ("Employee Analytics", Script Report, ref_doctype: Employee).
// Real filters: company (Link, required), parameter (Select, required,
// exactly these 5 fixed options -- pivots the report's own columns around
// whichever one is picked). Both required -> Run button gate. execute()
// returns a 4-tuple with chart data, chart not rendered here.
export default function EmployeeAnalyticsPage() {
  const [company, setCompany] = useState("");
  const [parameter, setParameter] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
  }, []);

  async function load() {
    if (!company || !parameter) {
      toast.error("Company and Parameter are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Employee Analytics", { company, parameter });
      const displayColumns = (r.columns || []).map((c) => ({ ...c, label: t(c.label) }));
      const cleanRows = (r.result || []).filter((row) => !Array.isArray(row));
      setColumns(displayColumns);
      setRows(cleanRows);
      setHasRun(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const printFilters = [{ label: "Company", value: company }, { label: "Parameter", value: parameter }];

  return (
    <>
      <PageHeader
        title="Employee Analytics"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="employee-analytics" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Company <span className="text-destructive">*</span></Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companyOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Parameter <span className="text-destructive">*</span></Label>
            <Select value={parameter} onValueChange={setParameter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select parameter" /></SelectTrigger>
              <SelectContent>
                {PARAMETERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Employee Analytics" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            emptyMessage="No employee analytics data found"
          />
        </div>
      )}
    </>
  );
}

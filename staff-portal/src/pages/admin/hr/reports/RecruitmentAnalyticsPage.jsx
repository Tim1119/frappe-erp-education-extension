import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Recruitment Analytics", Script Report, ref_doctype:
// Staffing Plan). Real filters: company (Link, required, defaults to the
// user's default Company in Desk -- left blank here for the user to pick,
// same simplification used throughout this portal), on_date (Date,
// required, default today). Both required, so this gates on a Run button
// rather than auto-loading. execute() returns a 4-tuple with chart data
// (columns, employees, None, chart) -- the chart isn't rendered here, same
// as every other report page in this portal.
export default function RecruitmentAnalyticsPage() {
  const [company, setCompany] = useState("");
  const [onDate, setOnDate] = useState(todayStr());
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
    if (!company || !onDate) {
      toast.error("Company and On Date are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Recruitment Analytics", { company, on_date: onDate });
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

  const printFilters = [{ label: "Company", value: company }, { label: "On Date", value: onDate }];

  return (
    <>
      <PageHeader
        title="Recruitment Analytics"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="recruitment-analytics" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
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
            <Label>On Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={onDate} onChange={(e) => setOnDate(e.target.value)} required />
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Recruitment Analytics" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            emptyMessage="No recruitment data found"
          />
        </div>
      )}
    </>
  );
}

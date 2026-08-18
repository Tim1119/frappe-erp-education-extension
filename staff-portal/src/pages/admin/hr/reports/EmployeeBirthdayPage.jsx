import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ALL = "__all__";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Real report ("Employee Birthday", Script Report, ref_doctype: Employee).
// Real filters: month (Select, optional, real 3-letter values, default =
// current month), company (Link, optional, defaults to the user's default
// Company in Desk -- left unselected here, same simplification used
// throughout this portal). Neither is required, so this auto-loads on
// mount with the current month, matching the "all optional" rule.
export default function EmployeeBirthdayPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [company, setCompany] = useState(ALL);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
  }, []);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Employee Birthday", {
        month,
        company: company === ALL ? undefined : company,
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printFilters = [{ label: "Month", value: month }, { label: "Company", value: company === ALL ? "" : company }];

  return (
    <>
      <PageHeader
        title="Employee Birthday"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <ReportToolbar filenameBase="employee-birthday" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Select month" /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All companies" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Companies</SelectItem>
                {companyOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      <div className="report-printable rounded-md border">
        <ReportPrintHeader title="Employee Birthday" filters={printFilters} />
        <ReportTable
          columns={columns}
          rows={rows}
          onVisibleRowsChange={setVisibleRows}
          showTotals={false}
          onRowClick={(row) => {
            if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
          }}
          emptyMessage="No birthdays found for this month"
        />
      </div>
    </>
  );
}

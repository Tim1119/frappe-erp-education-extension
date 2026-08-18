import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ALL = "__all__";
const STATUS_OPTIONS = ["Draft", "Paid", "Unpaid", "Claimed", "Cancelled"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Employee Advance Summary", Script Report, ref_doctype:
// Employee Advance, add_total_row: 1). Real filters: employee (Link,
// optional), from_date (Date, optional, real default = fiscal year start
// via erpnext.utils.get_fiscal_year -- left blank here rather than
// approximating a fiscal year boundary client-side), to_date (Date,
// optional, default today), company (Link, required), status (Select,
// optional, exactly Draft/Paid/Unpaid/Claimed/Cancelled). company is the
// only required filter -> Run button gate.
export default function EmployeeAdvanceSummaryPage() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(ALL);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayStr());
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState(ALL);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Employee").then(setEmployeeOptions).catch(() => {});
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
  }, []);

  async function load() {
    if (!company) {
      toast.error("Company is required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Employee Advance Summary", {
        employee: employee === ALL ? undefined : employee,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        company,
        status: status === ALL ? undefined : status,
      });
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

  const printFilters = [
    { label: "Employee", value: employee === ALL ? "" : employee },
    { label: "From Date", value: fromDate },
    { label: "To Date", value: toDate },
    { label: "Company", value: company },
    { label: "Status", value: status === ALL ? "" : status },
  ];

  return (
    <>
      <PageHeader
        title="Employee Advance Summary"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="employee-advance-summary" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All employees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Employees</SelectItem>
                {employeeOptions.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

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
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any Status</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          <ReportPrintHeader title="Employee Advance Summary" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            onRowClick={(row) => {
              if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
            }}
            emptyMessage="No employee advance data found"
          />
        </div>
      )}
    </>
  );
}

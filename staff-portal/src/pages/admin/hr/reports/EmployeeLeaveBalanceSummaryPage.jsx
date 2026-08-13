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
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended", "Left"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Employee Leave Balance Summary", Script Report,
// ref_doctype: Employee). Real filters: date (Date, required, default
// today), company (Link, required), employee (Link, optional), department
// (Link, optional), employee_status (Select, optional, options
// ""/Active/Inactive/Suspended/Left, default "Active"). date + company
// required -> Run button gate.
export default function EmployeeLeaveBalanceSummaryPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayStr());
  const [company, setCompany] = useState("");
  const [employee, setEmployee] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [employeeStatus, setEmployeeStatus] = useState("Active");

  const [companyOptions, setCompanyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
    getLinkOptions("Employee").then(setEmployeeOptions).catch(() => {});
    getLinkOptions("Department").then(setDepartmentOptions).catch(() => {});
  }, []);

  async function load() {
    if (!date || !company) {
      toast.error("Date and Company are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Employee Leave Balance Summary", {
        date,
        company,
        employee: employee === ALL ? undefined : employee,
        department: department === ALL ? undefined : department,
        employee_status: employeeStatus === ALL ? undefined : employeeStatus,
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
    { label: "Date", value: date },
    { label: "Company", value: company },
    { label: "Employee", value: employee === ALL ? "" : employee },
    { label: "Department", value: department === ALL ? "" : department },
    { label: "Employee Status", value: employeeStatus === ALL ? "" : employeeStatus },
  ];

  return (
    <>
      <PageHeader
        title="Employee Leave Balance Summary"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="employee-leave-balance-summary" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Departments</SelectItem>
                {departmentOptions.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Employee Status</Label>
            <Select value={employeeStatus} onValueChange={setEmployeeStatus}>
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
          <ReportPrintHeader title="Employee Leave Balance Summary" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            onRowClick={(row) => {
              if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
            }}
            emptyMessage="No leave balance data found"
          />
        </div>
      )}
    </>
  );
}

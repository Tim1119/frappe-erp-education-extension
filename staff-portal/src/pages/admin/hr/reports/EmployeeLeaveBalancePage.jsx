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
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

const ALL = "__all__";
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended", "Left"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Employee Leave Balance", Script Report, ref_doctype:
// Employee). Real filters: from_date (Date, required), to_date (Date,
// required), company (Link, required), department (Link, optional),
// employee (Link, optional), employee_status (Select, optional, default
// "Active"), consolidate_leave_types (Check, default 1, depends_on
// "eval: !doc.employee" -- only shown/relevant when no single employee is
// selected). Real onload calls the whitelisted hrms.hr.utils.
// get_leave_period(today, today, company) to seed From/To Date from
// whichever "Leave Period" record covers today for that company --
// mirrored here on company change rather than on mount, since the real
// call needs a company and none is pre-selected.
export default function EmployeeLeaveBalancePage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState(ALL);
  const [employee, setEmployee] = useState(ALL);
  const [employeeStatus, setEmployeeStatus] = useState("Active");
  const [consolidateLeaveTypes, setConsolidateLeaveTypes] = useState(true);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
    getLinkOptions("Department").then(setDepartmentOptions).catch(() => {});
    getLinkOptions("Employee").then(setEmployeeOptions).catch(() => {});
  }, []);

  function onCompanyChange(v) {
    setCompany(v);
    const today = todayStr();
    callMethod("hrms.hr.utils.get_leave_period", { from_date: today, to_date: today, company: v })
      .then((periods) => {
        if (periods && periods.length) {
          setFromDate(periods[0].from_date);
          setToDate(periods[0].to_date);
        }
      })
      .catch(() => {});
  }

  async function load() {
    if (!fromDate || !toDate || !company) {
      toast.error("From Date, To Date, and Company are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Employee Leave Balance", {
        from_date: fromDate,
        to_date: toDate,
        company,
        department: department === ALL ? undefined : department,
        employee: employee === ALL ? undefined : employee,
        employee_status: employeeStatus === ALL ? undefined : employeeStatus,
        consolidate_leave_types: employee === ALL && consolidateLeaveTypes ? 1 : 0,
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
    { label: "From Date", value: fromDate },
    { label: "To Date", value: toDate },
    { label: "Company", value: company },
    { label: "Department", value: department === ALL ? "" : department },
    { label: "Employee", value: employee === ALL ? "" : employee },
    { label: "Employee Status", value: employeeStatus === ALL ? "" : employeeStatus },
  ];

  return (
    <>
      <PageHeader
        title="Employee Leave Balance"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="employee-leave-balance" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>From Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>To Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Company <span className="text-destructive">*</span></Label>
            <Select value={company} onValueChange={onCompanyChange}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companyOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
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
            <Label>Employee Status</Label>
            <Select value={employeeStatus} onValueChange={setEmployeeStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any Status</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {employee === ALL && (
            <div className="flex items-center gap-2 pb-2">
              <input type="checkbox" id="consolidate" checked={consolidateLeaveTypes} onChange={(e) => setConsolidateLeaveTypes(e.target.checked)} />
              <Label htmlFor="consolidate" className="font-normal">Consolidate Leave Types</Label>
            </div>
          )}

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Employee Leave Balance" filters={printFilters} />
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

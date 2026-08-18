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

function yearStartStr() {
  return `${new Date().getFullYear()}-01-01`;
}
function yearEndStr() {
  return `${new Date().getFullYear()}-12-31`;
}

// Real report ("Employees working on a holiday", Script Report,
// ref_doctype: Attendance). Real filters: from_date (Date, required,
// default = start of current year), to_date (Date, required, default =
// end of current year), holiday_list (Link, optional), department (Link,
// optional), company (Link, required, defaults to the user's default
// Company in Desk -- left unselected here for the user to pick). from_date/
// to_date/company required -> Run button gate.
export default function EmployeesWorkingOnHolidayPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(yearStartStr());
  const [toDate, setToDate] = useState(yearEndStr());
  const [holidayList, setHolidayList] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [company, setCompany] = useState("");

  const [holidayListOptions, setHolidayListOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Holiday List").then(setHolidayListOptions).catch(() => {});
    getLinkOptions("Department").then(setDepartmentOptions).catch(() => {});
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
  }, []);

  async function load() {
    if (!fromDate || !toDate || !company) {
      toast.error("From Date, To Date, and Company are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Employees working on a holiday", {
        from_date: fromDate,
        to_date: toDate,
        holiday_list: holidayList === ALL ? undefined : holidayList,
        department: department === ALL ? undefined : department,
        company,
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
    { label: "Holiday List", value: holidayList === ALL ? "" : holidayList },
    { label: "Department", value: department === ALL ? "" : department },
    { label: "Company", value: company },
  ];

  return (
    <>
      <PageHeader
        title="Employees Working on a Holiday"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="employees-working-on-a-holiday" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>From Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>To Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Holiday List</Label>
            <Select value={holidayList} onValueChange={setHolidayList}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Any holiday list" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any Holiday List</SelectItem>
                {holidayListOptions.map((h) => <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>)}
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
            <Label>Company <span className="text-destructive">*</span></Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companyOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
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
          <ReportPrintHeader title="Employees Working on a Holiday" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            onRowClick={(row) => {
              if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
            }}
            emptyMessage="No employees found working on a holiday"
          />
        </div>
      )}
    </>
  );
}

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
const MONTHS = [
  { value: "1", label: "Jan" }, { value: "2", label: "Feb" }, { value: "3", label: "Mar" },
  { value: "4", label: "Apr" }, { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "Aug" }, { value: "9", label: "Sep" },
  { value: "10", label: "Oct" }, { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
];
const GROUP_BY_OPTIONS = ["Branch", "Grade", "Department", "Designation"];

// Real report ("Monthly Attendance Sheet", Script Report, ref_doctype:
// Attendance). Real filters (all from the .js, not the JSON): filter_
// based_on (Select Month/Date Range, required, default "Month" -- toggles
// which of month+year vs start_date+end_date is reqd, mirrored below as
// conditional rendering + a 90-day-range client check matching the real
// validate_date_range()), month (Select 1-12, default = current month),
// year (Select, options populated by the real whitelisted onload RPC
// get_attendance_years() -- distinct years that actually have Attendance
// data, defaulting to the most recent), start_date/end_date (Date, only
// for Date Range mode), employee (Link, filtered by company via get_query),
// company (Link, required), department (Link, filtered by company),
// branch (Link, unfiltered), group_by (Select, optional), include_company_
// descendants (Check, default 1), summarized_view (Check, default 0).
export default function MonthlyAttendanceSheetPage() {
  const navigate = useNavigate();
  const [filterBasedOn, setFilterBasedOn] = useState("Month");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employee, setEmployee] = useState(ALL);
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState(ALL);
  const [branch, setBranch] = useState(ALL);
  const [groupBy, setGroupBy] = useState(ALL);
  const [includeCompanyDescendants, setIncludeCompanyDescendants] = useState(true);
  const [summarizedView, setSummarizedView] = useState(false);

  const [yearOptions, setYearOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    callMethod("hrms.hr.report.monthly_attendance_sheet.monthly_attendance_sheet.get_attendance_years")
      .then((r) => {
        const years = (r || "").split("\n").filter(Boolean);
        setYearOptions(years);
        if (years.length) setYear(years[0]);
      })
      .catch(() => {});
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
    getLinkOptions("Branch").then(setBranchOptions).catch(() => {});
  }, []);

  // Real get_query: employee/department options are scoped to the chosen company.
  useEffect(() => {
    if (company) {
      getLinkOptions("Employee", { company }).then(setEmployeeOptions).catch(() => {});
      getLinkOptions("Department", { company }).then(setDepartmentOptions).catch(() => {});
    } else {
      setEmployeeOptions([]);
      setDepartmentOptions([]);
    }
    setEmployee(ALL);
    setDepartment(ALL);
  }, [company]);

  async function load() {
    if (!company) {
      toast.error("Company is required.");
      return;
    }
    if (filterBasedOn === "Month" && (!month || !year)) {
      toast.error("Month and Year are required.");
      return;
    }
    if (filterBasedOn === "Date Range") {
      if (!startDate || !endDate) {
        toast.error("Start Date and End Date are required.");
        return;
      }
      // Mirrors validate_date_range() in the real report's .js.
      const dayDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      if (dayDiff > 90) {
        toast.error("Please set a date range less than 90 days.");
        return;
      }
    }
    try {
      setLoading(true);
      const r = await getReportData("Monthly Attendance Sheet", {
        filter_based_on: filterBasedOn,
        month: filterBasedOn === "Month" ? month : undefined,
        year: filterBasedOn === "Month" ? year : undefined,
        start_date: filterBasedOn === "Date Range" ? startDate : undefined,
        end_date: filterBasedOn === "Date Range" ? endDate : undefined,
        employee: employee === ALL ? undefined : employee,
        company,
        department: department === ALL ? undefined : department,
        branch: branch === ALL ? undefined : branch,
        group_by: groupBy === ALL ? undefined : groupBy,
        include_company_descendants: includeCompanyDescendants ? 1 : 0,
        summarized_view: summarizedView ? 1 : 0,
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
    { label: "Company", value: company },
    filterBasedOn === "Month"
      ? { label: "Period", value: `${MONTHS.find((m) => m.value === month)?.label || month} ${year}` }
      : { label: "Period", value: startDate && endDate ? `${startDate} – ${endDate}` : "" },
    { label: "Employee", value: employee === ALL ? "" : employee },
    { label: "Department", value: department === ALL ? "" : department },
    { label: "Branch", value: branch === ALL ? "" : branch },
    { label: "Group By", value: groupBy === ALL ? "" : groupBy },
  ];

  return (
    <>
      {/* Up to 31 day-columns (plus grouped/summarized variants) don't fit
          legibly on a standard portrait page -- same landscape override
          used by Student Monthly Attendance Sheet. */}
      <style>{`
        @media print {
          @page { size: A3 landscape; margin: 10mm; }
        }
      `}</style>

      <PageHeader
        title="Monthly Attendance Sheet"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="monthly-attendance-sheet" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Filter Based On <span className="text-destructive">*</span></Label>
            <Select value={filterBasedOn} onValueChange={setFilterBasedOn}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Date Range">Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterBasedOn === "Month" ? (
            <>
              <div className="space-y-2">
                <Label>Month <span className="text-destructive">*</span></Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year <span className="text-destructive">*</span></Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </>
          )}

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
            <Select value={employee} onValueChange={setEmployee} disabled={!company}>
              <SelectTrigger className="w-56"><SelectValue placeholder={company ? "All employees" : "Select company first"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Employees</SelectItem>
                {employeeOptions.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment} disabled={!company}>
              <SelectTrigger className="w-56"><SelectValue placeholder={company ? "All departments" : "Select company first"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Departments</SelectItem>
                {departmentOptions.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All branches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Branches</SelectItem>
                {branchOptions.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group By</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-40"><SelectValue placeholder="No grouping" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>No Grouping</SelectItem>
                {GROUP_BY_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="include_descendants" checked={includeCompanyDescendants} onChange={(e) => setIncludeCompanyDescendants(e.target.checked)} />
            <Label htmlFor="include_descendants" className="font-normal">Include Company Descendants</Label>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="summarized" checked={summarizedView} onChange={(e) => setSummarizedView(e.target.checked)} />
            <Label htmlFor="summarized" className="font-normal">Summarized View</Label>
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Monthly Attendance Sheet" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            showColumnFilters={false}
            onRowClick={(row) => {
              if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
            }}
            emptyMessage="No attendance data found"
          />
        </div>
      )}
    </>
  );
}

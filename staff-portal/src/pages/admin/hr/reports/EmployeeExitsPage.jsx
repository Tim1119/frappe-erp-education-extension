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
const INTERVIEW_STATUS = ["Pending", "Scheduled", "Completed"];
const FINAL_DECISION = ["Employee Retained", "Exit Confirmed"];

function monthsAgoStr(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Employee Exits", Script Report, ref_doctype: Exit
// Interview, filters: [] in the report JSON but the real filter bar lives
// in employee_exits.js). Every real filter is optional -- from_date
// (default 12 months ago), to_date (default today), company, department,
// designation, employee, reports_to (Link to Employee), interview_status
// (Select), final_decision (Select), exit_interview_pending/
// questionnaire_pending/fnf_pending (Check). Since nothing is reqd this
// auto-loads on mount with the real defaults, same as the "all optional"
// rule -- the filter bar still shows so the (genuinely useful, numerous)
// filters can be adjusted afterward.
export default function EmployeeExitsPage() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(monthsAgoStr(12));
  const [toDate, setToDate] = useState(todayStr());
  const [company, setCompany] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [designation, setDesignation] = useState(ALL);
  const [employee, setEmployee] = useState(ALL);
  const [reportsTo, setReportsTo] = useState(ALL);
  const [interviewStatus, setInterviewStatus] = useState(ALL);
  const [finalDecision, setFinalDecision] = useState(ALL);
  const [exitInterviewPending, setExitInterviewPending] = useState(false);
  const [questionnairePending, setQuestionnairePending] = useState(false);
  const [fnfPending, setFnfPending] = useState(false);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getLinkOptions("Company").then(setCompanyOptions).catch(() => {});
    getLinkOptions("Department").then(setDepartmentOptions).catch(() => {});
    getLinkOptions("Designation").then(setDesignationOptions).catch(() => {});
    getLinkOptions("Employee").then(setEmployeeOptions).catch(() => {});
  }, []);

  async function load() {
    try {
      setLoading(true);
      const r = await getReportData("Employee Exits", {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        company: company === ALL ? undefined : company,
        department: department === ALL ? undefined : department,
        designation: designation === ALL ? undefined : designation,
        employee: employee === ALL ? undefined : employee,
        reports_to: reportsTo === ALL ? undefined : reportsTo,
        interview_status: interviewStatus === ALL ? undefined : interviewStatus,
        final_decision: finalDecision === ALL ? undefined : finalDecision,
        exit_interview_pending: exitInterviewPending ? 1 : undefined,
        questionnaire_pending: questionnairePending ? 1 : undefined,
        fnf_pending: fnfPending ? 1 : undefined,
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printFilters = [
    { label: "From Date", value: fromDate },
    { label: "To Date", value: toDate },
    { label: "Company", value: company === ALL ? "" : company },
    { label: "Department", value: department === ALL ? "" : department },
    { label: "Designation", value: designation === ALL ? "" : designation },
    { label: "Employee", value: employee === ALL ? "" : employee },
    { label: "Reports To", value: reportsTo === ALL ? "" : reportsTo },
    { label: "Interview Status", value: interviewStatus === ALL ? "" : interviewStatus },
    { label: "Final Decision", value: finalDecision === ALL ? "" : finalDecision },
  ];

  return (
    <>
      <PageHeader
        title="Employee Exits"
        description={loading ? "Loading…" : `${rows.length} row${rows.length === 1 ? "" : "s"}`}
      >
        <ReportToolbar filenameBase="employee-exits" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All companies" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Companies</SelectItem>
                {companyOptions.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Departments</SelectItem>
                {departmentOptions.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Select value={designation} onValueChange={setDesignation}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All designations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Designations</SelectItem>
                {designationOptions.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All employees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Employees</SelectItem>
                {employeeOptions.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reports To</Label>
            <Select value={reportsTo} onValueChange={setReportsTo}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Anyone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Anyone</SelectItem>
                {employeeOptions.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Interview Status</Label>
            <Select value={interviewStatus} onValueChange={setInterviewStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any Status</SelectItem>
                {INTERVIEW_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Final Decision</Label>
            <Select value={finalDecision} onValueChange={setFinalDecision}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Any decision" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any Decision</SelectItem>
                {FINAL_DECISION.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="exit_interview_pending" checked={exitInterviewPending} onChange={(e) => setExitInterviewPending(e.target.checked)} />
            <Label htmlFor="exit_interview_pending" className="font-normal">Exit Interview Pending</Label>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="questionnaire_pending" checked={questionnairePending} onChange={(e) => setQuestionnairePending(e.target.checked)} />
            <Label htmlFor="questionnaire_pending" className="font-normal">Exit Questionnaire Pending</Label>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="fnf_pending" checked={fnfPending} onChange={(e) => setFnfPending(e.target.checked)} />
            <Label htmlFor="fnf_pending" className="font-normal">FnF Pending</Label>
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Employee Exits" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            onRowClick={(row) => {
              if (row.employee) navigate(`/dashboard/employees/${encodeURIComponent(row.employee)}`);
            }}
            emptyMessage="No employee exit data found"
          />
        </div>
      )}
    </>
  );
}

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
import { getReportData } from "@/services/reportService";
import { getYears, getStudentGroups } from "@/services/studentMonthlyAttendanceSheetService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";
import { openReportPrintView } from "@/utils/reportPrintView";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Real report ("Student Monthly Attendance Sheet", Script Report,
// ref_doctype: Student Attendance). Roles: Academics User only -- no
// Instructor, so this is admin-only, not teacher-visible (confirmed from
// the real report JSON, not assumed). Real filters, all required except
// month: month (Select, real 3-letter values), year (Select, populated
// from the report's own real get_year_list() -- the distinct years that
// actually have Student Attendance data, not a generic recent-years
// list), student_group (Link, required). Real columns are genuinely
// dynamic: student, student_name, then one column per day of the
// selected month (28-31, fieldname = day number, single-character status
// P/A/L/H/-/blank), then Total Present/Leave/Absent -- all computed
// server-side in execute(), including a real Student Leave Application
// (mark_as_present) override and holiday marking. add_total_row: 0.
//
// Real Desk sets the Year filter's default to every returned year joined
// with "\n" fed into a single Select's set_input() -- which reads as an
// upstream quirk more than an intentional multi-value default. Defaulting
// to the most recent year instead, which is what a user actually wants.
export default function StudentMonthlyAttendanceSheetPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState("");
  const [studentGroup, setStudentGroup] = useState("");

  const [yearOptions, setYearOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getYears()
      .then((r) => {
        const years = (r || []).map(String);
        setYearOptions(years);
        if (years.length) setYear(years[years.length - 1]);
      })
      .catch(() => {});
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
  }, []);

  async function load() {
    if (!month || !year || !studentGroup) {
      toast.error("Month, Year, and Class Arm are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Student Monthly Attendance Sheet", {
        month,
        year,
        student_group: studentGroup,
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

  const studentGroupLabel = studentGroupOptions.find((g) => g.name === studentGroup)?.student_group_name || studentGroup;
  const printFilters = [
    { label: "Class Arm", value: studentGroupLabel },
    { label: "Month", value: month },
    { label: "Year", value: year },
  ];

  return (
    <>
      {/* Scoped to this page only -- this <style> tag exists in the DOM
          only while this report is mounted, so printing from any other
          report is unaffected. Up to 31 day-columns plus student/totals
          columns don't fit legibly on a standard portrait page; this
          report specifically needs a larger sheet in landscape. */}
      <style>{`
        @media print {
          @page {
            size: A3 landscape;
            margin: 10mm;
          }
        }
      `}</style>

      <PageHeader
        title="Student Monthly Attendance Sheet"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar
          filenameBase="student-monthly-attendance-sheet"
          columns={columns}
          rows={visibleRows}
          onPrint={() => openReportPrintView({
            title: "Student Monthly Attendance Sheet",
            filters: printFilters,
            columns,
            rows: visibleRows,
          })}
        />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>
              Month <span className="text-destructive">*</span>
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Year <span className="text-destructive">*</span>
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Class Arm <span className="text-destructive">*</span>
            </Label>
            <Select value={studentGroup} onValueChange={setStudentGroup}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select class arm" />
              </SelectTrigger>
              <SelectContent>
                {studentGroupOptions.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.student_group_name || g.name}</SelectItem>
                ))}
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
          <ReportPrintHeader title="Student Monthly Attendance Sheet" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            showColumnFilters={false}
            onRowClick={(row) => {
              if (row.student) navigate(`/dashboard/students/${encodeURIComponent(row.student)}`);
            }}
            emptyMessage="No students found for this Class Arm"
          />
        </div>
      )}
    </>
  );
}

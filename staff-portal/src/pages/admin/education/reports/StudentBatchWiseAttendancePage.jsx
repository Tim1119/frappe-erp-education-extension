import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/PageHeader";
import ReportTable from "@/components/shared/ReportTable";
import ReportToolbar from "@/components/shared/ReportToolbar";
import ReportPrintHeader from "@/components/shared/ReportPrintHeader";
import { getReportData } from "@/services/reportService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real report ("Student Batch-Wise Attendance", Script Report,
// ref_doctype: Student Attendance). Roles: Academics User only -- no
// Instructor, confirmed rather than assumed, so admin-only despite being
// plausible. Real filters: exactly ONE, `date` (Date, required, default
// today) -- no Academic Year/Student Batch Name/Class Arm filter despite
// those being plausible guesses. Real reason: get_active_student_group()
// hardcodes group_based_on = "Batch" AND scopes to the site's globally
// configured default Academic Year (frappe.defaults.get_defaults()
// .academic_year), not a user-selectable filter -- if that system default
// isn't set to the year you want, there's no filter here to work around
// it.
//
// Real columns (fixed, dict-format, one row per active Batch-based Class
// Arm): student_group (Link), student_group_strength, present_students,
// leave_students, absent_students -- all Int. The row data also computes
// unmarked_students, but it's never added to get_columns(), so it's a
// real dead field in the upstream code, correctly not rendered.
// Attendance counts only include records with no course_schedule (direct
// Class-Arm marking, not per-period Subject Schedule attendance).
// add_total_row: 0. No chart (execute() returns a 2-tuple). Fixed 5
// columns, not a dynamic/wide shape, so this uses the standard
// ReportToolbar Print (window.print()), not the new-tab mechanism built
// for Student Monthly Attendance Sheet.
export default function StudentBatchWiseAttendancePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayStr());

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  async function load() {
    if (!date) {
      toast.error("Date is required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Student Batch-Wise Attendance", { date });
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

  const printFilters = [{ label: "Date", value: date }];

  return (
    <>
      <PageHeader
        title="Student Batch-Wise Attendance"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select a date and run the report"}
      >
        <ReportToolbar filenameBase="student-batch-wise-attendance" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>
              Date <span className="text-destructive">*</span>
            </Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <Button onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Run Report
          </Button>
        </div>
      </Card>

      {hasRun && (
        <div className="report-printable rounded-md border">
          <ReportPrintHeader title="Student Batch-Wise Attendance" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            onRowClick={(row) => {
              if (row.student_group) navigate(`/dashboard/class-arms/${encodeURIComponent(row.student_group)}`);
            }}
            emptyMessage="No active batch-based Class Arms found for this date"
          />
        </div>
      )}
    </>
  );
}

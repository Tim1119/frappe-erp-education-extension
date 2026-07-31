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

// Real report ("Absent Student Report", Script Report, ref_doctype:
// Student Attendance). Roles: Academics User only -- no Instructor,
// confirmed rather than assumed, so this is admin-only, not
// teacher-visible despite being plausible. Real filters: exactly ONE,
// `date` (Date, required, default today) -- no date range, no Class
// Arm/Academic Year filter despite those being plausible guesses.
//
// Real columns use Frappe's OLD positional-string format
// ("Label:Type/Options:Width", data rows as plain lists, not dicts) --
// but frappe.desk.query_report.run() normalizes both server-side
// (get_column_as_dict()/normalize_result()) before the response ever
// reaches the client, so by the time it's here it's the exact same
// {fieldname, label, fieldtype, width} column shape and
// {fieldname: value} row shape as every other report -- no special
// handling needed. Fixed 5 columns (student, student_name,
// student_group, student_email_address, "student_mobile_no." -- note
// the real scrubbed fieldname keeps the trailing period from "No."),
// not a dynamic/wide shape, so this uses the standard ReportToolbar
// Print (window.print() on the live page), not the new-tab mechanism
// built for Student Monthly Attendance Sheet's 31 day-columns.
//
// Real query logic: one row per student with a submitted (docstatus=1)
// Absent Student Attendance record for the SELECTED DATE, excluding any
// student covered that day by a submitted Student Leave Application with
// mark_as_present=1 -- a genuinely flat, single-day list, not an
// aggregated/consecutive-absence summary (there's no date range to
// aggregate over). add_total_row: 0. No chart (execute() returns a
// 2-tuple).
export default function AbsentStudentReportPage() {
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
      const r = await getReportData("Absent Student Report", { date });
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
        title="Absent Student Report"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select a date and run the report"}
      >
        <ReportToolbar filenameBase="absent-student-report" columns={columns} rows={visibleRows} />
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
          <ReportPrintHeader title="Absent Student Report" filters={printFilters} />
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            onRowClick={(row) => {
              if (row.student) navigate(`/dashboard/students/${encodeURIComponent(row.student)}`);
            }}
            emptyMessage="No absent students found for this date"
          />
        </div>
      )}
    </>
  );
}

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
import { getReportData } from "@/services/reportService";
import {
  getAcademicYears,
  getPrograms,
  getStudentBatches,
} from "@/services/studentGuardianContactsService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// Real report ("Student and Guardian Contact Details", Script Report,
// ref_doctype: Program Enrollment). Roles: Instructor + Academics User --
// teacher-visible, but the query itself has NO per-teacher scoping (any
// instructor who picks any class/batch gets that class's full guardian
// contact list, not just their own students'). Real filters, all 3
// required: academic_year, program, student_batch_name. One row per
// STUDENT, not per student-guardian pair -- guardians are flattened into
// guardian1_*/guardian2_* columns, with a real hard cap of 2 guardians
// per student (confirmed in the .py: "# only 2 guardians per student"),
// not something fixed here. student_address is a single server-
// concatenated string (address_line_1, address_line_2, city, state).
// add_total_row: 0, no chart (execute() returns a 2-tuple, not 4).
export default function StudentGuardianContactsPage() {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState("");
  const [program, setProgram] = useState("");
  const [studentBatchName, setStudentBatchName] = useState("");

  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [studentBatchOptions, setStudentBatchOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getPrograms().then((r) => setProgramOptions((r || []).map((p) => p.name))).catch(() => {});
    getStudentBatches().then((r) => setStudentBatchOptions((r || []).map((b) => b.name))).catch(() => {});
  }, []);

  async function load() {
    if (!academicYear || !program || !studentBatchName) {
      toast.error("Academic Year, Class, and Batch are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Student and Guardian Contact Details", {
        academic_year: academicYear,
        program,
        student_batch_name: studentBatchName,
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

  return (
    <>
      <PageHeader
        title="Student and Guardian Contact Details"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="student-guardian-contact-details" columns={columns} rows={visibleRows} />
      </PageHeader>

      <Card className="no-print mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>
              Academic Year <span className="text-destructive">*</span>
            </Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Class <span className="text-destructive">*</span>
            </Label>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {programOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Batch <span className="text-destructive">*</span>
            </Label>
            <Select value={studentBatchName} onValueChange={setStudentBatchName}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {studentBatchOptions.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
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
          <ReportTable
            columns={columns}
            rows={rows}
            onVisibleRowsChange={setVisibleRows}
            showTotals={false}
            onRowClick={(row) => {
              if (row.student_id) navigate(`/dashboard/students/${encodeURIComponent(row.student_id)}`);
            }}
            emptyMessage="No students found for these filters"
          />
        </div>
      )}
    </>
  );
}

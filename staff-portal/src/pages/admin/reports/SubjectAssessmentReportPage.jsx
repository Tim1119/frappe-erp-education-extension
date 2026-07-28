import { useEffect, useState } from "react";
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
  getAcademicTerms,
  getCourses,
  getStudentGroups,
  getAssessmentGroups,
} from "@/services/assessmentReportsService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// Real report ("Course wise Assessment Report", Script Report,
// ref_doctype: Assessment Result). Roles: Instructor + Education Manager
// -- genuinely teacher-visible, unlike the Fee Collection reports.
// Real filters (course_wise_assessment_report.js): academic_year (reqd),
// academic_term (optional), course (reqd), student_group (optional),
// assessment_group (reqd). Columns are DYNAMIC -- one Data (grade) + one
// Float (score) column per assessment criteria actually present in the
// filtered results, pivoted server-side; ReportTable renders whatever
// columns come back, no special handling needed. add_total_row: 0.
export default function SubjectAssessmentReportPage() {
  const [academicYear, setAcademicYear] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [course, setCourse] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  const [assessmentGroup, setAssessmentGroup] = useState("");

  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getCourses().then((r) => setCourseOptions(r || [])).catch(() => {});
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
    getAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    getAcademicTerms(academicYear || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t2) => t2.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [academicYear]);

  async function load() {
    if (!academicYear || !course || !assessmentGroup) {
      toast.error("Academic Year, Subject, and Assessment Group are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Course wise Assessment Report", {
        academic_year: academicYear,
        academic_term: academicTerm || undefined,
        course,
        student_group: studentGroup || undefined,
        assessment_group: assessmentGroup,
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
        title="Subject wise Assessment Report"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="subject-assessment-report" columns={columns} rows={visibleRows} />
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
            <Label>Academic Term</Label>
            <Select value={academicTerm} onValueChange={setAcademicTerm}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {academicTermOptions.map((tm) => (
                  <SelectItem key={tm} value={tm}>{tm}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.course_name || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Class Arm</Label>
            <Select value={studentGroup} onValueChange={setStudentGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select class arm" />
              </SelectTrigger>
              <SelectContent>
                {studentGroupOptions.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.student_group_name || g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Assessment Group <span className="text-destructive">*</span>
            </Label>
            <Select value={assessmentGroup} onValueChange={setAssessmentGroup}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select assessment group" />
              </SelectTrigger>
              <SelectContent>
                {assessmentGroupOptions.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.assessment_group_name || g.name}</SelectItem>
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
            emptyMessage="No assessment results found for these filters"
          />
        </div>
      )}
    </>
  );
}

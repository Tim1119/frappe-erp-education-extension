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
  getBatchStudentGroups,
  getAssessmentGroups,
} from "@/services/assessmentReportsService";
import { getErrorMessage } from "@/utils/errors";
import { t } from "@/config/translations";

// Real report ("Final Assessment Grades", Script Report, ref_doctype:
// Assessment Result). Roles: Instructor + Education Manager -- teacher-
// visible. Real filters (final_assessment_grades.js), all 3 required:
// academic_year, student_group (real get_query: group_based_on == 'Batch'
// AND scoped to the selected academic_year -- only Batch-based Class Arms
// are valid here), assessment_group. Reuses Course wise Assessment
// Report's own get_formatted_result() server-side. One row per student,
// pivoted across Subjects (grade_<course>/score_<course> dynamic column
// pairs). add_total_row: 0.
export default function FinalAssessmentGradesPage() {
  const [academicYear, setAcademicYear] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  const [assessmentGroup, setAssessmentGroup] = useState("");

  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
  }, []);

  // Real Desk behavior: this dropdown is scoped to Batch-based Class Arms
  // for the selected Academic Year -- refetch (and clear the current
  // selection) whenever the year changes.
  useEffect(() => {
    setStudentGroup("");
    if (!academicYear) {
      setStudentGroupOptions([]);
      return;
    }
    getBatchStudentGroups(academicYear)
      .then((r) => setStudentGroupOptions(r || []))
      .catch(() => setStudentGroupOptions([]));
  }, [academicYear]);

  async function load() {
    if (!academicYear || !studentGroup || !assessmentGroup) {
      toast.error("Academic Year, Class Arm, and Assessment Group are required.");
      return;
    }
    try {
      setLoading(true);
      const r = await getReportData("Final Assessment Grades", {
        academic_year: academicYear,
        student_group: studentGroup,
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
        title="Final Assessment Grades"
        description={hasRun ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Select filters and run the report"}
      >
        <ReportToolbar filenameBase="final-assessment-grades" columns={columns} rows={visibleRows} />
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
              Class Arm <span className="text-destructive">*</span>
            </Label>
            <Select value={studentGroup} onValueChange={setStudentGroup} disabled={!academicYear}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={academicYear ? "Select class arm" : "Select an academic year first"} />
              </SelectTrigger>
              <SelectContent>
                {studentGroupOptions.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.student_group_name || g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {academicYear && studentGroupOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No Batch-based Class Arms found for this Academic Year.
              </p>
            )}
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
            emptyMessage="No assessment grades found for these filters"
          />
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getRecalculationPreview,
  recalculateTermResults,
  getAssessmentGroups,
  getAcademicYears,
  getAcademicTerms,
  getStudentGroups,
} from "@/services/education/termResultRecalculationService";
import { getErrorMessage } from "@/utils/errors";

// Real doctype: "Term Result Recalculation" (education_extension app) --
// a normal, persisted, listable doctype (no issingle/is_submittable),
// real fields exactly academic_year/academic_term/assessment_group/
// student_group (all reqd) plus two real, read_only tracking fields
// (recalculation_status, recalculation_log). Real permissions: "System
// Manager" only -- same as Bulk School Term Result Generator, so this
// stays admin-only / off TEACHER_NAV.
//
// Real mechanism: the doctype's own batch_recalculate_term_results()
// (a whitelisted INSTANCE method) finds every real School Term Result
// matching these 4 filters and re-runs attendance/score/position/grade
// computation on each EXISTING record in place -- it never touches
// comments, psychomotor, or affective rating fields, so those survive
// untouched. Unlike Bulk School Term Result Generator's own
// generate_class_results(), this real loop wraps each record in its own
// try/except with a per-record rollback + continue, so one student's
// failure doesn't abort the whole run -- confirmed by reading the real
// code, not assumed just because the two tools rhyme.
//
// Real autoname quirk: the tracking record's docname is
// {academic_year}-{academic_term} only (no assessment_group/
// student_group in it), so there's at most one real tracking record per
// Year+Term -- the backend loads-and-updates an existing one rather than
// always creating fresh, matching that real constraint.
export default function TermResultRecalculationPage() {
  const [assessmentGroup, setAssessmentGroup] = useState(""); // real fieldname: assessment_group
  const [academicYear, setAcademicYear] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [studentGroup, setStudentGroup] = useState(""); // real fieldname: student_group

  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);

  const [previewing, setPreviewing] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [result, setResult] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null); // { count } | null

  useEffect(() => {
    getAssessmentGroups().then((r) => setAssessmentGroupOptions(r || [])).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions(r || [])).catch(() => {});
    getStudentGroups().then((r) => setStudentGroupOptions(r || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!academicYear) {
      setAcademicTermOptions([]);
      return;
    }
    getAcademicTerms(academicYear).then((r) => setAcademicTermOptions(r || [])).catch(() => {});
  }, [academicYear]);

  function fieldsValid() {
    return Boolean(assessmentGroup && academicYear && academicTerm && studentGroup);
  }

  const selectedGroupLabel = studentGroupOptions.find((g) => g.name === studentGroup)?.student_group_name || studentGroup;
  const selectedAssessmentLabel = assessmentGroupOptions.find((g) => g.name === assessmentGroup)?.assessment_group_name || assessmentGroup;

  async function handlePreviewClick() {
    if (!fieldsValid()) {
      toast.error("Assessment Group, Class Arm, Academic Year and Academic Term are all required.");
      return;
    }
    setPreviewing(true);
    setResult(null);
    try {
      const preview = await getRecalculationPreview(academicYear, academicTerm, assessmentGroup, studentGroup);
      setPreviewInfo(preview);
      if (!preview.count) {
        toast.error("No School Term Results found for these filters.");
        return;
      }
      setConfirmOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPreviewing(false);
    }
  }

  async function runRecalculate() {
    setConfirmOpen(false);
    setRecalculating(true);
    try {
      const r = await recalculateTermResults(academicYear, academicTerm, assessmentGroup, studentGroup);
      setResult(r);
      toast.success(r.recalculation_status || "Recalculation finished.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRecalculating(false);
    }
  }

  const resultFailed = result && /fail|error/i.test(result.recalculation_log || "");

  return (
    <>
      <PageHeader
        title="Term Result Recalculation"
        description="Recalculate existing School Term Results for a Class Arm. This refreshes attendance (including holiday-aware school days), scores, positions, and grades from the latest data. Comments, psychomotor skills, and affective skills are preserved."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recalculate For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Assessment Group <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={assessmentGroup}
                  onChange={setAssessmentGroup}
                  options={assessmentGroupOptions}
                  displayField="assessment_group_name"
                  placeholder="Search assessment group..."
                  label="assessment group"
                  showId
                />
              </div>

              <div className="space-y-2">
                <Label>Class Arm <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={studentGroup}
                  onChange={setStudentGroup}
                  options={studentGroupOptions}
                  displayField="student_group_name"
                  placeholder="Search class arm..."
                  label="class arm"
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Select value={academicYear} onValueChange={(v) => { setAcademicYear(v); setAcademicTerm(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y.name} value={y.name}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Academic Term <span className="text-destructive">*</span></Label>
                <Select value={academicTerm} onValueChange={setAcademicTerm} disabled={!academicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder={academicYear ? "Select academic term" : "Select an academic year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.title || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Only Draft or Submitted School Term Results matching these exact filters are recalculated. Records
              for other Class Arms, Assessment Groups, or periods are never touched.
            </p>

            <div className="mt-4">
              <Button type="button" onClick={handlePreviewClick} disabled={previewing || recalculating}>
                {previewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalculate Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {recalculating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Recalculating term results. Please wait...</p>
            </CardContent>
          </Card>
        )}

        {result && !recalculating && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: resultFailed ? "var(--warning-soft)" : "var(--success-soft)",
                  color: resultFailed ? "var(--warning-ink)" : "var(--success-ink)",
                }}
              >
                {resultFailed ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {result.recalculation_status}
              </div>

              {result.recalculation_log && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Log</p>
                  <pre className="max-h-80 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap">
                    {result.recalculation_log}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={runRecalculate}
        title="Recalculate term results?"
        description={
          previewInfo
            ? `This will recalculate ${previewInfo.count} School Term Result${previewInfo.count === 1 ? "" : "s"} for ${selectedGroupLabel} / ${selectedAssessmentLabel}. Attendance, scores, positions, and grades will be refreshed. Comments and psychomotor/affective ratings will NOT be affected. Continue?`
            : ""
        }
        confirmLabel="Recalculate"
        variant="destructive"
      />
    </>
  );
}

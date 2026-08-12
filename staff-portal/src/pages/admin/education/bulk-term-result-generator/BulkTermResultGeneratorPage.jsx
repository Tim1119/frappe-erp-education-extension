import { useEffect, useState } from "react";
import { Loader2, FileStack, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  checkExistingResults,
  generateClassResults,
  getAssessmentGroups,
  getAcademicYears,
  getAcademicTerms,
  getStudentGroups,
} from "@/services/bulkTermResultGeneratorService";
import { getErrorMessage } from "@/utils/errors";

// Real doctype: "Bulk School Term Class Result Generator"
// (education_extension app) -- re-confirmed fresh for this build: no
// issingle, no is_submittable (a normal, persisted, listable doctype),
// real fields exactly assessment_group/academic_year/academic_term/
// student_group ("Class Arm")/date_of_result_issue, no child table. Its
// own .py is still a bare `pass` and its own .js is still genuinely
// empty (0 lines) -- there is no real Desk button to mirror, so this
// page's shape is designed from the real fields + the real
// generate_class_results() function alone, same as before.
//
// Real mechanism: generating creates one real "Bulk School Term Class
// Result Generator" record (the real prerequisite generate_class_results
// (docname) requires), then creates one real "School Term Result" per
// student in the selected Class Arm -- subjects, attendance, positions,
// and overall grade are computed entirely by that doctype's own real
// before_insert() hook.
//
// Real atomicity gap: generate_class_results() commits after EACH
// student's insert inside its own loop, with no per-student error
// handling. One student's failure (most commonly "No Assessment Results
// found for student X") kills the loop -- everyone before stays
// permanently created, everyone after is silently skipped, and the real
// function reports none of this back on a partial abort. The results
// below are a genuine after-the-fact reconciliation, not a
// reimplementation of the real loop.
//
// Real duplicate-generation gap: School Term Result's autoname is
// series-based, so nothing in the real app stops re-running generation
// for the same Class Arm/period from creating a second result per
// student. check_existing_results() (no real equivalent in the actual
// app) runs before generating so this is an active confirmation, not
// just a passive warning line.
export default function BulkTermResultGeneratorPage() {
  const [assessmentGroup, setAssessmentGroup] = useState(""); // real fieldname: assessment_group
  const [academicYear, setAcademicYear] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [studentGroup, setStudentGroup] = useState(""); // real fieldname: student_group
  const [dateOfResultIssue, setDateOfResultIssue] = useState(new Date().toISOString().slice(0, 10));

  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);

  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [existingInfo, setExistingInfo] = useState(null); // { total, existing_count } | null

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
    return Boolean(assessmentGroup && academicYear && academicTerm && studentGroup && dateOfResultIssue);
  }

  async function handleGenerateClick() {
    if (!fieldsValid()) {
      toast.error("Assessment Group, Academic Year, Academic Term, Class Arm and Date of Result Issue are all required.");
      return;
    }
    setChecking(true);
    setResult(null);
    try {
      const check = await checkExistingResults(assessmentGroup, academicYear, academicTerm, studentGroup);
      if (check.existing_count > 0) {
        setExistingInfo(check);
        setConfirmOpen(true);
      } else {
        await runGenerate();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  async function runGenerate() {
    setConfirmOpen(false);
    setGenerating(true);
    try {
      const r = await generateClassResults(assessmentGroup, academicYear, academicTerm, studentGroup, dateOfResultIssue);
      setResult(r);
      if (r.error) {
        toast.error(`Generation stopped partway: ${r.count} of ${r.total} student result(s) created before the error below.`);
      } else if (r.total === 0) {
        toast.error("No students found in this Class Arm.");
      } else {
        toast.success(`${r.count} of ${r.total} student result(s) generated.`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Bulk School Term Result Generator"
        description="Generate a School Term Result for every student in a Class Arm at once, for the selected Assessment Group and Academic Year/Term."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate For</CardTitle>
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

              <div className="space-y-2">
                <Label>Date of Result Issue <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={dateOfResultIssue}
                  onChange={(e) => setDateOfResultIssue(e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Generating creates one School Term Result per student currently in the selected Class Arm. If a
              student already has one for this Assessment Group/Academic Year/Term, you'll be asked to confirm
              before continuing — the underlying system has no duplicate guard of its own, so confirming creates an
              additional result rather than replacing the existing one.
            </p>

            <div className="mt-4">
              <Button type="button" onClick={handleGenerateClick} disabled={checking || generating}>
                {(checking || generating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <FileStack className="mr-2 h-4 w-4" />
                Generate Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: result.error ? "var(--warning-soft)" : "var(--success-soft)",
                  color: result.error ? "var(--warning-ink)" : "var(--success-ink)",
                }}
              >
                {result.error ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {result.count} of {result.total} student result{result.total === 1 ? "" : "s"} generated for this Class Arm.
              </div>

              {result.error && (
                <div
                  className="rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--warning)", color: "var(--warning-ink)" }}
                >
                  Generation stopped before reaching every student: {result.error}
                </div>
              )}

              {result.created.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Generated ({result.created.length})</p>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-1.5 text-left font-medium">Student</th>
                          <th className="px-3 py-1.5 text-left font-medium">School Term Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.created.map((c) => (
                          <tr key={c.school_term_result} className="border-b last:border-0">
                            <td className="px-3 py-1.5">{c.student_name || c.student}</td>
                            <td className="px-3 py-1.5 font-mono text-xs">{c.school_term_result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.missing.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Not generated ({result.missing.length})
                  </p>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-1.5 text-left font-medium">Student</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.missing.map((m) => (
                          <tr key={m.student} className="border-b last:border-0">
                            <td className="px-3 py-1.5">{m.student_name || m.student}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Usually means the student has no Assessment Result yet for this Assessment Group — or generation
                    stopped early on an earlier student (see the message above) before reaching them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={runGenerate}
        title="Results already exist for this Class Arm"
        description={
          existingInfo
            ? `${existingInfo.existing_count} of ${existingInfo.total} students in this Class Arm already have a School Term Result for this Assessment Group/Academic Year/Term. Continuing will create an ADDITIONAL result for each of them, not replace the existing one — the underlying system has no duplicate guard. Continue anyway?`
            : ""
        }
        confirmLabel="Generate Anyway"
        variant="destructive"
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Printer, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getSchoolTermResult, deleteSchoolTermResult, printSchoolTermResult,
} from "@/services/schoolTermResultService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value }) {
  const display = value === undefined || value === null || value === "" ? "—" : value;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{display}</p>
    </div>
  );
}

// Rough, deliberately imprecise sanity check -- weekday count between the
// term's own start/end dates, no Holiday List consulted (this app has no
// school-calendar doctype to consult anyway). Not meant to be an exact
// "expected attendance days" figure, just enough to catch the case where
// attendance was marked for a real stretch of the term and then simply
// stopped being logged for the rest of it -- which the Present+Absent+
// Leave total alone can't reveal, since it only ever counts days that
// were ACTUALLY marked, and would look "complete" at whatever percentage
// happens to fall out of that shrunken denominator.
function weekdaysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  let count = 0;
  const d = new Date(s);
  while (d <= e) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// No Connections card here -- confirmed both directions: School Term
// Result's own real JSON has "links": [] and no other doctype anywhere
// in either app ships a _dashboard.py referencing "School Term Result"
// as a target (see school_term_result_api.py's module docstring).
export default function SchoolTermResultProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    getSchoolTermResult(name)
      .then(setResult)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteSchoolTermResult(name);
      toast.success("School Term Result deleted");
      setDeleteModalOpen(false);
      navigate("/dashboard/school-term-result-generator");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handlePrint() {
    setPrinting(true);
    try {
      await printSchoolTermResult(name, result.program);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPrinting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!result) {
    return <p className="text-muted-foreground">School Term Result not found.</p>;
  }

  // Pivot "assessment_components" (Assessment Score -- naturally one row
  // per Subject x Criteria pair) into one row per Subject with one column
  // per criteria actually present in THIS result's data. Same
  // dynamic-column approach the real Course wise Assessment Report script
  // report already uses (course_wise_assessment_report.py's get_data()/
  // get_column(): walk every detail row, collect each not-yet-seen
  // criteria into an ordered list as the column set) -- reused here
  // rather than reinvented. Criteria are collected in first-seen order,
  // not alphabetized or assumed fixed, and a subject missing a given
  // criteria just leaves that cell blank instead of assuming every
  // subject shares the same set (two subjects in the same result CAN
  // have different criteria, e.g. one CA1/CA2/Exam, another
  // CA1/CA2/CA3/Exam).
  const criteriaColumns = [];
  const seenCriteria = new Set();
  for (const c of result.assessment_components || []) {
    if (c.criteria && !seenCriteria.has(c.criteria)) {
      seenCriteria.add(c.criteria);
      criteriaColumns.push(c.criteria);
    }
  }
  const componentsBySubject = {};
  for (const c of result.assessment_components || []) {
    if (!c.subject) continue;
    if (!componentsBySubject[c.subject]) componentsBySubject[c.subject] = {};
    componentsBySubject[c.subject][c.criteria] = c;
  }

  const termWeekdays = weekdaysBetween(result.term_start_date, result.term_end_date);
  const markedDays = result.number_of_times_school_opened || 0;
  const coveragePct = termWeekdays ? Math.round((markedDays / termWeekdays) * 100) : null;
  const coverageLow = coveragePct !== null && coveragePct < 80;

  return (
    <>
      <PageHeader
        title={result.student_admission_id || result.student}
        description={`${result.assessment_group || ""} · ${result.academic_year || ""}`}
      >
        <Button variant="outline" onClick={handlePrint} disabled={printing}>
          {printing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
          Print / Download
        </Button>
        <Button variant="outline" onClick={() => navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(name)}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={result.student} />
              <Field label="Student Name" value={result.student_name} />
              <Field label="Student Admission ID" value={result.student_admission_id} />
              <Field label="Gender" value={result.gender} />
              <Field label="Class" value={result.program} />
              <Field label="Class Arm" value={result.student_group} />
              <Field label="Assessment Group" value={result.assessment_group} />
              <Field label="Academic Year" value={result.academic_year} />
              <Field label="Academic Term" value={result.academic_term} />
              <Field label="Term Start Date" value={fmtDate(result.term_start_date)} />
              <Field label="Term End Date" value={fmtDate(result.term_end_date)} />
              <Field label="Date of Result Issue" value={fmtDate(result.date_of_result_issue)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Students in Class Arm" value={result.number_of_students_in_class_group} />
              <Field label="Students in Class" value={result.number_of_students_in_class} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance Information</CardTitle>
          </CardHeader>
          <CardContent>
            {termWeekdays > 0 && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${coverageLow ? "" : "bg-muted text-muted-foreground"}`}
                style={coverageLow ? { backgroundColor: "var(--warning-soft)", color: "var(--warning-ink)" } : undefined}
              >
                {coverageLow && <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span>
                  Attendance recorded for {markedDays} of ~{termWeekdays} weekdays this term ({coveragePct}%)
                  {coverageLow && " — this term's attendance record may be incomplete, not just low-attendance."}
                </span>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Times School Opened" value={result.number_of_times_school_opened} />
              <Field label="Times Present" value={result.number_of_times_present} />
              <Field label="Times Absent" value={result.number_of_times_absent} />
              <Field label="Times on Leave" value={result.number_of_times_on_leave} />
              <Field label="Attendance %" value={result.attendance_percentage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Highest</TableHead>
                    <TableHead>Lowest</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Prev. Term 1</TableHead>
                    <TableHead>Prev. Term 2</TableHead>
                    <TableHead>Session Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(result.subjects || []).map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.subject}</TableCell>
                      <TableCell>{s.total_score ?? "—"}</TableCell>
                      <TableCell>{s.subject_position || "—"}</TableCell>
                      <TableCell>{s.grade || "—"}</TableCell>
                      <TableCell>{s.class_highest_score ?? "—"}</TableCell>
                      <TableCell>{s.class_lowest_score ?? "—"}</TableCell>
                      <TableCell>{s.class_average_score ?? "—"}</TableCell>
                      <TableCell>{s.previous_total1 ?? "—"}</TableCell>
                      <TableCell>{s.previous_total2 ?? "—"}</TableCell>
                      <TableCell>{s.session_average ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!result.subjects || result.subjects.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">No subjects.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Result Components Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    {criteriaColumns.map((crit) => (
                      <TableHead key={crit}>{crit}</TableHead>
                    ))}
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(result.subjects || []).map((s, i) => {
                    const cells = componentsBySubject[s.subject] || {};
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{s.subject}</TableCell>
                        {criteriaColumns.map((crit) => {
                          const cell = cells[crit];
                          return (
                            <TableCell key={crit}>
                              {cell ? `${cell.score_obtained ?? 0} / ${cell.max_score ?? 0}` : "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell>{s.total_score ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!result.subjects || result.subjects.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={criteriaColumns.length + 2} className="text-center text-muted-foreground">No components.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Total Marks Obtained" value={result.total_marks_obtained} />
              <Field label="Total Max Marks" value={result.total_max_marks} />
              <Field label="Term Average" value={result.term_average} />
              <Field label="Overall Grade" value={result.overall_grade} />
              <Field label="Class Position" value={result.class_position} />
              <Field label="Class Arm Position" value={result.class_arm_position} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Comments / Notes" value={result.comments__notes} />
              <Field label="Class Teacher Comment" value={result.class_teacher_comment} />
              <Field label="Head Teacher Comment" value={result.head_teacher_comment} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Psychomotor Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Handwriting" value={result.handwriting} />
              <Field label="Games" value={result.games} />
              <Field label="Handling Tools" value={result.handling_tools} />
              <Field label="Musical Skills" value={result.musical_skills} />
              <Field label="Verbal Fluency" value={result.verbal_fluency} />
              <Field label="Sport" value={result.sport} />
              <Field label="Drawing and Painting" value={result.drawing_and_painting} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Affective Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Punctuality" value={result.punctuality} />
              <Field label="Politeness" value={result.politeness} />
              <Field label="Cooperation with Others" value={result.cooperation_with_others} />
              <Field label="Helping Others" value={result.helping_others} />
              <Field label="Health" value={result.health} />
              <Field label="Attitude to School Work" value={result.attitude_to_school_work} />
              <Field label="Speaking / Handwriting" value={result.speaking__handwriting} />
              <Field label="Neatness" value={result.neatness} />
              <Field label="Honesty" value={result.honesty} />
              <Field label="Leadership" value={result.leadership} />
              <Field label="Emotional Stability" value={result.emotional_stability} />
              <Field label="Attentiveness" value={result.attentiveness} />
              <Field label="Perseverance" value={result.perseverance} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* amended_from is a real field on this doctype but is vestigial --
          School Term Result is NOT is_submittable, so the amend workflow
          it would normally support never applies here; print_hide:1 in
          the real JSON too, so Desk itself never shows it either. */}

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete this School Term Result?"
        description="This action cannot be undone."
      />
    </>
  );
}

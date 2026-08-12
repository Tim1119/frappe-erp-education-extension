import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Printer, Loader2, AlertTriangle, Info, Calendar } from "lucide-react";
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
} from "@/services/education/schoolTermResultService";
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

  // Pivot assessment_components into one row per Subject with one column per criteria
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

  // Holiday-aware attendance data
  const hasHolidayList = Boolean(result.holiday_list_used);
  const totalWorkdays = result.total_workdays || 0;
  const weekdayHolidaysCount = result.weekday_holidays_count || 0;
  const schoolDaysOpened = result.number_of_times_school_opened || 0;
  const holidayDetails = result.weekday_holiday_details || "";
  const holidayLines = holidayDetails ? holidayDetails.split("\n").filter(Boolean) : [];

  // Attendance coverage check
  const markedDays = (result.number_of_times_present || 0) + (result.number_of_times_absent || 0) + (result.number_of_times_on_leave || 0);
  const coveragePct = schoolDaysOpened ? Math.round((markedDays / schoolDaysOpened) * 100) : null;
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

        {/* ── Attendance Information ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Warning: no holiday list configured */}
            {!hasHolidayList && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No Holiday List was found for this term period. "Times School Opened" is using
                  the fallback method (Present + Absent + Leave). To get accurate school-day counts,
                  create a Holiday List in Desk that covers {fmtDate(result.term_start_date)} – {fmtDate(result.term_end_date)}.
                </span>
              </div>
            )}

            {/* Term Calendar Summary */}
            {hasHolidayList && (
              <div className="rounded-md border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Term Calendar — Holiday List: {result.holiday_list_used}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Weekdays (Mon-Fri)</p>
                    <p className="text-lg font-semibold">{totalWorkdays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Holidays on Workdays</p>
                    <p className="text-lg font-semibold">{weekdayHolidaysCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">School Days Opened</p>
                    <p className="text-lg font-semibold">
                      {schoolDaysOpened}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({totalWorkdays} − {weekdayHolidaysCount})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Holiday list */}
                {holidayLines.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Holidays during this term</p>
                    <div className="flex flex-wrap gap-2">
                      {holidayLines.map((line, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {holidayLines.length === 0 && weekdayHolidaysCount === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No public holidays fell on weekdays during this term.
                  </p>
                )}
              </div>
            )}

            {/* Coverage warning */}
            {coverageLow && (
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Attendance recorded for {markedDays} of {schoolDaysOpened} school days ({coveragePct}%)
                  — this term's attendance record may be incomplete.
                </span>
              </div>
            )}

            {/* Student attendance numbers */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Times School Opened" value={schoolDaysOpened} />
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
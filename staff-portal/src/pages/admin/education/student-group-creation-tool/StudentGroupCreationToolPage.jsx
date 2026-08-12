import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Users, Plus, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import SearchableSelect from "@/components/shared/SearchableSelect";
import PageHeader from "@/components/shared/PageHeader";
import {
  getCandidateGroups,
  createStudentGroups,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentBatchNames,
  getProgramCourses,
} from "@/services/education/studentGroupCreationToolService";
import { getErrorMessage } from "@/utils/errors";

// Real Frappe "Tool" doctype (issingle: 1, hide_toolbar: 1, confirmed
// from the real student_group_creation_tool.json). Real client script
// calls frm.disable_save() -- same never-persisted Single pattern as
// Subject Scheduling Tool / Student Attendance Tool / Assessment Result
// Tool. Genuinely different mechanism from all three though: this is a
// TWO-STEP flow, not a single bulk-action button --
//   1. "Get Courses" (real Document.get_courses()) generates a candidate
//      list of groups from the selected Class + Academic Year/Term: one
//      per real Student Batch Name ("Batch"-based) and one per the
//      Class's own Program Course rows ("Subject"-based, or the product
//      of Subject x Batch if "Separate course based Group for every
//      Batch" is checked) -- each pre-filled with a suggested,
//      slash-joined Student Group Name.
//   2. The candidates land in an editable table (the real "courses"
//      child table) the user can review, edit, add to, or remove rows
//      from before running "Create Student Groups" (real
//      Document.create_student_groups()), which creates one real Class
//      Arm per remaining row.
//
// Group Based On only ever has two real values here (confirmed from
// Student Group Creation Tool Course's own JSON: options "\nBatch\nCourse")
// -- no "Activity" option, unlike Class Arm's own form.
const GROUP_BASED_ON = ["Batch", "Course"];
const GROUP_BASED_ON_LABELS = { Batch: "Batch", Course: "Subject" };

// Student Group Creation Tool Course's own course_code field is Read Only
// (fetch_from: "course.course_name") -- a pure auto-derived duplicate of
// the Subject's own name already shown via the Subject picker's label
// below, so it isn't rendered as a separate column here.

const EMPTY_FORM = {
  program: "",
  academic_year: "",
  academic_term: "",
  separate_groups: 0,
};

function emptyRow() {
  return {
    group_based_on: "Batch",
    course: "",
    batch: "",
    student_group_name: "",
    max_strength: "",
  };
}

export default function StudentGroupCreationToolPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [rows, setRows] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    getPrograms().then((r) => setProgramOptions(r || [])).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions(r || [])).catch(() => {});
    getStudentBatchNames().then((r) => setBatchOptions(r || [])).catch(() => {});
  }, []);

  // Mirrors the real client script's onload set_query on academic_term:
  // filters: { academic_year: frm.doc.academic_year }.
  useEffect(() => {
    if (!form.academic_year) {
      setAcademicTermOptions([]);
      return;
    }
    getAcademicTerms(form.academic_year).then((r) => setAcademicTermOptions(r || [])).catch(() => {});
  }, [form.academic_year]);

  // Scopes the Subject picker used for manually-added/edited rows to the
  // selected Class's own real Program Course rows -- the same source the
  // real get_courses() itself reads, not a generic all-Courses list.
  useEffect(() => {
    if (!form.program) {
      setCourseOptions([]);
      return;
    }
    // SearchableSelect matches/returns options by their real `name` field --
    // the raw Program Course rows come back shaped { course, course_name },
    // so map `course` (the real Course docname) into `name` here.
    getProgramCourses(form.program)
      .then((r) => setCourseOptions((r || []).map((c) => ({ name: c.course, course_name: c.course_name }))))
      .catch(() => {});
  }, [form.program]);

  function upd(k, v) {
    if (k === "academic_year") {
      // Academic Term is scoped to Academic Year (real client-script
      // set_query) -- clear it so a stale, no-longer-matching Term can
      // never stay silently selected under a different Year.
      setForm((p) => ({ ...p, academic_year: v, academic_term: "" }));
      return;
    }
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addRow() {
    setRows((p) => [...p, emptyRow()]);
  }

  function removeRow(index) {
    setRows((p) => p.filter((_, i) => i !== index));
  }

  function updateRow(index, field, value) {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setRows(next);
  }

  async function handleGetCourses() {
    if (!form.program || !form.academic_year) {
      toast.error("Select a Class and Academic Year first.");
      return;
    }
    setLoadingCandidates(true);
    setRows([]);
    try {
      const candidates = await getCandidateGroups(
        form.program, form.academic_year, form.academic_term, form.separate_groups,
      );
      setRows((candidates || []).map((c) => ({
        group_based_on: c.group_based_on || "Batch",
        course: c.course || "",
        batch: c.batch || "",
        student_group_name: c.student_group_name || "",
        max_strength: "",
      })));
      if (!candidates || candidates.length === 0) {
        toast.error("No candidate groups found for this Class/Academic Year — add a Subject to this Class or add a Student Batch Name first.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingCandidates(false);
    }
  }

  // Friendly client-side mirror of the real per-row checks inside
  // create_student_groups() -- every row must have a Student Group Name,
  // and Subject/Batch depending on that row's Group Based On. Real
  // server-side frappe.throw() messages reference the row's idx; we
  // surface the same conditions here to save a round trip, not to
  // replace that real validation.
  const rowErrors = rows.map((row) => {
    if (!row.student_group_name) return "Student Group Name is required.";
    if (row.group_based_on === "Course" && !row.course) return "Subject is required.";
    if (row.group_based_on === "Batch" && !row.batch) return "Batch is required.";
    return null;
  });
  const hasRowErrors = rowErrors.some(Boolean);

  async function handleCreate() {
    if (rows.length === 0) {
      toast.error("No Student Groups to create — use Get Candidate Groups or add a row.");
      return;
    }
    if (hasRowErrors) {
      toast.error("Fix the highlighted rows before creating groups.");
      return;
    }

    setSubmitting(true);
    try {
      const r = await createStudentGroups({
        program: form.program,
        academic_year: form.academic_year,
        academic_term: form.academic_term,
        courses: rows.map((row) => ({
          group_based_on: row.group_based_on,
          course: row.group_based_on === "Course" ? row.course : "",
          batch: row.group_based_on === "Batch" ? row.batch : "",
          student_group_name: row.student_group_name,
          max_strength: row.max_strength === "" ? null : Number(row.max_strength),
        })),
      });
      setResult(r);
      toast.success(`${r.count} Class Arm${r.count === 1 ? "" : "s"} created.`);
      // Keep Class/Academic Year/Term/Separate Groups selected -- creating
      // another batch (e.g. Batch-based groups right after Subject-based
      // ones for the same Class/period) is the most likely next action.
      // The just-created rows CANNOT be resubmitted as-is though: Class
      // Arm's own docname is exactly its Student Group Name
      // (autoname: field:student_group_name), so resubmitting the same
      // rows would immediately fail with a duplicate-name error -- clear
      // them rather than leave a staged table that looks actionable but
      // isn't.
      setRows([]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Student Group Creation Tool"
        description="Bulk-generate Class Arms for a Class and Academic Year/Term from its Subjects and Student Batches."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Class &amp; Academic Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Class <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  value={form.program}
                  onChange={(v) => upd("program", v)}
                  options={programOptions}
                  displayField="name"
                  placeholder="Search class..."
                  label="class"
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Select value={form.academic_year} onValueChange={(v) => upd("academic_year", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y.name} value={y.name}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Academic Term</Label>
                <Select
                  value={form.academic_term}
                  onValueChange={(v) => upd("academic_term", v)}
                  disabled={!form.academic_year}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.academic_year ? "Select academic term (optional)" : "Select an academic year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.title || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Leave blank if you make student groups per year.</p>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.separate_groups === 1}
                onChange={(e) => upd("separate_groups", e.target.checked ? 1 : 0)}
              />
              Separate Subject-based Group for every Batch
            </label>
            <p className="ml-6 text-xs text-muted-foreground">
              Leave unchecked if you don't want to consider batch while making subject-based groups.
            </p>

            <div className="mt-4">
              <Button type="button" variant="outline" onClick={handleGetCourses} disabled={loadingCandidates}>
                {loadingCandidates && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Candidate Groups
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Groups to Create</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Group Based On</TableHead>
                  <TableHead>Subject / Batch</TableHead>
                  <TableHead>Student Group Name</TableHead>
                  <TableHead className="w-28">Max Strength</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={row.group_based_on}
                        onValueChange={(v) => updateRow(index, "group_based_on", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GROUP_BASED_ON.map((x) => (
                            <SelectItem key={x} value={x}>{GROUP_BASED_ON_LABELS[x]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {row.group_based_on === "Course" ? (
                        <SearchableSelect
                          value={row.course}
                          onChange={(v) => updateRow(index, "course", v)}
                          options={courseOptions}
                          displayField="course_name"
                          placeholder={form.program ? "Search subject..." : "Select a class first"}
                          label="subject"
                          disabled={!form.program}
                        />
                      ) : (
                        <Select
                          value={row.batch}
                          onValueChange={(v) => updateRow(index, "batch", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batchOptions.map((b) => (
                              <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.student_group_name}
                        onChange={(e) => updateRow(index, "student_group_name", e.target.value)}
                        className={!row.student_group_name ? "border-destructive" : ""}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={row.max_strength}
                        onChange={(e) => updateRow(index, "max_strength", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Click "Get Candidate Groups" to generate candidate groups, or add a row manually.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="button" onClick={handleCreate} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Users className="mr-2 h-4 w-4" />
            Create Student Groups
          </Button>
        </div>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4" style={{ color: "var(--success)" }} />
              {result.count} Class Arm{result.count === 1 ? "" : "s"} created
            </p>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-1.5 text-left font-medium">Class Arm</th>
                    <th className="px-3 py-1.5 text-left font-medium">Group Based On</th>
                    <th className="px-3 py-1.5 text-left font-medium">Subject / Batch</th>
                    <th className="px-3 py-1.5 text-left font-medium">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {result.created.map((c) => (
                    <tr
                      key={c.student_group_name}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                      onClick={() => navigate(`/dashboard/class-arms/${encodeURIComponent(c.student_group_name)}`)}
                    >
                      <td className="px-3 py-1.5 font-medium text-primary">{c.student_group_name}</td>
                      <td className="px-3 py-1.5">{GROUP_BASED_ON_LABELS[c.group_based_on] || c.group_based_on}</td>
                      <td className="px-3 py-1.5">{c.course || c.batch || "—"}</td>
                      <td className="px-3 py-1.5">
                        {c.student_count}
                        {c.group_based_on === "Course" && c.student_count === 0 && (
                          <span
                            className="ml-2 inline-flex items-center gap-1 text-xs"
                            style={{ color: "var(--warning-ink, #b45309)" }}
                            title="No students were auto-assigned to this Subject-based group. Add students manually on the Class Arm profile."
                          >
                            <AlertTriangle className="h-3 w-3" /> none auto-assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

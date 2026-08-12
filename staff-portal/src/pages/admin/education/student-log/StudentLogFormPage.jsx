import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getStudentLog,
  createStudentLog,
  updateStudentLog,
  getStudents,
  getAcademicYears,
  getAcademicTerms,
  getPrograms,
  getStudentBatches,
} from "@/services/education/studentLogService";
import { getErrorMessage } from "@/utils/errors";

const TYPE_OPTIONS = ["General", "Academic", "Medical", "Achievement"];

const EMPTY = {
  student: "",
  type: "",
  date: "",
  academic_year: "",
  academic_term: "",
  program: "",
  student_batch: "",
  log: "",
};

export default function StudentLogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [studentOptions, setStudentOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [studentBatchOptions, setStudentBatchOptions] = useState([]);

  useEffect(() => {
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
    getAcademicYears().then((r) => setAcademicYearOptions((r || []).map((y) => y.name))).catch(() => {});
    getPrograms().then((r) => setProgramOptions((r || []).map((p) => p.name))).catch(() => {});
    getStudentBatches().then((r) => setStudentBatchOptions((r || []).map((b) => b.name))).catch(() => {});
  }, []);

  useEffect(() => {
    getAcademicTerms(form.academic_year || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [form.academic_year]);

  useEffect(() => {
    if (!name) return;
    getStudentLog(name)
      .then((d) => {
        setForm({
          student: d.student || "",
          type: d.type || "",
          date: d.date || "",
          academic_year: d.academic_year || "",
          academic_term: d.academic_term || "",
          program: d.program || "",
          student_batch: d.student_batch || "",
          log: d.log || "",
        });
        setStudentName(d.student_name || "");
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateStudentLog(name, form);
        toast.success("Student log updated");
        navigate(`/dashboard/student-log/${encodeURIComponent(name)}`);
      } else {
        const result = await createStudentLog(form);
        toast.success("Student log created");
        navigate(`/dashboard/student-log/${encodeURIComponent(result.name)}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? "Edit Student Log" : "New Student Log"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Log Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Student <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  value={form.student}
                  onChange={(v) => upd("student", v)}
                  options={studentOptions}
                  displayField="student_name"
                  placeholder="Search student..."
                  label="student"
                />
                {isEdit && studentName && (
                  <p className="text-xs text-muted-foreground">Student Name: {studentName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => upd("type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => upd("date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={form.academic_year} onValueChange={(v) => upd("academic_year", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
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
                <Select value={form.academic_term} onValueChange={(v) => upd("academic_term", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic term" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={form.program} onValueChange={(v) => upd("program", v)}>
                  <SelectTrigger>
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
                <Label>Student Batch</Label>
                <Select value={form.student_batch} onValueChange={(v) => upd("student_batch", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentBatchOptions.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Log</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.log}
                onChange={(e) => upd("log", e.target.value)}
                placeholder="Write the log entry..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/student-log")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Student Log" : "Create Student Log"}
          </Button>
        </div>
      </form>
    </>
  );
}

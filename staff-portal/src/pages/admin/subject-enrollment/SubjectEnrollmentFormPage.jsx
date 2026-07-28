import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getSubjectEnrollment,
  createSubjectEnrollment,
  updateSubjectEnrollment,
  getStudents,
  getCourses,
  getProgramEnrollments,
} from "@/services/subjectEnrollmentService";
import { getErrorMessage } from "@/utils/errors";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  student: "",
  course: "",
  program_enrollment: "",
  enrollment_date: todayStr(),
};

function LockedField({ label }) {
  return (
    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
      {label || "—"}
    </div>
  );
}

export default function SubjectEnrollmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [studentOptions, setStudentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [programEnrollmentOptions, setProgramEnrollmentOptions] = useState([]);

  useEffect(() => {
    if (isEdit) return;
    getStudents().then((r) => setStudentOptions(r || [])).catch(() => {});
    getCourses().then((r) => setCourseOptions(r || [])).catch(() => {});
    getProgramEnrollments().then((r) => setProgramEnrollmentOptions(r || [])).catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (!name) return;
    getSubjectEnrollment(name)
      .then((d) => {
        setEnrollment(d);
        setForm({
          student: d.student || "",
          course: d.course || "",
          program_enrollment: d.program_enrollment || "",
          enrollment_date: d.enrollment_date || todayStr(),
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.student || !form.course || !form.program_enrollment || !form.enrollment_date) {
      toast.error("Student, Subject, Class Enrollment, and Enrollment Date are required.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateSubjectEnrollment(name, form);
        toast.success("Subject enrollment updated");
        navigate(`/dashboard/subject-enrollment/${encodeURIComponent(name)}`);
      } else {
        const result = await createSubjectEnrollment(form);
        toast.success("Subject enrollment created");
        navigate(`/dashboard/subject-enrollment/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Subject Enrollment" : "New Subject Enrollment"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subject Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Student <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <LockedField label={enrollment?.student_name || enrollment?.student} />
                ) : (
                  <SearchableSelect
                    value={form.student}
                    onChange={(v) => upd("student", v)}
                    options={studentOptions}
                    displayField="student_name"
                    placeholder="Search student..."
                    label="student"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Subject <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <LockedField label={enrollment?.course} />
                ) : (
                  <SearchableSelect
                    value={form.course}
                    onChange={(v) => upd("course", v)}
                    options={courseOptions}
                    displayField="course_name"
                    placeholder="Search subject..."
                    label="subject"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Class Enrollment <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <LockedField label={enrollment?.program_enrollment} />
                ) : (
                  <SearchableSelect
                    value={form.program_enrollment}
                    onChange={(v) => upd("program_enrollment", v)}
                    options={programEnrollmentOptions}
                    displayField="student_name"
                    placeholder="Search class enrollment..."
                    label="class enrollment"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Enrollment Date <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <LockedField label={enrollment?.enrollment_date} />
                ) : (
                  <Input
                    type="date"
                    required
                    value={form.enrollment_date}
                    onChange={(e) => upd("enrollment_date", e.target.value)}
                  />
                )}
              </div>
            </div>

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Every field on this record is locked after creation and cannot be changed.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/subject-enrollment")}
          >
            Cancel
          </Button>
          {!isEdit && (
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Subject Enrollment
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

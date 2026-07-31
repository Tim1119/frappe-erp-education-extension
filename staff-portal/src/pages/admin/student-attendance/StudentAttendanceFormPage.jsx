import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import StudentAttendanceForm from "./components/StudentAttendanceForm.jsx";
import {
  getStudentAttendance,
  createStudentAttendance,
  updateStudentAttendance,
} from "@/services/studentAttendanceService";
import { getErrorMessage } from "@/utils/errors";

export default function StudentAttendanceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getStudentAttendance(name)
      .then((d) => {
        // Cancelled records are fully locked (no allow_on_submit field
        // helps you there) -- unlike Submitted, there's nothing left to
        // edit, so send the user back to the profile page.
        if (d.docstatus === 2) {
          toast.error("A cancelled attendance record can't be edited.");
          navigate(`/dashboard/student-attendance/${encodeURIComponent(name)}`, { replace: true });
          return;
        }
        setRecord(d);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name, navigate]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateStudentAttendance(name, values);
        toast.success("Student attendance updated");
        navigate(`/dashboard/student-attendance/${encodeURIComponent(name)}`);
      } else {
        const result = await createStudentAttendance(values);
        toast.success("Student attendance created");
        navigate(`/dashboard/student-attendance/${encodeURIComponent(result.name)}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
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
      <PageHeader title={isEdit ? "Edit Student Attendance" : "New Student Attendance"} />
      <StudentAttendanceForm record={record} onSave={save} />
    </>
  );
}

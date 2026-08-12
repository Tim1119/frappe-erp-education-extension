import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import StudentLeaveApplicationForm from "./components/StudentLeaveApplicationForm.jsx";
import {
  getStudentLeaveApplication,
  createStudentLeaveApplication,
  updateStudentLeaveApplication,
} from "@/services/education/studentLeaveApplicationService";
import { getErrorMessage } from "@/utils/errors";

export default function StudentLeaveApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getStudentLeaveApplication(name)
      .then((d) => {
        // No field on this doctype is allow_on_submit -- once submitted,
        // every field is locked server-side (and submitting has already
        // created/updated real Student Attendance records for the whole
        // range). Redirect back to the profile page instead of showing a
        // form nothing can change.
        if (d.docstatus === 1) {
          toast.error("A submitted leave application can't be edited. Cancel it first.");
          navigate(`/dashboard/student-leave-application/${encodeURIComponent(name)}`, { replace: true });
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
        await updateStudentLeaveApplication(name, values);
        toast.success("Student leave application updated");
        navigate(`/dashboard/student-leave-application/${encodeURIComponent(name)}`);
      } else {
        const result = await createStudentLeaveApplication(values);
        toast.success("Student leave application created");
        navigate(`/dashboard/student-leave-application/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Student Leave Application" : "New Student Leave Application"} />
      <StudentLeaveApplicationForm record={record} onSave={save} />
    </>
  );
}

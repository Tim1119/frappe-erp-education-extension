import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import ClassEnrollmentForm from "./components/ClassEnrollmentForm.jsx";
import {
  getClassEnrollment,
  createClassEnrollment,
  updateClassEnrollment,
} from "@/services/classEnrollmentService";
import { getErrorMessage } from "@/utils/errors";

export default function ClassEnrollmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [classEnrollment, setClassEnrollment] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getClassEnrollment(name)
      .then(setClassEnrollment)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateClassEnrollment(name, values);
        toast.success("Class enrollment updated");
        navigate(`/dashboard/class-enrollment/${encodeURIComponent(name)}`);
      } else {
        const result = await createClassEnrollment(values);
        toast.success("Class enrollment created");
        navigate(`/dashboard/class-enrollment/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Class Enrollment" : "New Class Enrollment"} />
      <ClassEnrollmentForm classEnrollment={classEnrollment} onSave={save} />
    </>
  );
}

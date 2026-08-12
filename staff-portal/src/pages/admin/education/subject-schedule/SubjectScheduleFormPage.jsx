import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SubjectScheduleForm from "./components/SubjectScheduleForm.jsx";
import {
  getSubjectSchedule,
  createSubjectSchedule,
  updateSubjectSchedule,
} from "@/services/education/subjectScheduleService";
import { getErrorMessage } from "@/utils/errors";

export default function SubjectScheduleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getSubjectSchedule(name)
      .then(setSchedule)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateSubjectSchedule(name, values);
        toast.success("Subject schedule updated");
        navigate(`/dashboard/subject-schedule/${encodeURIComponent(name)}`);
      } else {
        const result = await createSubjectSchedule(values);
        toast.success("Subject schedule created");
        navigate(`/dashboard/subject-schedule/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Subject Schedule" : "New Subject Schedule"} />
      <SubjectScheduleForm schedule={schedule} onSave={save} />
    </>
  );
}

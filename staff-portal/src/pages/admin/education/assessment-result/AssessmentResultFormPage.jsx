import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import AssessmentResultForm from "./components/AssessmentResultForm.jsx";
import {
  getAssessmentResult,
  createAssessmentResult,
  updateAssessmentResult,
} from "@/services/assessmentResultService";
import { getErrorMessage } from "@/utils/errors";

export default function AssessmentResultFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getAssessmentResult(name)
      .then((d) => {
        // Assessment Result has no allow_on_submit fields at all -- once
        // submitted, every field is locked server-side. Redirect back to
        // the profile page instead of showing a form nothing can change.
        if (d.docstatus === 1) {
          toast.error("A submitted assessment result can't be edited. Cancel it first.");
          navigate(`/dashboard/assessment-result/${encodeURIComponent(name)}`, { replace: true });
          return;
        }
        setResult(d);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name, navigate]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateAssessmentResult(name, values);
        toast.success("Assessment result updated");
        navigate(`/dashboard/assessment-result/${encodeURIComponent(name)}`);
      } else {
        const result = await createAssessmentResult(values);
        toast.success("Assessment result created");
        navigate(`/dashboard/assessment-result/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Assessment Result" : "New Assessment Result"} />
      <AssessmentResultForm result={result} onSave={save} />
    </>
  );
}

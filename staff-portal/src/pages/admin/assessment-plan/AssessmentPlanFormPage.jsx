import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import AssessmentPlanForm from "./components/AssessmentPlanForm.jsx";
import {
  getAssessmentPlan,
  createAssessmentPlan,
  updateAssessmentPlan,
} from "@/services/assessmentPlanService";
import { getErrorMessage } from "@/utils/errors";

export default function AssessmentPlanFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getAssessmentPlan(name)
      .then((d) => {
        // Assessment Plan has no allow_on_submit fields at all -- once
        // submitted, every field is locked server-side. Rather than show a
        // form where nothing can actually be changed, redirect straight
        // back to the profile page (matches why the Edit button itself is
        // hidden there for submitted records too).
        if (d.docstatus === 1) {
          toast.error("A submitted assessment plan can't be edited. Cancel it first.");
          navigate(`/dashboard/assessment-plan/${encodeURIComponent(name)}`, { replace: true });
          return;
        }
        setPlan(d);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name, navigate]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateAssessmentPlan(name, values);
        toast.success("Assessment plan updated");
        navigate(`/dashboard/assessment-plan/${encodeURIComponent(name)}`);
      } else {
        const result = await createAssessmentPlan(values);
        toast.success("Assessment plan created");
        navigate(`/dashboard/assessment-plan/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Assessment Plan" : "New Assessment Plan"} />
      <AssessmentPlanForm plan={plan} onSave={save} />
    </>
  );
}

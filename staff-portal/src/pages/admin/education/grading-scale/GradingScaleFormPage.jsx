import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import GradingScaleForm from "./components/GradingScaleForm.jsx";
import {
  getGradingScale,
  createGradingScale,
  updateGradingScale,
} from "@/services/education/gradingScaleService";
import { getErrorMessage } from "@/utils/errors";

export default function GradingScaleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [gradingScale, setGradingScale] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getGradingScale(name)
      .then(setGradingScale)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function save(values) {
    try {
      if (isEdit) {
        await updateGradingScale(name, values);
        toast.success("Grading scale updated");
        navigate(`/dashboard/grading-scale/${encodeURIComponent(name)}`);
      } else {
        const result = await createGradingScale(values);
        toast.success("Grading scale created");
        navigate(`/dashboard/grading-scale/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Grading Scale" : "New Grading Scale"} />
      <GradingScaleForm gradingScale={gradingScale} onSave={save} />
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SchoolTermResultForm from "./components/SchoolTermResultForm";
import {
  getSchoolTermResult, createSchoolTermResult, updateSchoolTermResult,
} from "@/services/schoolTermResultService";
import { getErrorMessage } from "@/utils/errors";

export default function SchoolTermResultFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!name) return;
    getSchoolTermResult(name)
      .then(setResult)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleSave(form) {
    if (isEdit) {
      await updateSchoolTermResult(name, form);
      toast.success("School Term Result updated");
      navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(name)}`);
    } else {
      const created = await createSchoolTermResult(form);
      toast.success("School Term Result created");
      navigate(`/dashboard/school-term-result-generator/${encodeURIComponent(created.name)}`);
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
      <PageHeader title={isEdit ? "Edit School Term Result" : "New School Term Result"} />
      <SchoolTermResultForm result={result} onSave={handleSave} />
    </>
  );
}

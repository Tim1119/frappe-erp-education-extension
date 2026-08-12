import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { createBranch } from "@/services/hr/branchService";
import { getErrorMessage } from "@/utils/errors";
import BranchForm from "./components/BranchForm";

export default function BranchFormPage() {
  const navigate = useNavigate();
  async function save(data) {
    try {
      const result = await createBranch(data);
      toast.success("Branch created");
      navigate(`/dashboard/branches/${encodeURIComponent(result.name)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }
  return <><PageHeader eyebrow="HR" title="Create Branch" /><div className="panel"><BranchForm onSave={save} /></div></>;
}

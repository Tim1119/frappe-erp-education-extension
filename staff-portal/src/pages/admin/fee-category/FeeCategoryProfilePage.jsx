import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeCategoryDetails from "./components/FeeCategoryDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getFeeCategory, deleteFeeCategory } from "@/services/feeCategoryService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function FeeCategoryProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feeCategory, setFeeCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeeCategory() {
      try {
        const data = await getFeeCategory(id);
        console.log("FEE CATEGORY DATA:", data);
        setFeeCategory(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadFeeCategory();
    }
  }, [id]);

  async function handleDelete() {
    try {
      await deleteFeeCategory(id);
      toast.success("Fee category deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/fee-category");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading fee category...</div>;
  }

  if (!feeCategory) {
    return <div className="muted">Fee category not found</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={feeCategory.category_name || "Fee Category Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/fee-category/${id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        }
      />

      <div className="panel">
        <FeeCategoryDetails feeCategory={feeCategory} />
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${feeCategory.category_name}?`}
        message="This action cannot be undone. All data associated with this fee category will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
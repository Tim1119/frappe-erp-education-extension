import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeCategoryForm from "./components/FeeCategoryForm.jsx";

import {
  getFeeCategory,
  createFeeCategory,
  updateFeeCategory,
} from "@/services/feeCategoryService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function FeeCategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [feeCategory, setFeeCategory] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadFeeCategory() {
      try {
        const data = await getFeeCategory(id);
        setFeeCategory(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadFeeCategory();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateFeeCategory(id, values);
        toast.success("Fee category updated");
      } else {
        result = await createFeeCategory(values);
        toast.success("Fee category created");
      }

      const name = result?.name || id;
      navigate(`/dashboard/fee-category/${name}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading fee category…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={editing ? "Edit Fee Category" : "Create Fee Category"}
      />

      <div className="panel">
        <FeeCategoryForm feeCategory={feeCategory} onSave={save} />
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeStructureForm from "./components/FeeStructureForm.jsx";

import {
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
} from "@/services/feeStructureService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function FeeStructureFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadFeeStructure() {
      try {
        const data = await getFeeStructure(id);
        setFeeStructure(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadFeeStructure();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateFeeStructure(id, values);
        toast.success("Fee structure updated");
      } else {
        result = await createFeeStructure(values);
        toast.success("Fee structure created");
      }

      const name = result?.name || id;
      navigate(`/dashboard/fee-structure/${name}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading fee structure…</div>;
  }

  // Check if document is submitted or cancelled - show read-only view
  const isReadOnly = feeStructure && (feeStructure.docstatus === 1 || feeStructure.docstatus === 2);

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={editing ? "Edit Fee Structure" : "Create Fee Structure"}
        sub={isReadOnly ? "This document is read-only" : undefined}
      />

      <div className="panel">
        <FeeStructureForm 
          feeStructure={feeStructure} 
          onSave={save}
        />
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeScheduleForm from "./components/FeeScheduleForm.jsx";

import {
  getFeeSchedule,
  createFeeSchedule,
  updateFeeSchedule,
  submitFeeSchedule,
  cancelFeeSchedule,
  generateFees,
} from "@/services/education/feeScheduleService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function FeeScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [feeSchedule, setFeeSchedule] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadFeeSchedule() {
      try {
        const data = await getFeeSchedule(id);
        setFeeSchedule(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadFeeSchedule();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateFeeSchedule(id, values);
        toast.success("Fee schedule updated");
      } else {
        result = await createFeeSchedule(values);
        toast.success("Fee schedule created");
      }

      const name = result?.name || id;
      navigate(`/dashboard/fee-schedule/${name}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function submit(values) {
    try {
      await submitFeeSchedule(id);
      toast.success("Fee schedule submitted");
      navigate(`/dashboard/fee-schedule/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function cancel(values) {
    try {
      await cancelFeeSchedule(id);
      toast.success("Fee schedule cancelled");
      navigate(`/dashboard/fee-schedule/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function generate(values) {
    try {
      await generateFees(id);
      toast.success("Fees generation started");
      navigate(`/dashboard/fee-schedule/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading fee schedule…</div>;
  }

  const isReadOnly = feeSchedule && (feeSchedule.docstatus === 1 || feeSchedule.docstatus === 2);

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={editing ? "Edit Fee Schedule" : "Create Fee Schedule"}
        sub={isReadOnly ? "This document is read-only" : undefined}
      />

      <div className="panel">
        <FeeScheduleForm 
          feeSchedule={feeSchedule} 
          onSave={save}
          onSubmit={submit}
          onCancel={cancel}
          onGenerate={generate}
        />
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeScheduleDetails from "./components/FeeScheduleDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import {
  getFeeSchedule,
  deleteFeeSchedule,
  submitFeeSchedule,
  cancelFeeSchedule,
  generateFees,
} from "@/services/feeScheduleService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function FeeScheduleProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feeSchedule, setFeeSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadFeeSchedule() {
      try {
        const data = await getFeeSchedule(id);
        console.log("FEE SCHEDULE DATA:", data);
        setFeeSchedule(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadFeeSchedule();
    }
  }, [id]);

  async function handleSubmit() {
    setActionLoading(true);
    try {
      await submitFeeSchedule(id);
      toast.success("Fee schedule submitted successfully");
      setSubmitModalOpen(false);
      const data = await getFeeSchedule(id);
      setFeeSchedule(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      await cancelFeeSchedule(id);
      toast.success("Fee schedule cancelled");
      setCancelModalOpen(false);
      const data = await getFeeSchedule(id);
      setFeeSchedule(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGenerate() {
    setActionLoading(true);
    try {
      await generateFees(id);
      toast.success("Fees generation started");
      setGenerateModalOpen(false);
      const data = await getFeeSchedule(id);
      setFeeSchedule(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await deleteFeeSchedule(id);
      toast.success("Fee schedule deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/fee-schedule");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading fee schedule...</div>;
  }

  if (!feeSchedule) {
    return <div className="muted">Fee schedule not found</div>;
  }

  const isDraft = feeSchedule.docstatus === 0;
  const isSubmitted = feeSchedule.docstatus === 1;
  const isCancelled = feeSchedule.docstatus === 2;
  const isPending = feeSchedule.status === "Invoice Pending" || feeSchedule.status === "Order Pending";
  const canGenerate = isSubmitted && isPending;

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={feeSchedule.name || "Fee Schedule"}
        button={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isDraft && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/dashboard/fee-schedule/${id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setSubmitModalOpen(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </>
            )}
            {isSubmitted && (
              <>
                <button
                  className="btn btn-danger"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Cancelling..." : "Cancel"}
                </button>
                {canGenerate && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setGenerateModalOpen(true)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Generating..." : "Generate Fees"}
                  </button>
                )}
              </>
            )}
            {(isDraft || isCancelled) && (
              <button
                className="btn btn-danger"
                onClick={() => setDeleteModalOpen(true)}
                disabled={actionLoading}
              >
                Delete
              </button>
            )}
          </div>
        }
      />

      <div className="panel">
        <FeeScheduleDetails feeSchedule={feeSchedule} />
      </div>

      {/* Submit Modal */}
      <ConfirmModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title="Submit Fee Schedule?"
        message="This will submit the fee schedule. Once submitted, it can only be cancelled."
        confirmLabel="Submit"
        variant="primary"
        busy={actionLoading}
      />

      {/* Cancel Modal */}
      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Fee Schedule?"
        message="This action will cancel the fee schedule. This cannot be undone."
        confirmLabel="Cancel"
        variant="destructive"
        busy={actionLoading}
      />

      {/* Generate Fees Modal */}
      <ConfirmModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onConfirm={handleGenerate}
        title="Generate Fees?"
        message="This will generate fees for all students in the selected groups. Are you sure you want to continue?"
        confirmLabel="Generate"
        variant="primary"
        busy={actionLoading}
      />

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${feeSchedule.name}?`}
        message="This action cannot be undone. All data associated with this fee schedule will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        busy={actionLoading}
      />
    </>
  );
}
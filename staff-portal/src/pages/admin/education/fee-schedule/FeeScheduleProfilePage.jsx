import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link2 } from "lucide-react";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeScheduleDetails from "./components/FeeScheduleDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import {
  getFeeSchedule,
  deleteFeeSchedule,
  submitFeeSchedule,
  cancelFeeSchedule,
  generateFees,
  getConnections,
} from "@/services/education/feeScheduleService.js";
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
  const [connections, setConnections] = useState(null);

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

  useEffect(() => {
    if (!id) return;
    getConnections(id)
      .then(setConnections)
      .catch(() => setConnections({}));
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

      // The generation response can arrive just before Frappe's transaction
      // and background status update are visible to the next request.
      // Refresh briefly until the schedule reaches a terminal state.
      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        const data = await getFeeSchedule(id);
        setFeeSchedule(data);

        if (["Invoice Created", "Order Created", "Failed"].includes(data.status)) {
          const updatedConnections = await getConnections(id).catch(() => null);
          if (updatedConnections) setConnections(updatedConnections);
          break;
        }
      }
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

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link2 size={15} style={{ color: "var(--ink-4)" }} />
            Connections
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2" style={{ padding: "14px 20px 20px" }}>
          <button
            type="button"
            className="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
            onClick={() => navigate(`/dashboard/sales-invoices?fee_schedule=${encodeURIComponent(id)}`)}
          >
            <span className="font-medium text-primary">Sales Invoices</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {connections?.sales_invoices ?? "…"}
            </span>
          </button>
          <button
            type="button"
            className="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
            onClick={() => navigate(`/dashboard/sales-orders?fee_schedule=${encodeURIComponent(id)}`)}
          >
            <span className="font-medium text-primary">Sales Orders</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {connections?.sales_orders ?? "…"}
            </span>
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      <ConfirmModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title="Submit Fee Schedule?"
        message="This will submit the fee schedule. Once submitted, it can only be cancelled."
        confirmLabel="Submit"
        variant="default"
        busy={actionLoading}
      />

      {/* Cancel Modal */}
      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Fee Schedule?"
        message="This action will cancel the fee schedule. This cannot be undone."
        confirmLabel="Cancel Schedule"
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
        variant="default"
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

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import { PageHeader } from "@/components/shared/OriginalPrimitives";
// import FeeStructureDetails from "./components/FeeStructureDetails.jsx";
// import ConfirmModal from "@/components/shared/ConfirmDialog";

// import { getFeeStructure, deleteFeeStructure } from "@/services/education/feeStructureService.js";
// import { getErrorMessage } from "@/utils/errors.js";

// export default function FeeStructureProfilePage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [feeStructure, setFeeStructure] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);

//   useEffect(() => {
//     async function loadFeeStructure() {
//       try {
//         const data = await getFeeStructure(id);
//         console.log("FEE STRUCTURE DATA:", data);
//         setFeeStructure(data);
//       } catch (err) {
//         console.error(err);
//         toast.error(getErrorMessage(err));
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (id) {
//       loadFeeStructure();
//     }
//   }, [id]);

//   async function handleDelete() {
//     try {
//       await deleteFeeStructure(id);
//       toast.success("Fee structure deleted successfully");
//       setDeleteModalOpen(false);
//       navigate("/dashboard/fee-structure");
//     } catch (err) {
//       toast.error(getErrorMessage(err));
//     }
//   }

//   if (loading) {
//     return <div className="muted">Loading fee structure...</div>;
//   }

//   if (!feeStructure) {
//     return <div className="muted">Fee structure not found</div>;
//   }

//   const isDraft = feeStructure.docstatus === 0;
//   const isSubmitted = feeStructure.docstatus === 1;
//   const isCancelled = feeStructure.docstatus === 2;

//   return (
//     <>
//       <PageHeader
//         eyebrow="Fees"
//         title={`${feeStructure.program || "Fee Structure"} - ${feeStructure.academic_year || ""}`}
//         button={
//           <div style={{ display: "flex", gap: 10 }}>
//             {isDraft && (
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => navigate(`/dashboard/fee-structure/${id}/edit`)}
//               >
//                 Edit
//               </button>
//             )}
//             {(isDraft || isCancelled) && (
//               <button
//                 className="btn btn-danger"
//                 onClick={() => setDeleteModalOpen(true)}
//               >
//                 Delete
//               </button>
//             )}
//           </div>
//         }
//       />

//       <div className="panel">
//         <FeeStructureDetails feeStructure={feeStructure} />
//       </div>

//       <ConfirmModal
//         open={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         onConfirm={handleDelete}
//         title={`Delete ${feeStructure.program} fee structure?`}
//         message="This action cannot be undone. All data associated with this fee structure will be permanently removed."
//         confirmLabel="Delete"
//         variant="destructive"
//       />
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, CheckCircle2, Ban, Link2 } from "lucide-react";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeStructureDetails from "./components/FeeStructureDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import {
  getFeeStructure,
  deleteFeeStructure,
  submitFeeStructure,
  cancelFeeStructure,
  getConnections,
} from "@/services/education/feeStructureService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function FeeStructureProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [connections, setConnections] = useState(null);

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

  useEffect(() => {
    if (id) {
      loadFeeStructure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getConnections(id)
      .then(setConnections)
      .catch(() => setConnections({}));
  }, [id]);

  async function handleDelete() {
    try {
      await deleteFeeStructure(id);
      toast.success("Fee structure deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/fee-structure");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitFeeStructure(id);
      toast.success("Fee structure submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      loadFeeStructure();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelFeeStructure(id);
      toast.success("Fee structure cancelled");
      setCancelModalOpen(false);
      setLoading(true);
      loadFeeStructure();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // Navigate to fee schedules filtered by this fee structure
  function viewFeeSchedules() {
    navigate(`/dashboard/fee-schedule?fee_structure=${id}`);
  }

  if (loading) {
    return <div className="muted">Loading fee structure...</div>;
  }

  if (!feeStructure) {
    return <div className="muted">Fee structure not found</div>;
  }

  const isDraft = feeStructure.docstatus === 0;
  const isSubmitted = feeStructure.docstatus === 1;
  const isCancelled = feeStructure.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={`${feeStructure.program || "Fee Structure"} - ${feeStructure.academic_year || ""}`}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            {/* View Fee Schedules Button */}
            <button
              className="btn btn-secondary"
              onClick={viewFeeSchedules}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Calendar size={15} />
              View Fee Schedules
            </button>
            {isDraft && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/dashboard/fee-structure/${id}/edit`)}
              >
                Edit
              </button>
            )}
            {isDraft && (
              <button
                className="btn btn-primary"
                onClick={() => setSubmitModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <CheckCircle2 size={15} />
                Submit
              </button>
            )}
            {isSubmitted && (
              <button
                className="btn btn-secondary"
                onClick={() => setCancelModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Ban size={15} />
                Cancel
              </button>
            )}
            {(isDraft || isCancelled) && (
              <button
                className="btn btn-danger"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </button>
            )}
          </div>
        }
      />

      <div className="panel">
        <FeeStructureDetails feeStructure={feeStructure} />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link2 size={15} style={{ color: "var(--ink-4)" }} />
            Connections
          </div>
        </div>
        <div style={{ padding: "14px 20px 20px" }}>
          <button
            type="button"
            className="flex w-full max-w-sm items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
            onClick={viewFeeSchedules}
          >
            <span className="font-medium text-primary">Fee Schedules</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {connections?.fee_schedules ?? "…"}
            </span>
          </button>
        </div>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${feeStructure.program} fee structure?`}
        message="This action cannot be undone. All data associated with this fee structure will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />

      <ConfirmModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit ${feeStructure.program} fee structure?`}
        message="Once submitted, this fee structure can no longer be edited directly."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel ${feeStructure.program} fee structure?`}
        message="This marks the fee structure as cancelled."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

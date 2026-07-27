// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import { PageHeader } from "@/components/shared/OriginalPrimitives";
// import FeeStructureDetails from "./components/FeeStructureDetails.jsx";
// import ConfirmModal from "@/components/shared/ConfirmDialog";

// import { getFeeStructure, deleteFeeStructure } from "@/services/feeStructureService.js";
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
//         variant="danger"
//       />
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Eye } from "lucide-react";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import FeeStructureDetails from "./components/FeeStructureDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getFeeStructure, deleteFeeStructure } from "@/services/feeStructureService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function FeeStructureProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeeStructure() {
      try {
        const data = await getFeeStructure(id);
        console.log("FEE STRUCTURE DATA:", data);
        setFeeStructure(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadFeeStructure();
    }
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

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${feeStructure.program} fee structure?`}
        message="This action cannot be undone. All data associated with this fee structure will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
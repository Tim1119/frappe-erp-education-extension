import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import GuardianDetails from "./components/GuardianDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getGuardian, deleteGuardian } from "@/services/education/guardianService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function GuardianProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guardian, setGuardian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadGuardian() {
      try {
        const data = await getGuardian(id);
        console.log("GUARDIAN DATA:", data);
        setGuardian(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadGuardian();
    }
  }, [id]);

  async function handleDelete() {
    try {
      await deleteGuardian(id);
      toast.success("Guardian deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/guardians");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading guardian...</div>;
  }

  if (!guardian) {
    return <div className="muted">Guardian not found</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title={guardian.guardian_name || "Guardian Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/guardians/${id}/edit`)}
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
        <GuardianDetails guardian={guardian} />
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${guardian.guardian_name}?`}
        message="This action cannot be undone. All data associated with this guardian will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
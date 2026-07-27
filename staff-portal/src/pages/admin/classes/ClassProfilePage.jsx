import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ClassDetails from "./components/ClassDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getClass, deleteClass } from "@/services/classService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function ClassProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadClass() {
      try {
        const data = await getClass(id);
        console.log("CLASS DATA:", data);
        setClassData(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadClass();
    }
  }, [id]);

  async function handleDelete() {
    try {
      await deleteClass(id);
      toast.success("Class deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/classes");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading class...</div>;
  }

  if (!classData) {
    return <div className="muted">Class not found</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={classData.program_name || "Class Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/classes/${id}/edit`)}
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
        <ClassDetails classData={classData} />
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${classData.program_name}?`}
        message="This action cannot be undone. All data associated with this class will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
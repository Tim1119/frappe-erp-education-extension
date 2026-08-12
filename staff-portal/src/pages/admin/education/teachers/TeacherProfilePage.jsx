import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import TeacherDetails from "./components/TeacherDetails.jsx";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getTeacher, deleteTeacher } from "@/services/teacherService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadTeacher() {
      try {
        const data = await getTeacher(id);
        console.log("TEACHER DATA:", data);
        setTeacher(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTeacher();
    }
  }, [id]);

  async function handleDelete() {
    try {
      await deleteTeacher(id);
      toast.success("Teacher deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/teachers");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading teacher...</div>;
  }

  if (!teacher) {
    return <div className="muted">Teacher not found</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title={teacher.instructor_name || "Teacher Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/teachers/${id}/edit`)}
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
        <TeacherDetails teacher={teacher} />
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${teacher.instructor_name}?`}
        message="This action cannot be undone. All data associated with this teacher will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
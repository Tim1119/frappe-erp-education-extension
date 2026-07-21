import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import TeacherDetails from "./components/TeacherDetails.jsx";

import { getTeacher, deleteTeacher } from "../../services/teacherService.js";
import { getErrorMessage } from "../../utils/errors.js";

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm(`Delete "${teacher?.instructor_name}"?`)) return;
    
    try {
      await deleteTeacher(id);
      toast.success("Teacher deleted");
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
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        }
      />

      <div className="panel">
        <TeacherDetails teacher={teacher} />
      </div>
    </>
  );
}
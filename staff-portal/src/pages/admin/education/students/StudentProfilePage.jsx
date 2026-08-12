import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StudentDetails from "./components/StudentDetails.jsx";

import { getStudent, deleteStudent } from "@/services/education/studentService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        const data = await getStudent(id);
        setStudent(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStudent();
    }
  }, [id]);

  async function handleDelete() {
    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/students");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading student...</div>;
  }

  if (!student) {
    return <div className="muted">Student not found</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={student.student_name || "Student Profile"}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/students/${id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="panel">
        <StudentDetails student={student} />
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${student.student_name}?`}
        description="This action cannot be undone. All data associated with this student will be permanently removed."
        confirmLabel="Delete"
      />
    </>
  );
}

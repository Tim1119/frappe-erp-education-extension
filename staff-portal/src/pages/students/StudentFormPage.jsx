import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import StudentForm from "./components/StudentForm.jsx";

import {
  getStudent,
  createStudent,
  updateStudent,
} from "../../services/studentService.js";

import { getErrorMessage } from "../../utils/errors.js";

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

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

    loadStudent();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateStudent(id, values);
        toast.success("Student updated");
      } else {
        result = await createStudent(values);
        toast.success("Student created");
      }

      const studentName = result?.name || id;
      navigate(`/dashboard/students/${studentName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading student…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Students"
        title={editing ? "Edit Student" : "Create Student"}
      />

      <StudentForm student={student} onSave={save} />
    </>
  );
}

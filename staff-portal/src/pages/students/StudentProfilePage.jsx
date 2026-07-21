import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import StudentDetails from "./components/StudentDetails.jsx";

import { getStudent } from "../../services/studentService.js";
import { getErrorMessage } from "../../utils/errors.js";

export default function StudentProfilePage() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const data = await getStudent(id);

        console.log("STUDENT DATA:", data);

        setStudent(data);
      } catch (err) {
        console.error(err);

        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStudent();
    }
  }, [id]);

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
      />

      <div className="panel">
        <StudentDetails student={student} />
      </div>
    </>
  );
}

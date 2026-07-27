import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import StudentAdmissionForm from "./components/StudentAdmissionForm.jsx";

import {
  getStudentAdmission,
  createStudentAdmission,
  updateStudentAdmission,
} from "@/services/studentAdmissionService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function StudentAdmissionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadAdmission() {
      try {
        const data = await getStudentAdmission(name);
        setAdmission(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadAdmission();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateStudentAdmission(name, values);
        toast.success("Student admission updated");
      } else {
        result = await createStudentAdmission(values);
        toast.success("Student admission created");
      }

      const admissionName = result?.name || id;
      navigate(`/dashboard/student-admissions/${encodeURIComponent(admissionName)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading student admission…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title={editing ? "Edit Student Admission" : "Create Student Admission"}
      />

      <div className="panel">
        <StudentAdmissionForm
          admission={admission}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
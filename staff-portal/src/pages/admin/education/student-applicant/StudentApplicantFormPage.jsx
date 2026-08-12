import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import StudentApplicantForm from "./components/StudentApplicantForm.jsx";

import {
  getStudentApplicant,
  createStudentApplicant,
  updateStudentApplicant,
} from "@/services/education/studentApplicantService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function StudentApplicantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadApplicant() {
      try {
        const data = await getStudentApplicant(name);
        setApplicant(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadApplicant();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateStudentApplicant(name, values);
        toast.success("Student applicant updated");
      } else {
        result = await createStudentApplicant(values);
        toast.success("Student applicant created");
      }

      const applicantName = result?.name || id;
      navigate(`/dashboard/student-applicants/${applicantName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading student applicant…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title={editing ? "Edit Student Applicant" : "Create Student Applicant"}
      />

      <div className="panel">
        <StudentApplicantForm
          applicant={applicant}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
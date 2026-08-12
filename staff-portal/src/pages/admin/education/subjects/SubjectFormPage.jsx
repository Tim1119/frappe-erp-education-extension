import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import SubjectForm from "./components/SubjectForm.jsx";

import {
  getSubject,
  createSubject,
  updateSubject,
} from "@/services/education/subjectService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadSubject() {
      try {
        const data = await getSubject(name);
        setSubject(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateSubject(name, values);
        toast.success("Subject updated");
      } else {
        result = await createSubject(values);
        toast.success("Subject created");
      }

      const subjectName = result?.name || id;
      navigate(`/dashboard/subjects/${encodeURIComponent(subjectName)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading subject…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Subject" : "Create Subject"}
      />

      <div className="panel">
        <SubjectForm
          subject={subject}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
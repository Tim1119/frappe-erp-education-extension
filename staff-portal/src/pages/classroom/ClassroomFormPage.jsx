import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import ClassroomForm from "./components/ClassroomForm.jsx";

import {
  getClassroom,
  createClassroom,
  updateClassroom,
} from "../../services/classroomService.js";

import { getErrorMessage } from "../../utils/errors.js";

export default function ClassroomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadClassroom() {
      try {
        const data = await getClassroom(name);
        setClassroom(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadClassroom();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateClassroom(name, values);
        toast.success("Classroom updated");
      } else {
        result = await createClassroom(values);
        toast.success("Classroom created");
      }

      const classroomName = result?.name || id;
      navigate(`/dashboard/classrooms/${classroomName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading classroom…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title={editing ? "Edit Classroom" : "Create Classroom"}
      />

      <div className="panel">
        <ClassroomForm
          classroom={classroom}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
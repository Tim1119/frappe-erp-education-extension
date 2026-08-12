import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import TeacherForm from "./components/TeacherForm.jsx";

import {
  getTeacher,
  createTeacher,
  updateTeacher,
} from "@/services/teacherService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadTeacher() {
      try {
        const data = await getTeacher(id);
        setTeacher(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadTeacher();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateTeacher(id, values);
        toast.success("Teacher updated");
      } else {
        result = await createTeacher(values);
        toast.success("Teacher created");
      }

      const teacherName = result?.name || id;
      navigate(`/dashboard/teachers/${teacherName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading teacher…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title={editing ? "Edit Teacher" : "Create Teacher"}
      />

      <div className="panel">
        <TeacherForm teacher={teacher} onSave={save} />
      </div>
    </>
  );
}
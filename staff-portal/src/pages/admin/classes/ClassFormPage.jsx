import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ClassForm from "./components/ClassForm.jsx";

import {
  getClass,
  createClass,
  updateClass,
} from "@/services/classService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function ClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadClass() {
      try {
        const data = await getClass(id);
        setClassData(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadClass();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateClass(id, values);
        toast.success("Class updated");
      } else {
        result = await createClass(values);
        toast.success("Class created");
      }

      const name = result?.name || id;
      navigate(`/dashboard/classes/${name}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading class…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Class" : "Create Class"}
      />

      <div className="panel">
        <ClassForm classData={classData} onSave={save} />
      </div>
    </>
  );
}
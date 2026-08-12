import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ClassArmForm from "./components/ClassArmForm.jsx";

import {
  getClassArm,
  createClassArm,
  updateClassArm,
  getStudentGroupOptions,
} from "@/services/education/classArmsService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function ClassArmFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [group, setGroup] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [opts, doc] = await Promise.all([
          getStudentGroupOptions(),
          editing ? getClassArm(name) : Promise.resolve(null),
        ]);
        setOptions(opts);
        setGroup(doc);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      const result = editing
        ? await updateClassArm(name, values)
        : await createClassArm(values);

      toast.success(editing ? "Class arm updated" : "Class arm created");
      navigate(`/dashboard/class-arms/${encodeURIComponent(result.name)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !options) {
    return <div className="muted">Loading…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Class Arm" : "Create Class Arm"}
      />
      <ClassArmForm
        group={group}
        options={options}
        onSave={save}
        saving={saving}
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import GuardianForm from "./components/GuardianForm.jsx";

import {
  getGuardian,
  createGuardian,
  updateGuardian,
} from "../../services/guardianService.js";

import { getErrorMessage } from "../../utils/errors.js";

export default function GuardianFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [guardian, setGuardian] = useState(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadGuardian() {
      try {
        const data = await getGuardian(id);
        setGuardian(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadGuardian();
  }, [id, editing]);

  async function save(values) {
    try {
      let result;

      if (editing) {
        result = await updateGuardian(id, values);
        toast.success("Guardian updated");
      } else {
        result = await createGuardian(values);
        toast.success("Guardian created");
      }

      const guardianName = result?.name || id;
      navigate(`/dashboard/guardians/${guardianName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="muted">Loading guardian…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title={editing ? "Edit Guardian" : "Create Guardian"}
      />

      <div className="panel">
        <GuardianForm guardian={guardian} onSave={save} />
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import QuizForm from "./components/QuizForm.jsx";

import {
  getQuiz,
  createQuiz,
  updateQuiz,
} from "@/services/quizService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function QuizFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadQuiz() {
      try {
        const data = await getQuiz(name);
        setQuiz(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateQuiz(name, values);
        toast.success("Quiz updated");
      } else {
        result = await createQuiz(values);
        toast.success("Quiz created");
      }

      const quizName = result?.name || id;
      navigate(`/dashboard/quizzes/${quizName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading quiz…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Quiz" : "Create Quiz"}
      />

      <div className="panel">
        <QuizForm
          quiz={quiz}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
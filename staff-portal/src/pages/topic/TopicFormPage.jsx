import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import TopicForm from "./component/TopicForm.jsx";

import {
  getTopic,
  createTopic,
  updateTopic,
} from "../../services/topicService.js";

import { getErrorMessage } from "../../utils/errors.js";

export default function TopicFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadTopic() {
      try {
        const data = await getTopic(name);
        setTopic(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateTopic(name, values);
        toast.success("Topic updated");
      } else {
        result = await createTopic(values);
        toast.success("Topic created");
      }

      const topicName = result?.name || id;
      navigate(`/dashboard/topics/${topicName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading topic…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Topic" : "Create Topic"}
      />

      <div className="panel">
        <TopicForm
          topic={topic}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
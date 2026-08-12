import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ArticleForm from "./components/ArticleForm.jsx";

import {
  getArticle,
  createArticle,
  updateArticle,
} from "@/services/education/articleService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function ArticleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadArticle() {
      try {
        const data = await getArticle(name);
        setArticle(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateArticle(name, values);
        toast.success("Article updated");
      } else {
        result = await createArticle(values);
        toast.success("Article created");
      }

      const articleName = result?.name || id;
      navigate(`/dashboard/articles/${articleName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading article…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={editing ? "Edit Article" : "Create Article"}
      />

      <div className="panel">
        <ArticleForm
          article={article}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
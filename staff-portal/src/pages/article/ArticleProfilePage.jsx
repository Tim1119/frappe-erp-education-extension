import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, User, Calendar, FileText, Link2 } from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "../../components/ui/Primitives.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { getArticle, deleteArticle } from "../../services/articleService.js";
import { getErrorMessage } from "../../utils/errors.js";
import { formatDate } from "../../utils/format.js";

function Item({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value || "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function ArticleProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getArticle(name);
        setArticle(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  async function handleDelete() {
    try {
      await deleteArticle(name);
      toast.success("Article deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/articles");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading article...</div>;
  if (!article) return <div className="muted">Article not found</div>;

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={article.title || "Article Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/articles/${encodeURIComponent(name)}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        }
      />

      {/* Header card */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "4px 18px 20px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "var(--brand-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 28, color: "var(--brand)" }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              {article.title}
            </div>
            {article.author && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                By {article.author}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={BookOpen} title="Article Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Article ID" value={article.name} />
          <Item label="Title" value={article.title} />
          <Item label="Author" value={article.author} />
          <Item label="Publish Date" value={article.publish_date ? formatDate(article.publish_date) : "—"} />
        </div>
      </div>

      {/* Content */}
      <div className="panel">
        <SectionHead icon={FileText} title="Content" />
        <div style={{ padding: "4px 18px 20px" }}>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {article.content || "No content available."}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${article.title}?`}
        message="This action cannot be undone. All data associated with this article will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
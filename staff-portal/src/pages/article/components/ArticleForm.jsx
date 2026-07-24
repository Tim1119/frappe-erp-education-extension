import { useState, useEffect } from "react";
import { BookOpen, User, Calendar, FileText } from "lucide-react";

function SectionPanel({ icon: Icon, title, children }) {
  return (
    <div className="panel" style={{ marginBottom: 18, overflow: "visible" }}>
      <div className="panel-head">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
      </div>
      <div style={{ padding: "4px 18px 22px", overflow: "visible" }}>{children}</div>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="label">
      {children}
      {required && (
        <span style={{ color: "var(--danger-ink, #ef4444)", marginLeft: 3 }}>
          *
        </span>
      )}
    </label>
  );
}

export default function ArticleForm({ article, onSave, saving, editing }) {
  const [form, setForm] = useState({
    title: article?.title || "",
    author: article?.author || "",
    content: article?.content || "",
    publish_date: article?.publish_date || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title || "",
        author: article.author || "",
        content: article.content || "",
        publish_date: article.publish_date || "",
      });
    }
  }, [article]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = "Title is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel" style={{ overflow: "visible" }}>
        <SectionPanel icon={BookOpen} title="Article Information">
          <div className="grid-form">
            <div className="field">
              <Label required>Title</Label>
              {editing ? (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--surface-2)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                    minHeight: "38px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 550,
                  }}
                >
                  {form.title || "—"}
                </div>
              ) : (
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter article title"
                />
              )}
              {fieldErrors.title && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.title}
                </div>
              )}
              {editing && (
                <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                  Title cannot be changed after creation.
                </div>
              )}
            </div>

            <div className="field">
              <Label>Author</Label>
              <input
                className="input"
                value={form.author}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="Enter author name"
              />
            </div>

            <div className="field">
              <Label>Publish Date</Label>
              <input
                type="date"
                className="input"
                value={form.publish_date}
                onChange={(e) => updateField("publish_date", e.target.value)}
              />
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Content</Label>
              <textarea
                className="input"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Enter article content"
                rows={10}
                style={{ resize: "vertical", minHeight: "200px" }}
              />
            </div>
          </div>
        </SectionPanel>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingBottom: 8,
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving || loading ? "Saving..." : editing ? "Update Article" : "Create Article"}
        </button>
      </div>
    </form>
  );
}
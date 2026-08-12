import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  BookOpen, 
  FileText, 
  Link2, 
  ExternalLink,
  PlusCircle,
  Video,
  ClipboardList,
  GraduationCap
} from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import Modal from "@/components/shared/Modal";

import { getTopic, deleteTopic, getSubjectsWithoutTopic, addTopicToSubjects } from "@/services/education/topicService.js";
import { getErrorMessage } from "@/utils/errors.js";

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

function ConnectionButton({ icon: Icon, label, path, count }) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        backgroundColor: "var(--surface-2)",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
        textAlign: "left",
        color: "var(--ink)",
        fontSize: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-3)";
        e.currentTarget.style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-2)";
        e.currentTarget.style.borderColor = "hsl(var(--border))";
      }}
    >
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{ 
          fontSize: "10px", 
          color: "var(--ink-3)",
          backgroundColor: "var(--surface)",
          padding: "1px 6px",
          borderRadius: "10px",
          minWidth: "20px",
          textAlign: "center",
        }}>
          {count}
        </span>
      )}
      <ExternalLink size={14} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}

export default function TopicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addToSubjectsModalOpen, setAddToSubjectsModalOpen] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [addingToSubjects, setAddingToSubjects] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTopic(name);
        setTopic(data);
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
      await deleteTopic(name);
      toast.success("Topic deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/topics");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleAddToSubjects() {
    try {
      const result = await getSubjectsWithoutTopic(name);
      setAvailableSubjects(result || []);
      setAddToSubjectsModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleAddSubjectsConfirm() {
    if (!selectedSubjects || selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setAddingToSubjects(true);
    try {
      await addTopicToSubjects(name, selectedSubjects);
      toast.success(`Topic added to ${selectedSubjects.length} subject(s) successfully`);
      setAddToSubjectsModalOpen(false);
      setSelectedSubjects([]);
      const data = await getTopic(name);
      setTopic(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToSubjects(false);
    }
  }

  function toggleSubjectSelection(subject) {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  }

  if (loading) return <div className="muted">Loading topic...</div>;
  if (!topic) return <div className="muted">Topic not found</div>;

  // Parse topic content to show connected content
  const contentItems = topic.topic_content || [];

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={topic.topic_name || "Topic Profile"}
        button={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={handleAddToSubjects}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <PlusCircle size={15} />
              Add to Subjects
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/topics/${encodeURIComponent(name)}/edit`)}
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
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "10px 20px 26px" }}>
          <Avatar
            name={topic.topic_name}
            src={topic.hero_image}
            size={64}
            round
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              {topic.topic_name}
            </div>
            {topic.description && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {topic.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={BookOpen} title="Topic Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Topic ID" value={topic.name} />
          <Item label="Topic Name" value={topic.topic_name} />
          <Item label="Description" value={topic.description} />
        </div>
      </div>

      {/* Topic Content */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead 
          icon={FileText} 
          title="Topic Content" 
          sub={`${contentItems.length} items`}
        />
        {contentItems.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No content"
            sub="Add content from this topic's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Content Type</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {contentItems.map((item, i) => {
                const getIcon = () => {
                  if (item.content_type === "Article") return <FileText size={14} />;
                  if (item.content_type === "Video") return <Video size={14} />;
                  if (item.content_type === "Quiz") return <ClipboardList size={14} />;
                  return <FileText size={14} />;
                };
                
                const getPath = () => {
                  if (item.content_type === "Article") return `/dashboard/articles/${item.content}`;
                  if (item.content_type === "Video") return `/dashboard/videos/${item.content}`;
                  if (item.content_type === "Quiz") return `/dashboard/quizzes/${item.content}`;
                  return "#";
                };

                return (
                  <tr key={i} className="row" style={{ cursor: "pointer" }} onClick={() => navigate(getPath())}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {getIcon()}
                        <span style={{ fontWeight: 550 }}>{item.content_type || "—"}</span>
                      </div>
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {item.content || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Connections */}
      <div className="panel">
        <div className="panel-head">
          <div
            className="panel-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Link2 size={15} style={{ color: "var(--ink-4)" }} />
            Connections
          </div>
        </div>
        <div style={{ padding: "10px 20px 26px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "20px",
          }}>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Subjects
              </div>
              <ConnectionButton
                icon={GraduationCap}
                label="Subjects"
                path={`/dashboard/subjects?topic=${topic.name}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add to Subjects Modal */}
      <Modal
        open={addToSubjectsModalOpen}
        onClose={() => {
          setAddToSubjectsModalOpen(false);
          setSelectedSubjects([]);
        }}
        title={`Add "${topic.topic_name}" to Subjects`}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAddToSubjectsModalOpen(false);
                setSelectedSubjects([]);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddSubjectsConfirm}
              disabled={addingToSubjects || selectedSubjects.length === 0}
            >
              {addingToSubjects ? "Adding..." : `Add to ${selectedSubjects.length} Subject(s)`}
            </button>
          </div>
        }
      >
        <div style={{ padding: "4px 0" }}>
          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            Select subjects to add this topic to:
          </p>
          {availableSubjects.length === 0 ? (
            <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
              This topic is already added to all available subjects.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
              {availableSubjects.map((subject) => (
                <label
                  key={subject}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    backgroundColor: selectedSubjects.includes(subject) ? "var(--brand-soft)" : "var(--surface-2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedSubjects.includes(subject)) {
                      e.currentTarget.style.backgroundColor = "var(--surface-3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedSubjects.includes(subject)) {
                      e.currentTarget.style.backgroundColor = "var(--surface-2)";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubjectSelection(subject)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: selectedSubjects.includes(subject) ? 600 : 400 }}>
                    {subject}
                  </span>
                </label>
              ))}
            </div>
          )}
          {selectedSubjects.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-3)" }}>
              Selected: {selectedSubjects.length} subject(s)
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${topic.topic_name}?`}
        message="This action cannot be undone. All data associated with this topic will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
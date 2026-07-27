import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  BookOpen,
  Award,
  Users,
  Link2,
  ExternalLink,
  PlusCircle
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import Modal from "@/components/shared/Modal";

import { getQuiz, deleteQuiz } from "@/services/quizService.js";
import { getErrorMessage } from "@/utils/errors.js";
import { callMethod } from "@/services/frappeClient.js";

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

function ConnectionButton({ icon: Icon, label, path }) {
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
      <ExternalLink size={14} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}

// Convert seconds to duration string (d/h/m/s)
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "—";
  
  const numSeconds = parseInt(seconds);
  let remaining = numSeconds;
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining -= days * 24 * 60 * 60;
  const hours = Math.floor(remaining / (60 * 60));
  remaining -= hours * 60 * 60;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.length > 0 ? parts.join(' ') : "—";
}

// Get topics without this quiz
async function getTopicsWithoutQuiz(quiz) {
  return callMethod("education.education.doctype.quiz.quiz.get_topics_without_quiz", { quiz });
}

// Add quiz to topics
async function addQuizToTopics(content_type, content, topics) {
  const topicsParam = Array.isArray(topics) ? JSON.stringify(topics) : topics;
  
  return callMethod("education.education.doctype.topic.topic.add_content_to_topics", {
    content_type: content_type,
    content: content,
    topics: topicsParam,
  });
}

export default function QuizProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addToTopicsModalOpen, setAddToTopicsModalOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [addingToTopics, setAddingToTopics] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuiz(name);
        setQuiz(data);
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
      await deleteQuiz(name);
      toast.success("Quiz deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/quizzes");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleAddToTopics() {
    try {
      const result = await getTopicsWithoutQuiz(name);
      setAvailableTopics(result || []);
      setAddToTopicsModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleAddTopicsConfirm() {
    if (!selectedTopics || selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    setAddingToTopics(true);
    try {
      await addQuizToTopics("Quiz", name, selectedTopics);
      toast.success(`Quiz added to ${selectedTopics.length} topic(s) successfully`);
      setAddToTopicsModalOpen(false);
      setSelectedTopics([]);
      const data = await getQuiz(name);
      setQuiz(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToTopics(false);
    }
  }

  function toggleTopicSelection(topic) {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  }

  if (loading) return <div className="muted">Loading quiz...</div>;
  if (!quiz) return <div className="muted">Quiz not found</div>;

  const connectionGroups = [
    {
      group: "Topics",
      items: [
        { 
          label: "Topics", 
          icon: BookOpen, 
          path: `/dashboard/topics?quiz=${quiz.name}` 
        },
      ]
    },
    {
      group: "Student Activity",
      items: [
        { 
          label: "Quiz Activity", 
          icon: Users, 
          path: `/dashboard/quiz-activity?quiz=${quiz.name}`
        },
      ]
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={quiz.title || "Quiz Profile"}
        button={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={handleAddToTopics}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <PlusCircle size={15} />
              Add to Topics
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/quizzes/${encodeURIComponent(name)}/edit`)}
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
            <span style={{ fontSize: 28, color: "var(--brand)" }}>Q</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              {quiz.title}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {quiz.name}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={FileText} title="Quiz Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Quiz ID" value={quiz.name} />
          <Item label="Title" value={quiz.title} />
          <Item label="Passing Score" value={`${quiz.passing_score || 75}%`} />
          <Item label="Max Attempts" value={quiz.max_attempts === 0 ? "Unlimited" : quiz.max_attempts} />
          <Item label="Grading Basis" value={quiz.grading_basis || "Latest Highest Score"} />
          <Item label="Time-Bound" value={quiz.is_time_bound ? "Yes" : "No"} />
          {quiz.is_time_bound && (
            <Item label="Duration" value={formatDuration(quiz.duration)} />
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead 
          icon={BookOpen} 
          title="Questions" 
          sub={`${(quiz.question || []).length} questions`}
        />
        {(quiz.question || []).length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No questions"
            sub="Add questions from this quiz's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Question Link</th>
                <th>Question</th>
              </tr>
            </thead>
            <tbody>
              {quiz.question.map((q, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{q.question_link || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {q.question || "—"}
                  </td>
                </tr>
              ))}
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
            {connectionGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
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
                  {group.group}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {group.items.map((item, itemIndex) => (
                    <ConnectionButton
                      key={itemIndex}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add to Topics Modal */}
      <Modal
        open={addToTopicsModalOpen}
        onClose={() => {
          setAddToTopicsModalOpen(false);
          setSelectedTopics([]);
        }}
        title={`Add "${quiz.title}" to Topics`}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAddToTopicsModalOpen(false);
                setSelectedTopics([]);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddTopicsConfirm}
              disabled={addingToTopics || selectedTopics.length === 0}
            >
              {addingToTopics ? "Adding..." : `Add to ${selectedTopics.length} Topic(s)`}
            </button>
          </div>
        }
      >
        <div style={{ padding: "4px 0" }}>
          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            Select topics to add this quiz to:
          </p>
          {availableTopics.length === 0 ? (
            <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
              This quiz is already added to all available topics.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
              {availableTopics.map((topic) => (
                <label
                  key={topic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    backgroundColor: selectedTopics.includes(topic) ? "var(--brand-soft)" : "var(--surface-2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedTopics.includes(topic)) {
                      e.currentTarget.style.backgroundColor = "var(--surface-3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedTopics.includes(topic)) {
                      e.currentTarget.style.backgroundColor = "var(--surface-2)";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => toggleTopicSelection(topic)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: selectedTopics.includes(topic) ? 600 : 400 }}>
                    {topic}
                  </span>
                </label>
              ))}
            </div>
          )}
          {selectedTopics.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-3)" }}>
              Selected: {selectedTopics.length} topic(s)
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${quiz.title}?`}
        message="This action cannot be undone. All data associated with this quiz will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
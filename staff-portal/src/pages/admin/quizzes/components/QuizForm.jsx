import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  BookOpen,
  X,
  Search,
  PlusCircle,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

import { getQuestions, createQuestion } from "@/services/quizService.js";
import { getErrorMessage } from "@/utils/errors.js";
import Modal from "@/components/shared/Modal";

// Convert seconds to duration string (d/h/m/s)
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "";
  
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
  
  return parts.length > 0 ? parts.join(' ') : "";
}

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
      <div style={{ padding: "10px 20px 26px", overflow: "visible" }}>{children}</div>
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

// Searchable Select Component
function SearchableSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Search...",
  label = "Select",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = options.find(opt => opt.name === value);

  const filtered = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    (opt.question && opt.question.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option.name);
    setIsOpen(false);
    setSearch("");
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selected = options.find(opt => opt.name === value);
    if (selected) {
      return selected.question || selected.name;
    }
    return value;
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearch("");
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          border: "1px solid hsl(var(--border))",
          borderRadius: "6px",
          backgroundColor: "var(--surface)",
          cursor: disabled ? "not-allowed" : "pointer",
          minHeight: "38px",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ 
          color: value ? "var(--ink)" : "var(--ink-3)",
          fontSize: "14px",
        }}>
          {getDisplayValue()}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {value && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          )}
          <span style={{ color: "var(--ink-3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 99999,
            background: "var(--surface)",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            maxHeight: "250px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: "8px 10px", borderBottom: "1px solid hsl(var(--border))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={14} style={{ color: "var(--ink-3)" }} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Find ${label}...`}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "13px",
                  background: "transparent",
                  color: "var(--ink)",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div style={{ overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", color: "var(--ink-3)", textAlign: "center", fontSize: "13px" }}>
                No results found
              </div>
            ) : (
              filtered.map((option) => {
                const isSelected = value === option.name;
                return (
                  <div
                    key={option.name}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "13px",
                      backgroundColor: isSelected ? "var(--brand-soft)" : "transparent",
                      color: isSelected ? "var(--brand)" : "var(--ink)",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "var(--surface-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {option.question || option.name}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// New Question Modal
function NewQuestionModal({ open, onClose, onSave, saving }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { option: "", is_correct: 0 },
    { option: "", is_correct: 0 },
    { option: "", is_correct: 0 },
    { option: "", is_correct: 0 },
  ]);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    const validOptions = options.filter(o => o.option.trim());
    if (validOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }
    if (!validOptions.some(o => o.is_correct)) {
      setError("At least one correct answer is required");
      return;
    }
    
    await onSave({ question, options: validOptions });
    setQuestion("");
    setOptions([
      { option: "", is_correct: 0 },
      { option: "", is_correct: 0 },
      { option: "", is_correct: 0 },
      { option: "", is_correct: 0 },
    ]);
    setError("");
  };

  function updateOption(index, field, value) {
    const updated = [...options];
    updated[index][field] = field === 'is_correct' ? (value ? 1 : 0) : value;
    setOptions(updated);
  }

  function addOption() {
    setOptions([...options, { option: "", is_correct: 0 }]);
  }

  function removeOption(index) {
    if (options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Question" size="lg">
      <div style={{ padding: "4px 0" }}>
        <Label required>Question</Label>
        <textarea
          className="input"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setError("");
          }}
          placeholder="Enter your question"
          rows={3}
          style={{ resize: "vertical" }}
        />
        
        <div style={{ marginTop: 12 }}>
          <Label required>Options</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {options.map((opt, index) => (
              <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  className="input"
                  value={opt.option}
                  onChange={(e) => updateOption(index, "option", e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ flex: 1 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", whiteSpace: "nowrap" }}>
                  <input
                    type="checkbox"
                    checked={opt.is_correct === 1}
                    onChange={(e) => updateOption(index, "is_correct", e.target.checked)}
                  />
                  Correct
                </label>
                <button
                  type="button"
                  className="iconbtn"
                  onClick={() => removeOption(index)}
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addOption}
            style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}
          >
            <Plus size={14} /> Add Option
          </button>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create Question"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function QuizForm({ quiz, onSave, saving, editing }) {
  const [form, setForm] = useState({
    title: quiz?.title || "",
    passing_score: quiz?.passing_score || 75,
    max_attempts: quiz?.max_attempts || 1,
    grading_basis: quiz?.grading_basis || "Latest Highest Score",
    is_time_bound: quiz?.is_time_bound || 0,
    duration: quiz?.duration || "",
    question: quiz?.question || [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [questionOptions, setQuestionOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Load question options
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoadingOptions(true);
        const questions = await getQuestions();
        setQuestionOptions(questions || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingOptions(false);
      }
    }
    loadQuestions();
  }, []);

  useEffect(() => {
    if (quiz) {
      setForm({
        title: quiz.title || "",
        passing_score: quiz.passing_score || 75,
        max_attempts: quiz.max_attempts || 1,
        grading_basis: quiz.grading_basis || "Latest Highest Score",
        is_time_bound: quiz.is_time_bound || 0,
        duration: quiz.duration || "",
        question: quiz.question || [],
      });
    }
  }, [quiz]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateQuestion(index, field, value) {
    const updatedQuestions = [...form.question];
    updatedQuestions[index][field] = value;
    
    if (field === 'question_link' && value) {
      const selectedQuestion = questionOptions.find(q => q.name === value);
      if (selectedQuestion) {
        updatedQuestions[index].question = selectedQuestion.question || selectedQuestion.name;
      }
    }
    
    setForm((prev) => ({ ...prev, question: updatedQuestions }));
  }

  function addQuestion() {
    setForm((prev) => ({
      ...prev,
      question: [...prev.question, { question_link: "", question: "" }],
    }));
  }

  function removeQuestion(index) {
    setForm((prev) => ({
      ...prev,
      question: prev.question.filter((_, i) => i !== index),
    }));
  }

  async function handleCreateQuestion(data) {
    setCreatingQuestion(true);
    try {
      const result = await createQuestion(data);
      setQuestionOptions(prev => [...prev, { name: result.name, question: result.question }]);
      setForm(prev => ({
        ...prev,
        question: [...prev.question, { question_link: result.name, question: result.question }],
      }));
      toast.success(`Question "${result.name}" created and added`);
      setQuestionModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingQuestion(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = "Title is required";
    }
    if (form.passing_score < 0 || form.passing_score > 100) {
      errors.passing_score = "Passing score must be between 0 and 100";
    }
    if (form.max_attempts < 0) {
      errors.max_attempts = "Max attempts cannot be negative";
    }
    if (form.question.length === 0) {
      errors.question = "At least one question is required";
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
    <>
      <NewQuestionModal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSave={handleCreateQuestion}
        saving={creatingQuestion}
      />

      <form onSubmit={handleSubmit}>
        <div className="panel" style={{ overflow: "visible" }}>
          <SectionPanel icon={FileText} title="Quiz Information">
            <div className="grid-form">
              <div className="field">
                <Label required>Title</Label>
                {editing ? (
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "var(--surface-2)",
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border))",
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
                    placeholder="Enter quiz title"
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
                <Label required>Passing Score (%)</Label>
                <input
                  type="number"
                  className="input"
                  value={form.passing_score}
                  onChange={(e) => updateField("passing_score", parseFloat(e.target.value) || 0)}
                  placeholder="75"
                  min="0"
                  max="100"
                />
                {fieldErrors.passing_score && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.passing_score}
                  </div>
                )}
              </div>

              <div className="field">
                <Label required>Max Attempts</Label>
                <input
                  type="number"
                  className="input"
                  value={form.max_attempts}
                  onChange={(e) => updateField("max_attempts", parseInt(e.target.value) || 0)}
                  placeholder="1 (0 = unlimited)"
                  min="0"
                />
                {fieldErrors.max_attempts && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.max_attempts}
                  </div>
                )}
              </div>

              <div className="field">
                <Label>Grading Basis</Label>
                <select
                  className="select"
                  value={form.grading_basis}
                  onChange={(e) => updateField("grading_basis", e.target.value)}
                >
                  <option value="Latest Highest Score">Latest Highest Score</option>
                  <option value="Latest Attempt">Latest Attempt</option>
                </select>
              </div>

              <div className="field">
                <Label>Is Time-Bound</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "6px" }}>
                  <input
                    type="checkbox"
                    checked={form.is_time_bound === 1}
                    onChange={(e) => updateField("is_time_bound", e.target.checked ? 1 : 0)}
                  />
                  <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>
                    {form.is_time_bound ? "Time-bound" : "Not time-bound"}
                  </span>
                </div>
              </div>

              {form.is_time_bound === 1 && (
                <div className="field">
                  <Label>Duration (seconds)</Label>
                  <input
                    type="number"
                    className="input"
                    value={form.duration || ""}
                    onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
                    placeholder="Enter duration in seconds"
                    min="0"
                  />
                  <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                    Enter the duration in seconds (e.g., 300 for 5 minutes, 3600 for 1 hour)
                  </div>
                  {form.duration > 0 && (
                    <div style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>
                      Duration: {formatDuration(form.duration)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Questions Section */}
          <SectionPanel icon={BookOpen} title="Questions">
            <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addQuestion}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} />
                Add Existing Question
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuestionModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <PlusCircle size={15} />
                Create New Question
              </button>
            </div>

            {fieldErrors.question && (
              <div style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "12px", padding: "8px 12px", backgroundColor: "var(--danger-soft)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={16} />
                {fieldErrors.question}
              </div>
            )}

            {form.question.length === 0 ? (
              <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
                No questions added yet. Add existing questions or create new ones.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ minWidth: "200px" }}>Question</th>
                      <th style={{ minWidth: "200px" }}>Question Text</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.question.map((q, index) => (
                      <tr key={index}>
                        <td>
                          <SearchableSelect
                            value={q.question_link}
                            onChange={(val) => updateQuestion(index, "question_link", val)}
                            options={questionOptions}
                            placeholder="Search question..."
                            label="Question"
                            disabled={loadingOptions}
                          />
                        </td>
                        <td>
                          <div
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "var(--surface-2)",
                              borderRadius: "6px",
                              border: "1px solid hsl(var(--border))",
                              color: "var(--ink)",
                              minHeight: "38px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {q.question || "—"}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="iconbtn"
                            onClick={() => removeQuestion(index)}
                            style={{ color: "var(--danger)" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || loading}>
            {saving || loading ? "Saving..." : editing ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>
      </form>
    </>
  );
}
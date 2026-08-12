import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  ClipboardList,
  BookOpen,
  Search,
  ChevronDown,
  PlusCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";

import {
  getDepartments,
  getTopics,
  getGradingScales,
  getAssessmentCriteria,
  createTopic,
  createAssessmentCriteria,
} from "@/services/education/subjectService.js";

import { getErrorMessage } from "@/utils/errors.js";

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
    (opt.topic_name && opt.topic_name.toLowerCase().includes(search.toLowerCase()))
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
      return selected.topic_name || selected.name;
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
            <ChevronDown size={14} />
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
                    {option.topic_name || option.name}
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

// New Topic Modal
function NewTopicModal({ open, onClose, onSave, saving }) {
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!topicName.trim()) {
      setError("Topic name is required");
      return;
    }
    await onSave({ topic_name: topicName.trim(), description: description.trim() });
    setTopicName("");
    setDescription("");
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Topic" size="sm">
      <div style={{ padding: "4px 0" }}>
        <Label required>Topic Name</Label>
        <input
          className="input"
          value={topicName}
          onChange={(e) => {
            setTopicName(e.target.value);
            setError("");
          }}
          placeholder="Enter topic name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        {error && (
          <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <Label>Description</Label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description (optional)"
            rows={2}
            style={{ resize: "vertical" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Topic"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// New Assessment Criteria Modal
function NewAssessmentCriteriaModal({ open, onClose, onSave, saving }) {
  const [criteriaName, setCriteriaName] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!criteriaName.trim()) {
      setError("Assessment criteria name is required");
      return;
    }
    await onSave({ assessment_criteria: criteriaName.trim() });
    setCriteriaName("");
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Assessment Criteria" size="sm">
      <div style={{ padding: "4px 0" }}>
        <Label required>Assessment Criteria Name</Label>
        <input
          className="input"
          value={criteriaName}
          onChange={(e) => {
            setCriteriaName(e.target.value);
            setError("");
          }}
          placeholder="Enter assessment criteria name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        {error && (
          <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
            {error}
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Criteria"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function SubjectForm({ subject, onSave, saving, editing }) {
  const [form, setForm] = useState({
    course_name: subject?.course_name || "",
    department: subject?.department || "",
    description: subject?.description || "",
    default_grading_scale: subject?.default_grading_scale || "",
    hero_image: subject?.hero_image || "",
    topics: subject?.topics || [],
    assessment_criteria: subject?.assessment_criteria || [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [creatingCriteria, setCreatingCriteria] = useState(false);

  // Options state
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [gradingScaleOptions, setGradingScaleOptions] = useState([]);
  const [assessmentCriteriaOptions, setAssessmentCriteriaOptions] = useState([]);

  // Load options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [departments, topics, gradingScales, assessmentCriteria] = await Promise.all([
          getDepartments(),
          getTopics(),
          getGradingScales(),
          getAssessmentCriteria(),
        ]);
        setDepartmentOptions(departments || []);
        setTopicOptions(topics || []);
        setGradingScaleOptions(gradingScales || []);
        setAssessmentCriteriaOptions(assessmentCriteria || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (subject) {
      setForm({
        course_name: subject.course_name || "",
        department: subject.department || "",
        description: subject.description || "",
        default_grading_scale: subject.default_grading_scale || "",
        hero_image: subject.hero_image || "",
        topics: subject.topics || [],
        assessment_criteria: subject.assessment_criteria || [],
      });
    }
  }, [subject]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateTopic(index, field, value) {
    const updatedTopics = [...form.topics];
    updatedTopics[index][field] = value;
    
    if (field === 'topic' && value) {
      const selectedTopic = topicOptions.find(t => t.name === value);
      if (selectedTopic) {
        updatedTopics[index].topic_name = selectedTopic.topic_name || selectedTopic.name;
      }
    }
    
    setForm((prev) => ({ ...prev, topics: updatedTopics }));
  }

  function addTopic() {
    setForm((prev) => ({
      ...prev,
      topics: [...prev.topics, { topic: "", topic_name: "" }],
    }));
  }

  function removeTopic(index) {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  }

  function updateAssessmentCriteria(index, field, value) {
    const updatedCriteria = [...form.assessment_criteria];
    updatedCriteria[index][field] = value;
    setForm((prev) => ({ ...prev, assessment_criteria: updatedCriteria }));
  }

  function addAssessmentCriteria() {
    setForm((prev) => ({
      ...prev,
      assessment_criteria: [...prev.assessment_criteria, { assessment_criteria: "", weightage: 0 }],
    }));
  }

  function removeAssessmentCriteria(index) {
    setForm((prev) => ({
      ...prev,
      assessment_criteria: prev.assessment_criteria.filter((_, i) => i !== index),
    }));
  }

  async function handleCreateTopic(data) {
    setCreatingTopic(true);
    try {
      const result = await createTopic(data);
      setTopicOptions(prev => [...prev, { name: result.topic_name, topic_name: result.topic_name }]);
      setForm(prev => ({
        ...prev,
        topics: [...prev.topics, { topic: result.topic_name, topic_name: result.topic_name }],
      }));
      toast.success(`Topic "${result.topic_name}" created and added`);
      setTopicModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingTopic(false);
    }
  }

  async function handleCreateCriteria(data) {
    setCreatingCriteria(true);
    try {
      const result = await createAssessmentCriteria(data);
      setAssessmentCriteriaOptions(prev => [...prev, { name: result.assessment_criteria }]);
      setForm(prev => ({
        ...prev,
        assessment_criteria: [...prev.assessment_criteria, { 
          assessment_criteria: result.assessment_criteria, 
          weightage: 0 
        }],
      }));
      toast.success(`Assessment criteria "${result.assessment_criteria}" created and added`);
      setCriteriaModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingCriteria(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.course_name.trim()) {
      errors.course_name = "Subject name is required";
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
      {/* New Topic Modal */}
      <NewTopicModal
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        onSave={handleCreateTopic}
        saving={creatingTopic}
      />

      {/* New Assessment Criteria Modal */}
      <NewAssessmentCriteriaModal
        open={criteriaModalOpen}
        onClose={() => setCriteriaModalOpen(false)}
        onSave={handleCreateCriteria}
        saving={creatingCriteria}
      />

      <form onSubmit={handleSubmit}>
        <div className="panel" style={{ overflow: "visible" }}>
          <SectionPanel icon={BookOpen} title="Subject Information">
            <div className="grid-form">
              <div className="field">
                <Label required>Subject Name</Label>
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
                    {form.course_name || "—"}
                  </div>
                ) : (
                  <input
                    className="input"
                    value={form.course_name}
                    onChange={(e) => updateField("course_name", e.target.value)}
                    placeholder="Enter subject name"
                  />
                )}
                {fieldErrors.course_name && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.course_name}
                  </div>
                )}
                {editing && (
                  <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                    Subject name cannot be changed after creation.
                  </div>
                )}
              </div>

              <div className="field">
                <Label>Department</Label>
                <select
                  className="select"
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  disabled={loadingOptions}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ gridColumn: "span 2" }}>
                <Label>Description</Label>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="field">
                <Label>Default Grading Scale</Label>
                <select
                  className="select"
                  value={form.default_grading_scale}
                  onChange={(e) => updateField("default_grading_scale", e.target.value)}
                  disabled={loadingOptions}
                >
                  <option value="">Select Grading Scale</option>
                  {gradingScaleOptions.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionPanel>

          {/* Topics Section */}
          <SectionPanel icon={BookOpen} title="Topics">
            <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addTopic}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} />
                Add Existing Topic
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setTopicModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <PlusCircle size={15} />
                Add New Topic
              </button>
            </div>

            {form.topics.length === 0 ? (
              <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
                No topics added yet. Add an existing topic or create a new one.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ minWidth: "150px" }}>Topic</th>
                      <th style={{ minWidth: "150px" }}>Topic Name</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.topics.map((topic, index) => (
                      <tr key={index}>
                        <td>
                          <SearchableSelect
                            value={topic.topic}
                            onChange={(val) => updateTopic(index, "topic", val)}
                            options={topicOptions}
                            placeholder="Search topic..."
                            label="Topic"
                            disabled={loadingOptions}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            value={topic.topic_name || ""}
                            readOnly
                            placeholder="Topic name"
                            style={{ backgroundColor: "var(--surface-2)" }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="iconbtn"
                            onClick={() => removeTopic(index)}
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

          {/* Assessment Criteria Section */}
          <SectionPanel icon={ClipboardList} title="Assessment Criteria">
            <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addAssessmentCriteria}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} />
                Add Existing Criteria
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCriteriaModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <PlusCircle size={15} />
                Add New Criteria
              </button>
            </div>

            {form.assessment_criteria.length === 0 ? (
              <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
                No assessment criteria added yet. Add existing criteria or create a new one.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ minWidth: "200px" }}>Assessment Criteria</th>
                      <th style={{ minWidth: "100px" }}>Weightage (%)</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.assessment_criteria.map((criteria, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="select"
                            value={criteria.assessment_criteria || ""}
                            onChange={(e) => updateAssessmentCriteria(index, "assessment_criteria", e.target.value)}
                          >
                            <option value="">Select Assessment Criteria</option>
                            {assessmentCriteriaOptions.map((item) => (
                              <option key={item.name} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input"
                            value={criteria.weightage || ""}
                            onChange={(e) => updateAssessmentCriteria(index, "weightage", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="iconbtn"
                            onClick={() => removeAssessmentCriteria(index)}
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
            {saving || loading ? "Saving..." : editing ? "Update Subject" : "Create Subject"}
          </button>
        </div>
      </form>
    </>
  );
}
import { useState, useEffect, useRef } from "react";
import { BookOpen, FileText, Image, Upload, X, Plus, Trash2, AlertCircle, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";

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
    (opt.title && opt.title.toLowerCase().includes(search.toLowerCase()))
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
      return selected.title || selected.name;
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
                    {option.title || option.name}
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

export default function TopicForm({ topic, onSave, saving, editing }) {
  const [form, setForm] = useState({
    topic_name: topic?.topic_name || "",
    description: topic?.description || "",
    hero_image: topic?.hero_image || "",
    topic_content: topic?.topic_content || [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Options for content types
  const contentTypes = ["Article", "Video", "Quiz"];
  
  // Options for content items
  const [articleOptions, setArticleOptions] = useState([]);
  const [videoOptions, setVideoOptions] = useState([]);
  const [quizOptions, setQuizOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load content options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [articles, videos, quizzes] = await Promise.all([
          callMethod("frappe.client.get_list", { doctype: "Article", fields: ["name", "title"], limit_page_length: 500 }),
          callMethod("frappe.client.get_list", { doctype: "Video", fields: ["name", "title"], limit_page_length: 500 }),
          callMethod("frappe.client.get_list", { doctype: "Quiz", fields: ["name", "title"], limit_page_length: 500 }),
        ]);
        setArticleOptions(articles || []);
        setVideoOptions(videos || []);
        setQuizOptions(quizzes || []);
      } catch (err) {
        console.error("Error loading content options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (topic) {
      setForm({
        topic_name: topic.topic_name || "",
        description: topic.description || "",
        hero_image: topic.hero_image || "",
        topic_content: topic.topic_content || [],
      });
      if (topic.hero_image) {
        setImagePreview(topic.hero_image);
      }
    }
  }, [topic]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateContentEntry(index, field, value) {
    const updatedContent = [...form.topic_content];
    updatedContent[index][field] = value;
    setForm((prev) => ({ ...prev, topic_content: updatedContent }));
  }

  function addContentEntry() {
    setForm((prev) => ({
      ...prev,
      topic_content: [...prev.topic_content, { content_type: "", content: "" }],
    }));
  }

  function removeContentEntry(index) {
    setForm((prev) => ({
      ...prev,
      topic_content: prev.topic_content.filter((_, i) => i !== index),
    }));
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', 'Topic');
    formData.append('docname', topic?.name || '');
    formData.append('fieldname', 'hero_image');
    
    try {
      const response = await fetch('/api/method/upload_file', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'X-Frappe-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
      });
      
      const result = await response.json();
      
      if (result.message && result.message.file_url) {
        return result.message.file_url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadingImage(true);
    
    const uploadedUrl = await uploadImage(file);
    setUploadingImage(false);
    
    if (uploadedUrl) {
      setImagePreview(uploadedUrl);
      updateField('hero_image', uploadedUrl);
    } else {
      toast.error("Failed to upload image. Please try again.");
      updateField('hero_image', previewUrl);
    }
  }

  function removeImage() {
    setImagePreview("");
    updateField("hero_image", "");
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.topic_name.trim()) {
      errors.topic_name = "Topic name is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Make sure we're sending the topic_content as an array
      const submitData = {
        ...form,
        topic_content: form.topic_content || []
      };
      await onSave(submitData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Get content options based on type
  const getContentOptions = (type) => {
    if (type === "Article") return articleOptions;
    if (type === "Video") return videoOptions;
    if (type === "Quiz") return quizOptions;
    return [];
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel" style={{ overflow: "visible" }}>
        <SectionPanel icon={BookOpen} title="Topic Information">
          <div className="grid-form">
            <div className="field">
              <Label required>Topic Name</Label>
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
                  {form.topic_name || "—"}
                </div>
              ) : (
                <input
                  className="input"
                  value={form.topic_name}
                  onChange={(e) => updateField("topic_name", e.target.value)}
                  placeholder="Enter topic name"
                />
              )}
              {fieldErrors.topic_name && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.topic_name}
                </div>
              )}
              {editing && (
                <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                  Topic name cannot be changed after creation.
                </div>
              )}
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Description</Label>
              <textarea
                className="input"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter topic description"
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Image</Label>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => document.getElementById("image-upload").click()}
                  disabled={uploadingImage}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Upload size={15} />
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={removeImage}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <X size={15} />
                    Remove
                  </button>
                )}
              </div>
              {imagePreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={imagePreview}
                    alt="Topic preview"
                    style={{
                      maxWidth: 120,
                      maxHeight: 120,
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </SectionPanel>

        {/* Topic Content Section */}
        <SectionPanel icon={FileText} title="Topic Content">
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addContentEntry}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={15} />
              Add Content
            </button>
          </div>

          {form.topic_content.length === 0 ? (
            <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
              No content added yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ minWidth: "150px" }}>Content Type *</th>
                    <th style={{ minWidth: "200px" }}>Content *</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {form.topic_content.map((content, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="select"
                          value={content.content_type || ""}
                          onChange={(e) => updateContentEntry(index, "content_type", e.target.value)}
                        >
                          <option value="">Select Type</option>
                          {contentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {content.content_type ? (
                          <SearchableSelect
                            value={content.content}
                            onChange={(val) => updateContentEntry(index, "content", val)}
                            options={getContentOptions(content.content_type)}
                            placeholder={`Search ${content.content_type}...`}
                            label={content.content_type}
                            disabled={loadingOptions}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "var(--surface-2)",
                              borderRadius: "6px",
                              border: "1px solid hsl(var(--border))",
                              color: "var(--ink-3)",
                              minHeight: "38px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "13px",
                            }}
                          >
                            Select content type first
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="iconbtn"
                          onClick={() => removeContentEntry(index)}
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
        <button type="submit" className="btn btn-primary" disabled={saving || loading || uploadingImage}>
          {saving || loading ? "Saving..." : editing ? "Update Topic" : "Create Topic"}
        </button>
      </div>
    </form>
  );
}
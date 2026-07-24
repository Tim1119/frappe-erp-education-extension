import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Plus, 
  Trash2, 
  Search, 
  X,
  AlertCircle,
  Image,
  Upload
} from "lucide-react";
import {
  getDepartments,
  getCourses,
} from "../../../services/classService.js";
import api from "../../../services/api.js";
import { getErrorMessage } from "../../../utils/errors.js";

const EMPTY_FORM = {
  program_name: "",
  program_abbreviation: "",
  department: "",
  hero_image: "",
  courses: [],
};

const EMPTY_COURSE_ENTRY = {
  course: "",
  course_name: "",
  required: 1,
};

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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = options.find(opt => opt.name === value);

  const filtered = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    (opt.course_name && opt.course_name.toLowerCase().includes(search.toLowerCase()))
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

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
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
      return selected.course_name || selected.name;
    }
    return value;
  };

  const dropdownContent = isOpen && !disabled && (
    createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 999999,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          maxHeight: "260px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          padding: "8px 10px", 
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          backgroundColor: "var(--surface)",
        }}>
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
        <div style={{ 
          overflowY: "auto", 
          padding: "4px 0",
          flex: 1,
        }}>
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
                  {option.course_name || option.name}
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body
    )
  );

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
          border: "1px solid var(--border)",
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

      {dropdownContent}
    </div>
  );
}

export default function ClassForm({ classData, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Options state
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  const isEditing = Boolean(classData);

  // Load options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [departments, courses] = await Promise.all([
          getDepartments(),
          getCourses(),
        ]);
        setDepartmentOptions(departments || []);
        setCourseOptions(courses || []);
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (!classData) {
      setForm(EMPTY_FORM);
      setImagePreview("");
      setImageFile(null);
      return;
    }

    setForm({
      program_name: classData.program_name || "",
      program_abbreviation: classData.program_abbreviation || "",
      department: classData.department || "",
      hero_image: classData.hero_image || "",
      courses: classData.courses || [],
    });
    
    if (classData.hero_image) {
      const imageUrl = classData.hero_image.startsWith('/') 
        ? classData.hero_image 
        : classData.hero_image;
      setImagePreview(imageUrl);
    }
  }, [classData]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateCourseEntry(index, field, value) {
    const updatedCourses = [...form.courses];
    updatedCourses[index][field] = value;
    
    if (field === 'course' && value) {
      const selectedCourse = courseOptions.find(c => c.name === value);
      if (selectedCourse) {
        updatedCourses[index].course_name = selectedCourse.course_name || selectedCourse.name;
      }
    }
    
    setForm((prev) => ({ ...prev, courses: updatedCourses }));
  }

  function addCourseEntry() {
    setForm((prev) => ({
      ...prev,
      courses: [...prev.courses, { ...EMPTY_COURSE_ENTRY }],
    }));
  }

  function removeCourseEntry(index) {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', 'Program');
    formData.append('docname', classData?.name || '');
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
    setImageFile(file);
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
    setImageFile(null);
    updateField("hero_image", "");
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function validateForm() {
    const errors = {};
    
    if (!form.program_name.trim()) {
      errors.program_name = "Class name is required";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <SectionPanel icon={GraduationCap} title="Class Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Class Name</Label>
            {isEditing ? (
              // Read-only display for editing
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
                {form.program_name || "—"}
              </div>
            ) : (
              // Editable input for new records
              <input
                className="input"
                value={form.program_name}
                required
                onChange={(e) => updateField("program_name", e.target.value)}
                placeholder="Enter class name"
              />
            )}
            {fieldErrors.program_name && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={14} />
                {fieldErrors.program_name}
              </div>
            )}
            {isEditing && (
              <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                Class name cannot be changed after creation.
              </div>
            )}
          </div>

          <div className="field">
            <Label>Class Abbreviation</Label>
            <input
              className="input"
              value={form.program_abbreviation}
              onChange={(e) => updateField("program_abbreviation", e.target.value)}
              placeholder="e.g., JSS 3"
            />
          </div>

          <div className="field">
            <Label>Department</Label>
            <SearchableSelect
              value={form.department}
              onChange={(val) => updateField("department", val)}
              options={departmentOptions}
              placeholder="Search department..."
              label="Department"
              disabled={loadingOptions}
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={BookOpen} title="Courses">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCourseEntry}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Course
          </button>
        </div>

        {form.courses.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No courses added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ minWidth: "150px" }}>Course *</th>
                  <th style={{ minWidth: "150px" }}>Course Name</th>
                  <th style={{ minWidth: "100px" }}>Mandatory</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.courses.map((course, index) => (
                  <tr key={index}>
                    <td>
                      <SearchableSelect
                        value={course.course}
                        onChange={(val) => updateCourseEntry(index, "course", val)}
                        options={courseOptions}
                        placeholder="Search course..."
                        label="Course"
                        disabled={loadingOptions}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={course.course_name || ""}
                        readOnly
                        placeholder="Course name"
                        style={{ backgroundColor: "var(--surface-2)" }}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={course.required === 1}
                        onChange={(e) => updateCourseEntry(index, "required", e.target.checked ? 1 : 0)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeCourseEntry(index)}
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

      <SectionPanel icon={Image} title="Class Image">
        <div className="grid-form">
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
                  alt="Class preview"
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.style.cssText = `
                        width: 120px;
                        height: 120px;
                        border-radius: 8px;
                        border: 1px solid var(--border);
                        background: var(--surface-2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--ink-3);
                        font-size: 13px;
                      `;
                      fallback.textContent = 'No image';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            )}
            {!imagePreview && (
              <div style={{ 
                marginTop: 10,
                width: 120,
                height: 120,
                borderRadius: 8,
                border: "1px dashed var(--border)",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-3)",
                fontSize: "13px",
                textAlign: "center",
              }}>
                No image uploaded
              </div>
            )}
          </div>
        </div>
      </SectionPanel>

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
        <button type="submit" className="btn btn-primary" disabled={loading || uploadingImage}>
          {loading ? "Saving..." : isEditing ? "Update Class" : "Create Class"}
        </button>
      </div>
    </form>
  );
}
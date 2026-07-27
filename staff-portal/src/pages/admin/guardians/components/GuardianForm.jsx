import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { User, Mail, Phone, Briefcase, GraduationCap, Calendar, MapPin, Users, Plus, Trash2, Upload, Search, X } from "lucide-react";
import { getStudents } from "@/services/guardianService.js";

const EMPTY_FORM = {
  guardian_name: "",
  email_address: "",
  mobile_number: "",
  alternate_number: "",
  date_of_birth: "",
  education: "",
  occupation: "",
  designation: "",
  work_address: "",
  image: "",
  students: [],
  interests: [],
};

const EMPTY_INTEREST_ENTRY = {
  interest: "",
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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = options.find(opt => opt.name === value);

  const filtered = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    (opt.student_name && opt.student_name.toLowerCase().includes(search.toLowerCase()))
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
      return selected.student_name || selected.name;
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
          border: "1px solid hsl(var(--border))",
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
          borderBottom: "1px solid hsl(var(--border))",
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
                  {option.student_name || option.name}
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

      {dropdownContent}
    </div>
  );
}

export default function GuardianForm({ guardian, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Load student options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const students = await getStudents();
        setStudentOptions(students || []);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (!guardian) {
      setForm(EMPTY_FORM);
      setImagePreview("");
      setImageFile(null);
      return;
    }

    setForm({
      guardian_name: guardian.guardian_name || "",
      email_address: guardian.email_address || "",
      mobile_number: guardian.mobile_number || "",
      alternate_number: guardian.alternate_number || "",
      date_of_birth: guardian.date_of_birth || "",
      education: guardian.education || "",
      occupation: guardian.occupation || "",
      designation: guardian.designation || "",
      work_address: guardian.work_address || "",
      image: guardian.image || "",
      students: guardian.students || [],
      interests: guardian.interests || [],
    });
    
    if (guardian.image) {
      setImagePreview(guardian.image);
    }
  }, [guardian]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateInterestEntry(index, value) {
    const updatedInterests = [...form.interests];
    updatedInterests[index].interest = value;
    setForm((prev) => ({ ...prev, interests: updatedInterests }));
  }

  function addInterestEntry() {
    setForm((prev) => ({
      ...prev,
      interests: [...prev.interests, { ...EMPTY_INTEREST_ENTRY }],
    }));
  }

  function removeInterestEntry(index) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', 'Guardian');
    formData.append('docname', guardian?.name || '');
    formData.append('fieldname', 'image');
    
    try {
      const response = await fetch('/api/method/upload_file', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
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
    
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setImagePreview(uploadedUrl);
      updateField('image', uploadedUrl);
    }
  }

  function removeImage() {
    setImagePreview("");
    setImageFile(null);
    updateField("image", "");
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <SectionPanel icon={User} title="Personal Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Guardian Name</Label>
            <input
              className="input"
              value={form.guardian_name}
              required
              onChange={(e) => updateField("guardian_name", e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="field">
            <Label>Email Address</Label>
            <input
              className="input"
              type="email"
              value={form.email_address}
              onChange={(e) => updateField("email_address", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="field">
            <Label>Mobile Number</Label>
            <input
              className="input"
              value={form.mobile_number}
              onChange={(e) => updateField("mobile_number", e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="field">
            <Label>Alternate Number</Label>
            <input
              className="input"
              value={form.alternate_number}
              onChange={(e) => updateField("alternate_number", e.target.value)}
              placeholder="Enter alternate number"
            />
          </div>

          <div className="field">
            <Label>Date of Birth</Label>
            <input
              className="input"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Education</Label>
            <input
              className="input"
              value={form.education}
              onChange={(e) => updateField("education", e.target.value)}
              placeholder="e.g., B.Sc, M.A"
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Briefcase} title="Professional Information">
        <div className="grid-form">
          <div className="field">
            <Label>Occupation</Label>
            <input
              className="input"
              value={form.occupation}
              onChange={(e) => updateField("occupation", e.target.value)}
              placeholder="e.g., Engineer, Doctor"
            />
          </div>

          <div className="field">
            <Label>Designation</Label>
            <input
              className="input"
              value={form.designation}
              onChange={(e) => updateField("designation", e.target.value)}
              placeholder="e.g., Senior Manager"
            />
          </div>

          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label>Work Address</Label>
            <textarea
              className="input"
              value={form.work_address}
              onChange={(e) => updateField("work_address", e.target.value)}
              placeholder="Enter work address"
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Users} title="Students">
        <div className="muted" style={{ fontSize: "13px", marginBottom: "12px" }}>
          Students are linked from the Student record. This list is read-only.
        </div>

        {form.students.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No students linked to this guardian.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {form.students.map((student, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 550 }}>{student.student || "—"}</td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {student.student_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel icon={GraduationCap} title="Interests">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addInterestEntry}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Interest
          </button>
        </div>

        {form.interests.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No interests added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Interest</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.interests.map((interest, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="input"
                        value={interest.interest || ""}
                        onChange={(e) => updateInterestEntry(index, e.target.value)}
                        placeholder="Enter interest"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeInterestEntry(index)}
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

      <SectionPanel icon={Mail} title="Profile Image">
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
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Upload size={15} />
                Upload Image
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
                  alt="Preview"
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : guardian ? "Update Guardian" : "Create Guardian"}
        </button>
      </div>
    </form>
  );
}
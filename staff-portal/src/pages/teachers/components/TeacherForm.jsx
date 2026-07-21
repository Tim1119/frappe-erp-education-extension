import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { User, Briefcase, Mail, Clock, Plus, Trash2, Upload, Search, X } from "lucide-react";
import {
  getEmployees,
  getDepartments,
  getAcademicYears,
  getAcademicTerms,
  getPrograms,
  getProgramCourses,
} from "../../../services/teacherService.js";

const STATUS_OPTIONS = ["Active", "Left"];

const EMPTY_LOG_ENTRY = {
  academic_year: "",
  academic_term: "",
  program: "",
  course: "",
};

const EMPTY_FORM = {
  instructor_name: "",
  employee: "",
  department: "",
  status: "Active",
  gender: "",
  image: "",
  instructor_log: [],
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

// Searchable Select Component with Portal - Fixed selection
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
    (opt.employee_name && opt.employee_name.toLowerCase().includes(search.toLowerCase()))
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
    if (selected) {
      return selected.employee_name || selected.name;
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
                  {option.employee_name || option.name}
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

export default function TeacherForm({ teacher, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Load all dropdown options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        
        const [employees, departments, academicYears, academicTerms, programs] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getAcademicYears(),
          getAcademicTerms(),
          getPrograms(),
        ]);
        
        setEmployeeOptions(employees || []);
        setDepartmentOptions(departments || []);
        setAcademicYearOptions(academicYears || []);
        setAcademicTermOptions(academicTerms || []);
        setProgramOptions(programs || []);
        
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Fetch courses when program (class) changes
  const fetchCoursesForProgram = async (program, logIndex) => {
    if (!program) {
      return;
    }
    
    try {
      const courses = await getProgramCourses(program);
      
      setCourseOptions(prev => ({
        ...prev,
        [program]: courses || []
      }));
      
      const currentLog = form.instructor_log[logIndex];
      if (currentLog && currentLog.course) {
        const validCourses = courses || [];
        const courseExists = validCourses.some(c => c.name === currentLog.course);
        if (!courseExists) {
          const updatedLog = [...form.instructor_log];
          updatedLog[logIndex].course = '';
          setForm((prev) => ({ ...prev, instructor_log: updatedLog }));
        } else {
          const updatedLog = [...form.instructor_log];
          updatedLog[logIndex].course = currentLog.course;
          setForm((prev) => ({ ...prev, instructor_log: updatedLog }));
        }
      }
    } catch (err) {
      console.error(`Error loading courses for program ${program}:`, err);
      setCourseOptions(prev => ({
        ...prev,
        [program]: []
      }));
    }
  };

  // Pre-fetch courses for existing log entries with programs
  useEffect(() => {
    form.instructor_log.forEach((log, index) => {
      if (log.program) {
        fetchCoursesForProgram(log.program, index);
      }
    });
  }, []);

  // When teacher data is loaded, fetch courses for each log entry
  useEffect(() => {
    if (teacher && teacher.instructor_log && teacher.instructor_log.length > 0) {
      teacher.instructor_log.forEach((log, index) => {
        if (log.program && log.course) {
          const fetchAndSetCourse = async () => {
            try {
              const courses = await getProgramCourses(log.program);
              setCourseOptions(prev => ({
                ...prev,
                [log.program]: courses || []
              }));
              
              const updatedLog = [...form.instructor_log];
              if (updatedLog[index]) {
                updatedLog[index].course = log.course;
                setForm(prev => ({ ...prev, instructor_log: updatedLog }));
              }
            } catch (err) {
              console.error(`Error fetching courses for ${log.program}:`, err);
            }
          };
          fetchAndSetCourse();
        }
      });
    }
  }, [teacher]);

  useEffect(() => {
    if (!teacher) {
      setForm(EMPTY_FORM);
      setImagePreview("");
      setImageFile(null);
      return;
    }

    setForm({
      instructor_name: teacher.instructor_name || "",
      employee: teacher.employee || "",
      department: teacher.department || "",
      status: teacher.status || "Active",
      gender: teacher.gender || "",
      image: teacher.image || "",
      instructor_log: teacher.instructor_log || [],
    });
    
    // If teacher has an image, set the preview
    if (teacher.image) {
      // If it's a file path, construct the full URL
      const imageUrl = teacher.image.startsWith('/') 
        ? teacher.image 
        : teacher.image;
      setImagePreview(imageUrl);
    } else {
      setImagePreview("");
    }
  }, [teacher]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLogEntry(index, field, value) {
    const updatedLog = [...form.instructor_log];
    updatedLog[index][field] = value;
    setForm((prev) => ({ ...prev, instructor_log: updatedLog }));
    
    if (field === 'program' && value) {
      fetchCoursesForProgram(value, index);
      updatedLog[index].course = '';
      setForm((prev) => ({ ...prev, instructor_log: updatedLog }));
    }
  }

  function addLogEntry() {
    setForm((prev) => ({
      ...prev,
      instructor_log: [...prev.instructor_log, { ...EMPTY_LOG_ENTRY }],
    }));
  }

  function removeLogEntry(index) {
    setForm((prev) => ({
      ...prev,
      instructor_log: prev.instructor_log.filter((_, i) => i !== index),
    }));
  }

  async function uploadImage(file) {
    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', 'Instructor');
    formData.append('docname', teacher?.name || '');
    formData.append('fieldname', 'image');
    
    try {
      // Upload to Frappe
      const response = await fetch('/api/method/upload_file', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      
      const result = await response.json();
      
      if (result.message && result.message.file_url) {
        const fileUrl = result.message.file_url;
        updateField('image', fileUrl);
        setImagePreview(fileUrl);
        return fileUrl;
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

    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    
    // Upload the image to Frappe
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
    // Reset the file input
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
      <SectionPanel icon={User} title="Instructor Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Instructor Name</Label>
            <input
              className="input"
              value={form.instructor_name}
              required
              onChange={(e) => updateField("instructor_name", e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="field">
            <Label>Employee</Label>
            <SearchableSelect
              value={form.employee}
              onChange={(val) => updateField("employee", val)}
              options={employeeOptions}
              placeholder="Search employee..."
              label="Employee"
              disabled={loadingOptions}
            />
          </div>

          <div className="field">
            <Label>Gender</Label>
            <select
              className="select"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field">
            <Label required>Status</Label>
            <select
              className="select"
              value={form.status}
              required
              onChange={(e) => updateField("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Briefcase} title="Professional Information">
        <div className="grid-form">
          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label>Department</Label>
            <select
              className="select"
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              disabled={loadingOptions}
              style={{ height: "38px" }}
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {loadingOptions && (
              <div style={{ fontSize: "12px", color: "var(--ink-3)", marginTop: "4px" }}>
                Loading departments...
              </div>
            )}
            {!loadingOptions && departmentOptions.length > 0 && (
              <div style={{ fontSize: "12px", color: "var(--ink-3)", marginTop: "4px" }}>
                {departmentOptions.length} departments available
              </div>
            )}
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Clock} title="Instructor Log">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addLogEntry}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Row
          </button>
        </div>

        {form.instructor_log.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No log entries added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No.</th>
                  <th>Academic Year *</th>
                  <th>Academic Term</th>
                  <th>Class *</th>
                  <th>Subject</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.instructor_log.map((log, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "center", color: "var(--ink-3)" }}>
                      {index + 1}
                    </td>
                    <td>
                      <select
                        className="select"
                        value={log.academic_year || ""}
                        required
                        onChange={(e) => updateLogEntry(index, "academic_year", e.target.value)}
                      >
                        <option value="">Select Year</option>
                        {academicYearOptions.map((year) => (
                          <option key={year.name} value={year.name}>
                            {year.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select"
                        value={log.academic_term || ""}
                        onChange={(e) => updateLogEntry(index, "academic_term", e.target.value)}
                      >
                        <option value="">Select Term</option>
                        {academicTermOptions.map((term) => (
                          <option key={term.name} value={term.name}>
                            {term.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select"
                        value={log.program || ""}
                        required
                        onChange={(e) => updateLogEntry(index, "program", e.target.value)}
                      >
                        <option value="">Select Class</option>
                        {programOptions.map((program) => (
                          <option key={program.name} value={program.name}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select"
                        value={log.course || ""}
                        onChange={(e) => updateLogEntry(index, "course", e.target.value)}
                        disabled={!log.program}
                      >
                        <option value="">
                          {!log.program ? "Select class first" : "Select subject"}
                        </option>
                        {(courseOptions[log.program] || []).map((course) => (
                          <option key={course.name} value={course.name}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeLogEntry(index)}
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
                  alt="Profile"
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
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
          {loading ? "Saving..." : teacher ? "Update Teacher" : "Create Teacher"}
        </button>
      </div>
    </form>
  );
}
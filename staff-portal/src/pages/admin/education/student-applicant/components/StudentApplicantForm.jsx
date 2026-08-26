import { useState, useEffect, useRef } from "react";
import {
  User, Search, ChevronDown, X, Plus, Trash2, Users, BookOpen, Home, Eye, Edit,
  UserPlus as UserPlusIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";

import {
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getGenders,
  getStudentCategories,
  getGuardians,
  createGuardian,
  updateStudentApplicant,
} from "@/services/education/studentApplicantService.js";
import {
  getCsrfToken,
  isExpiredSessionResponse,
  redirectToLogin,
} from "@/services/sessionExpiry.js";

import { getErrorMessage } from "@/utils/errors.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Label({ children, required }) {
  return (
    <label className="label">
      {children}
      {required && (
        <span style={{ color: "var(--danger-ink, #ef4444)", marginLeft: 3 }}>*</span>
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

  const filtered = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase()) ||
      (opt.guardian_name && opt.guardian_name.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
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
    const selected = options.find((opt) => opt.name === value);
    if (selected) return selected.guardian_name || selected.name;
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
        <span style={{ color: value ? "var(--ink)" : "var(--ink-3)", fontSize: "14px" }}>
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
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
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
                style={{ border: "none", outline: "none", width: "100%", fontSize: "13px", background: "transparent", color: "var(--ink)" }}
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
                      if (!isSelected) e.currentTarget.style.backgroundColor = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {option.guardian_name || option.name}
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

// New Guardian Modal
function NewGuardianModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({ guardian_name: "" });
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.guardian_name.trim()) {
      setError("Guardian name is required");
      return;
    }
    await onSave({ guardian_name: form.guardian_name.trim() });
    setForm({ guardian_name: "" });
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Guardian" size="sm">
      <div style={{ padding: "4px 0" }}>
        <Label required>Guardian Name</Label>
        <input
          className="input"
          value={form.guardian_name}
          onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
          placeholder="Enter guardian name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        {error && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create Guardian"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Sibling Modal
function SiblingModal({ open, onClose, onSave, sibling, saving }) {
  const [form, setForm] = useState({
    studying_in_same_institute: "NO",
    full_name: "",
    gender: "",
    institution: "",
    program: "",
    date_of_birth: "",
    student: "",
  });
  const [error, setError] = useState("");
  const [genderOptions, setGenderOptions] = useState([]);

  useEffect(() => {
    const loadGenders = async () => {
      try {
        const response = await fetch("/api/method/frappe.client.get_list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Frappe-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content || "",
          },
          body: JSON.stringify({ doctype: "Gender", fields: ["name"], limit_page_length: 500 }),
        });
        const data = await response.json();
        setGenderOptions(data.message || []);
      } catch (err) {
        console.error("Error loading genders:", err);
      }
    };
    loadGenders();
  }, []);

  useEffect(() => {
    if (sibling) {
      setForm({
        studying_in_same_institute: sibling.studying_in_same_institute || "NO",
        full_name: sibling.full_name || "",
        gender: sibling.gender || "",
        institution: sibling.institution || "",
        program: sibling.program || "",
        date_of_birth: sibling.date_of_birth || "",
        student: sibling.student || "",
      });
    } else {
      setForm({
        studying_in_same_institute: "NO",
        full_name: "",
        gender: "",
        institution: "",
        program: "",
        date_of_birth: "",
        student: "",
      });
    }
  }, [sibling]);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError("Full name is required");
      return;
    }
    await onSave(form);
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title={sibling ? "Edit Sibling" : "Add New Sibling"} size="md">
      <div style={{ padding: "4px 0" }}>
        <div className="grid-form">
          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label required>Full Name</Label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="field">
            <Label>Gender</Label>
            <select className="select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select Gender</option>
              {genderOptions.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <Label>Date of Birth</Label>
            <input
              type="date"
              className="input"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
          </div>

          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label>Studying in Same Institute</Label>
            <select
              className="select"
              value={form.studying_in_same_institute}
              onChange={(e) => setForm({ ...form, studying_in_same_institute: e.target.value })}
            >
              <option value="NO">No</option>
              <option value="YES">Yes</option>
            </select>
          </div>

          {form.studying_in_same_institute === "YES" ? (
            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Student ID</Label>
              <input
                className="input"
                value={form.student || ""}
                onChange={(e) => setForm({ ...form, student: e.target.value })}
                placeholder="Enter student ID"
              />
            </div>
          ) : (
            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Institution</Label>
              <input
                className="input"
                value={form.institution || ""}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="Enter institution name"
              />
            </div>
          )}

          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label>Class</Label>
            <input
              className="input"
              value={form.program || ""}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="Enter class"
            />
          </div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : sibling ? "Update Sibling" : "Add Sibling"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function StatusBadgeComponent({ status }) {
  const statusMap = {
    Applied: { label: "Applied", color: "var(--warning)", bg: "var(--warning-soft)" },
    Approved: { label: "Approved", color: "var(--success)", bg: "var(--success-soft)" },
    Rejected: { label: "Rejected", color: "var(--danger)", bg: "var(--danger-soft)" },
    Admitted: { label: "Admitted", color: "var(--brand)", bg: "var(--brand-soft)" },
  };
  const s = statusMap[status] || statusMap["Applied"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

export default function StudentApplicantForm({ applicant, onSave, saving, editing }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState({
    first_name: applicant?.first_name || "",
    middle_name: applicant?.middle_name || "",
    last_name: applicant?.last_name || "",
    program: applicant?.program || "",
    academic_year: applicant?.academic_year || "",
    academic_term: applicant?.academic_term || "",
    application_date: applicant?.application_date || "",
    application_status: applicant?.application_status || "Applied",
    student_email_id: applicant?.student_email_id || "",
    student_mobile_number: applicant?.student_mobile_number || "",
    student_category: applicant?.student_category || "",
    date_of_birth: applicant?.date_of_birth || "",
    gender: applicant?.gender || "",
    blood_group: applicant?.blood_group || "",
    nationality: applicant?.nationality || "",
    paid: applicant?.paid || 0,
    address_line_1: applicant?.address_line_1 || "",
    address_line_2: applicant?.address_line_2 || "",
    city: applicant?.city || "",
    state: applicant?.state || "",
    pincode: applicant?.pincode || "",
    country: applicant?.country || "",
    image: applicant?.image || "",
    guardians: applicant?.guardians || [],
    siblings: applicant?.siblings || [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [guardianModalOpen, setGuardianModalOpen] = useState(false);
  const [creatingGuardian, setCreatingGuardian] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [siblingModalOpen, setSiblingModalOpen] = useState(false);
  const [editingSibling, setEditingSibling] = useState(null);
  const [savingSibling, setSavingSibling] = useState(false);

  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [studentCategoryOptions, setStudentCategoryOptions] = useState([]);
  const [guardianOptions, setGuardianOptions] = useState([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [programs, academicYears, genders, studentCategories, guardians] = await Promise.all([
          getPrograms(),
          getAcademicYears(),
          getGenders(),
          getStudentCategories(),
          getGuardians(),
        ]);
        setProgramOptions(programs || []);
        setAcademicYearOptions(academicYears || []);
        setGenderOptions(genders || []);
        setStudentCategoryOptions(studentCategories || []);
        setGuardianOptions(guardians || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (form.academic_year) {
      getAcademicTerms(form.academic_year).then((terms) => setAcademicTermOptions(terms || []));
    } else {
      setAcademicTermOptions([]);
    }
  }, [form.academic_year]);

  useEffect(() => {
    if (applicant) {
      setForm({
        first_name: applicant.first_name || "",
        middle_name: applicant.middle_name || "",
        last_name: applicant.last_name || "",
        program: applicant.program || "",
        academic_year: applicant.academic_year || "",
        academic_term: applicant.academic_term || "",
        application_date: applicant.application_date || "",
        application_status: applicant.application_status || "Applied",
        student_email_id: applicant.student_email_id || "",
        student_mobile_number: applicant.student_mobile_number || "",
        student_category: applicant.student_category || "",
        date_of_birth: applicant.date_of_birth || "",
        gender: applicant.gender || "",
        blood_group: applicant.blood_group || "",
        nationality: applicant.nationality || "",
        paid: applicant.paid || 0,
        address_line_1: applicant.address_line_1 || "",
        address_line_2: applicant.address_line_2 || "",
        city: applicant.city || "",
        state: applicant.state || "",
        pincode: applicant.pincode || "",
        country: applicant.country || "",
        image: applicant.image || "",
        guardians: applicant.guardians || [],
        siblings: applicant.siblings || [],
      });
      if (applicant.image) setImagePreview(applicant.image);
    }
  }, [applicant]);

  function updateField(field, value) {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateGuardian(index, field, value) {
    const updatedGuardians = [...form.guardians];
    updatedGuardians[index][field] = value;

    if (field === "guardian" && value) {
      const selectedGuardian = guardianOptions.find((g) => g.name === value);
      if (selectedGuardian) {
        updatedGuardians[index].guardian_name = selectedGuardian.guardian_name || selectedGuardian.name;
      }
    }

    setForm((prev) => ({ ...prev, guardians: updatedGuardians }));
  }

  function addGuardian() {
    setForm((prev) => ({
      ...prev,
      guardians: [...prev.guardians, { guardian: "", guardian_name: "", relation: "" }],
    }));
  }

  function removeGuardian(index) {
    setForm((prev) => ({ ...prev, guardians: prev.guardians.filter((_, i) => i !== index) }));
  }

  async function handleCreateGuardian(data) {
    setCreatingGuardian(true);
    try {
      const result = await createGuardian(data);
      setGuardianOptions((prev) => [...prev, { name: result.name, guardian_name: result.guardian_name }]);
      setForm((prev) => ({
        ...prev,
        guardians: [...prev.guardians, { guardian: result.name, guardian_name: result.guardian_name, relation: "" }],
      }));
      toast.success(`Guardian "${result.guardian_name}" created and added`);
      setGuardianModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingGuardian(false);
    }
  }

  function addSibling() {
    setEditingSibling(null);
    setSiblingModalOpen(true);
  }

  function editSibling(index) {
    setEditingSibling({ index, data: form.siblings[index] });
    setSiblingModalOpen(true);
  }

  function viewSibling(index) {
    const sibling = form.siblings[index];
    alert(
      `Full Name: ${sibling.full_name || "—"}\n` +
      `Gender: ${sibling.gender || "—"}\n` +
      `Class: ${sibling.program || "—"}\n` +
      `Date of Birth: ${sibling.date_of_birth || "—"}\n` +
      `Same Institute: ${sibling.studying_in_same_institute || "NO"}\n` +
      `${sibling.studying_in_same_institute === "YES" ? `Student ID: ${sibling.student || "—"}` : `Institution: ${sibling.institution || "—"}`}`
    );
  }

  function handleSiblingSave(siblingData) {
    setSavingSibling(true);
    try {
      if (editingSibling !== null) {
        const updatedSiblings = [...form.siblings];
        updatedSiblings[editingSibling.index] = siblingData;
        setForm((prev) => ({ ...prev, siblings: updatedSiblings }));
        toast.success("Sibling updated");
      } else {
        setForm((prev) => ({ ...prev, siblings: [...prev.siblings, siblingData] }));
        toast.success("Sibling added");
      }
      setSiblingModalOpen(false);
      setEditingSibling(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingSibling(false);
    }
  }

  function removeSibling(index) {
    if (window.confirm("Are you sure you want to remove this sibling?")) {
      setForm((prev) => ({ ...prev, siblings: prev.siblings.filter((_, i) => i !== index) }));
      toast.success("Sibling removed");
    }
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    // Frappe rejects an attachment when a doctype is supplied without a
    // real document name. New applicants do not have a name yet, so upload
    // their image unattached and persist the returned URL with the new doc.
    // Existing applicants can attach the File directly to their image field.
    if (applicant?.name) {
      formData.append("doctype", "Student Applicant");
      formData.append("docname", String(applicant.name));
      formData.append("fieldname", "image");
    }

    const csrfToken = getCsrfToken();
    const response = await fetch("/api/method/upload_file", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(csrfToken ? { "X-Frappe-CSRF-Token": csrfToken } : {}),
      },
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      if (isExpiredSessionResponse(response.status, result)) {
        redirectToLogin();
        throw new Error("Your session has expired. Redirecting to login.");
      }
      throw new Error(result?.message || result?.exception || "Failed to upload image");
    }

    const fileUrl = result?.message?.file_url;
    if (!fileUrl) throw new Error("The upload completed without returning a file URL");
    return fileUrl;
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const previousImage = form.image || "";
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);
    setUploadingImage(true);

    try {
      const uploadedUrl = await uploadImage(file);
      setImagePreview(uploadedUrl);
      updateField("image", uploadedUrl);

      // Existing applicants should retain the new image even if the user
      // leaves the edit page without submitting the rest of the form.
      if (editing && applicant?.name) {
        await updateStudentApplicant(applicant.name, { image: uploadedUrl });
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      setImagePreview(previousImage);
      updateField("image", previousImage);
      toast.error(getErrorMessage(error));
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImage() {
    setImagePreview("");
    updateField("image", "");
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  }

  function validateForm() {
    const errors = {};
    if (!form.first_name.trim()) errors.first_name = "First name is required";
    if (
      form.student_email_id.trim()
      && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.student_email_id.trim())
    ) {
      errors.student_email_id = "Enter a valid email address";
    }
    if (!form.program) errors.program = "Class is required";
    if (!form.academic_year) errors.academic_year = "Academic year is required";
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      if (errors.first_name || errors.student_email_id) {
        setActiveTab("personal");
      } else {
        setActiveTab("academic");
      }
      toast.error(Object.values(errors).join(". "));
      return false;
    }

    return true;
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

  const tabs = [
    { key: "personal", label: "Personal Details", icon: User },
    { key: "academic", label: "Academic", icon: BookOpen },
    { key: "address", label: "Address", icon: Home },
    { key: "relations", label: "Relations", icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid-form">
            <div className="field">
              <Label required>First Name</Label>
              <input className="input" value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)} placeholder="Enter first name" />
              {fieldErrors.first_name && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.first_name}</div>}
            </div>

            <div className="field">
              <Label>Middle Name</Label>
              <input className="input" value={form.middle_name} onChange={(e) => updateField("middle_name", e.target.value)} placeholder="Enter middle name" />
            </div>

            <div className="field">
              <Label>Last Name</Label>
              <input className="input" value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)} placeholder="Enter last name" />
            </div>

            <div className="field">
              <Label>Gender</Label>
              <select className="select" value={form.gender} onChange={(e) => updateField("gender", e.target.value)} disabled={loadingOptions}>
                <option value="">Select Gender</option>
                {genderOptions.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <Label>Date of Birth</Label>
              <input type="date" className="input" value={form.date_of_birth} onChange={(e) => updateField("date_of_birth", e.target.value)} />
            </div>

            <div className="field">
              <Label>Blood Group</Label>
              <select className="select" value={form.blood_group} onChange={(e) => updateField("blood_group", e.target.value)}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <Label>Nationality</Label>
              <input className="input" value={form.nationality} onChange={(e) => updateField("nationality", e.target.value)} placeholder="Enter nationality" />
            </div>

            <div className="field">
              <Label>Student Category</Label>
              <select className="select" value={form.student_category} onChange={(e) => updateField("student_category", e.target.value)} disabled={loadingOptions}>
                <option value="">Select Category</option>
                {studentCategoryOptions.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <Label>Email Address</Label>
              <input type="email" className="input" value={form.student_email_id} onChange={(e) => updateField("student_email_id", e.target.value)} placeholder="email@example.com" />
              {fieldErrors.student_email_id && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.student_email_id}</div>}
            </div>

            <div className="field">
              <Label>Mobile Number</Label>
              <input className="input" value={form.student_mobile_number} onChange={(e) => updateField("student_mobile_number", e.target.value)} placeholder="Enter mobile number" />
            </div>
          </div>
        );

      case "academic":
        return (
          <div className="grid-form">
            <div className="field">
              <Label required>Class</Label>
              <select className="select" value={form.program} onChange={(e) => updateField("program", e.target.value)} disabled={loadingOptions}>
                <option value="">Select Program</option>
                {programOptions.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
              {fieldErrors.program && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.program}</div>}
            </div>

            <div className="field">
              <Label required>Academic Year</Label>
              <select className="select" value={form.academic_year} onChange={(e) => updateField("academic_year", e.target.value)} disabled={loadingOptions}>
                <option value="">Select Academic Year</option>
                {academicYearOptions.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
              {fieldErrors.academic_year && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.academic_year}</div>}
            </div>

            <div className="field">
              <Label>Academic Term</Label>
              <select className="select" value={form.academic_term} onChange={(e) => updateField("academic_term", e.target.value)} disabled={!form.academic_year || loadingOptions}>
                <option value="">Select Academic Term</option>
                {academicTermOptions.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <Label>Application Date</Label>
              <input type="date" className="input" value={form.application_date} onChange={(e) => updateField("application_date", e.target.value)} />
            </div>

            {/* Read-only status indicator — status changes happen on the profile page */}
            {editing && (
              <div className="field">
                <Label>Application Status</Label>
                <div style={{ paddingTop: "6px" }}>
                  <StatusBadgeComponent status={form.application_status} />
                </div>
              </div>
            )}

            <div className="field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.paid === 1} onChange={(e) => updateField("paid", e.target.checked ? 1 : 0)} />
                Paid
              </label>
            </div>
          </div>
        );

      case "address":
        return (
          <div className="grid-form">
            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Address Line 1</Label>
              <input className="input" value={form.address_line_1} onChange={(e) => updateField("address_line_1", e.target.value)} placeholder="Enter address line 1" />
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label>Address Line 2</Label>
              <input className="input" value={form.address_line_2} onChange={(e) => updateField("address_line_2", e.target.value)} placeholder="Enter address line 2" />
            </div>

            <div className="field">
              <Label>City</Label>
              <input className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Enter city" />
            </div>

            <div className="field">
              <Label>State</Label>
              <input className="input" value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="Enter state" />
            </div>

            <div className="field">
              <Label>Pincode</Label>
              <input className="input" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} placeholder="Enter pincode" />
            </div>

            <div className="field">
              <Label>Country</Label>
              <input className="input" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Enter country" />
            </div>
          </div>
        );

      case "relations":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Guardians Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Guardians</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-primary" onClick={() => setGuardianModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UserPlusIcon size={15} />
                    Add New Guardian
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={addGuardian} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={15} />
                    Add Existing Guardian
                  </button>
                </div>
              </div>

              {form.guardians.length === 0 ? (
                <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No guardians added yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ minWidth: "150px" }}>Guardian *</th>
                        <th style={{ minWidth: "150px" }}>Guardian Name</th>
                        <th style={{ minWidth: "120px" }}>Relation</th>
                        <th style={{ width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.guardians.map((guardian, index) => (
                        <tr key={index}>
                          <td>
                            <SearchableSelect
                              value={guardian.guardian}
                              onChange={(val) => updateGuardian(index, "guardian", val)}
                              options={guardianOptions}
                              placeholder="Search guardian..."
                              label="Guardian"
                              disabled={loadingOptions}
                            />
                          </td>
                          <td>
                            <input className="input" value={guardian.guardian_name || ""} readOnly placeholder="Guardian name" style={{ backgroundColor: "var(--surface-2)" }} />
                          </td>
                          <td>
                            <select className="select" value={guardian.relation || ""} onChange={(e) => updateGuardian(index, "relation", e.target.value)}>
                              <option value="">Select Relation</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td>
                            <button type="button" className="iconbtn" onClick={() => removeGuardian(index)} style={{ color: "var(--danger)" }}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Siblings Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Siblings</h3>
                <button type="button" className="btn btn-secondary" onClick={addSibling} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={15} />
                  Add Sibling
                </button>
              </div>

              {form.siblings.length === 0 ? (
                <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No siblings added yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ minWidth: "150px" }}>Full Name</th>
                        <th style={{ minWidth: "100px" }}>Gender</th>
                        <th style={{ minWidth: "120px" }}>Class</th>
                        <th style={{ minWidth: "120px" }}>Date of Birth</th>
                        <th style={{ width: 120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.siblings.map((sibling, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 550 }}>{sibling.full_name || "—"}</td>
                          <td className="muted2" style={{ fontSize: 13 }}>{sibling.gender || "—"}</td>
                          <td className="muted2" style={{ fontSize: 13 }}>{sibling.program || "—"}</td>
                          <td className="muted2" style={{ fontSize: 13 }}>{sibling.date_of_birth || "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button type="button" className="iconbtn" onClick={() => viewSibling(index)} title="View full details">
                                <Eye size={15} />
                              </button>
                              <button type="button" className="iconbtn" onClick={() => editSibling(index)} title="Edit sibling">
                                <Edit size={15} />
                              </button>
                              <button type="button" className="iconbtn" onClick={() => removeSibling(index)} style={{ color: "var(--danger)" }} title="Remove sibling">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <NewGuardianModal
        open={guardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
        onSave={handleCreateGuardian}
        saving={creatingGuardian}
      />

      <SiblingModal
        open={siblingModalOpen}
        onClose={() => {
          setSiblingModalOpen(false);
          setEditingSibling(null);
        }}
        onSave={handleSiblingSave}
        sibling={editingSibling?.data}
        saving={savingSibling}
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="panel" style={{ overflow: "visible" }}>
          {/* Image beside header — Frappe style */}
          <div style={{ display: "flex", gap: "20px", padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: "80px", height: "100px", borderRadius: "8px", border: "1px solid hsl(var(--border))", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={32} style={{ color: "var(--ink-3)" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>
                {form.first_name || form.last_name ? `${form.first_name || ""} ${form.last_name || ""}`.trim() : "New Applicant"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--ink-3)" }}>{form.program || "No class selected"}</div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-secondary" onClick={() => document.getElementById("image-upload").click()} disabled={uploadingImage} style={{ fontSize: "12px", padding: "4px 12px" }}>
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </button>
                {imagePreview && (
                  <button type="button" className="btn btn-danger" onClick={removeImage} style={{ fontSize: "12px", padding: "4px 12px" }}>
                    Remove
                  </button>
                )}
                <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink-3)", textAlign: "right", marginLeft: "auto", alignSelf: "flex-start", paddingTop: "4px" }}>
              {editing ? `ID: ${applicant?.name}` : "New Applicant"}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", padding: "0 20px", borderBottom: "1px solid hsl(var(--border))", backgroundColor: "var(--surface-2)" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    border: "none",
                    borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                    background: isActive ? "var(--surface)" : "transparent",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--brand)" : "var(--ink-3)",
                    transition: "all 0.15s",
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "20px" }}>{renderTabContent()}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || loading || uploadingImage}>
            {saving || loading ? "Saving..." : editing ? "Update Applicant" : "Create Applicant"}
          </button>
        </div>
      </form>
    </>
  );
}

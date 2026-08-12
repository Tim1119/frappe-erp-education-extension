import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";

import {
  getPrograms,
  getAcademicYears,
  createAcademicYear,
} from "@/services/education/studentAdmissionService.js";

import { getErrorMessage } from "@/utils/errors.js";

function SectionPanel({ icon: Icon, title, children }) {
  return (
    <div className="panel" style={{ marginBottom: 18, overflow: "visible" }}>
      <div className="panel-head">
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
      {required && <span style={{ color: "var(--danger-ink, #ef4444)", marginLeft: 3 }}>*</span>}
    </label>
  );
}

// New Academic Year Modal
function NewAcademicYearModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({ academic_year_name: "", year_start_date: "", year_end_date: "" });
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.academic_year_name.trim()) return setError("Academic year name is required");
    if (!form.year_start_date) return setError("Year start date is required");
    if (!form.year_end_date) return setError("Year end date is required");
    await onSave(form);
    setForm({ academic_year_name: "", year_start_date: "", year_end_date: "" });
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Academic Year" size="sm">
      <div style={{ padding: "4px 0" }}>
        <Label required>Academic Year Name</Label>
        <input
          className="input"
          value={form.academic_year_name}
          onChange={(e) => setForm({ ...form, academic_year_name: e.target.value })}
          placeholder="e.g., 2024/2025"
        />

        <div style={{ marginTop: 12 }}>
          <Label required>Year Start Date</Label>
          <input
            type="date"
            className="input"
            value={form.year_start_date}
            onChange={(e) => setForm({ ...form, year_start_date: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <Label required>Year End Date</Label>
          <input
            type="date"
            className="input"
            value={form.year_end_date}
            onChange={(e) => setForm({ ...form, year_end_date: e.target.value })}
          />
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create Academic Year"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function StudentAdmissionForm({ admission, onSave, saving, editing }) {
  const [form, setForm] = useState({
    title: admission?.title || "",
    academic_year: admission?.academic_year || "",
    admission_start_date: admission?.admission_start_date || "",
    admission_end_date: admission?.admission_end_date || "",
    published: admission?.published ?? 0,
    enable_admission_application: admission?.enable_admission_application ?? 0,
    introduction: admission?.introduction || "",
    program_details: admission?.program_details || [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [academicYearModalOpen, setAcademicYearModalOpen] = useState(false);
  const [creatingAcademicYear, setCreatingAcademicYear] = useState(false);

  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [programs, years] = await Promise.all([getPrograms(), getAcademicYears()]);
        setProgramOptions(programs || []);
        setAcademicYearOptions(years || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (admission) {
      setForm({
        title: admission.title || "",
        academic_year: admission.academic_year || "",
        admission_start_date: admission.admission_start_date || "",
        admission_end_date: admission.admission_end_date || "",
        published: admission.published ?? 0,
        enable_admission_application: admission.enable_admission_application ?? 0,
        introduction: admission.introduction || "",
        program_details: admission.program_details || [],
      });
    }
  }, [admission]);

  function updateField(field, value) {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateProgramEntry(index, field, value) {
    const updated = [...form.program_details];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, program_details: updated }));
  }

  function addProgramEntry() {
    setForm((prev) => ({
      ...prev,
      program_details: [
        ...prev.program_details,
        { program: "", applicant_naming_series: "", min_age: "", max_age: "", application_fee: "", description: "" },
      ],
    }));
  }

  function removeProgramEntry(index) {
    setForm((prev) => ({ ...prev, program_details: prev.program_details.filter((_, i) => i !== index) }));
  }

  async function handleCreateAcademicYear(data) {
    setCreatingAcademicYear(true);
    try {
      const result = await createAcademicYear(data);
      setAcademicYearOptions((prev) => [...prev, { name: result.academic_year_name }]);
      setForm((prev) => ({ ...prev, academic_year: result.academic_year_name }));
      toast.success(`Academic Year "${result.academic_year_name}" created`);
      setAcademicYearModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingAcademicYear(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.academic_year) errors.academic_year = "Academic year is required";
    if (!form.admission_start_date) errors.admission_start_date = "Start date is required";
    if (!form.admission_end_date) errors.admission_end_date = "End date is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before saving");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NewAcademicYearModal
        open={academicYearModalOpen}
        onClose={() => setAcademicYearModalOpen(false)}
        onSave={handleCreateAcademicYear}
        saving={creatingAcademicYear}
      />

      <form onSubmit={handleSubmit}>
        <div className="panel" style={{ overflow: "visible" }}>
          <SectionPanel icon={Calendar} title="Admission Information">
            <div className="grid-form">
              <div className="field">
                <Label>Title</Label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Nursery Admission 2025/2026"
                />
              </div>

              <div className="field">
                {/* Add Academic Year button sits directly above the field, inline with the label */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Label required>Academic Year</Label>
                  <button
                    type="button"
                    onClick={() => setAcademicYearModalOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--brand)", fontSize: "12px", fontWeight: 600, padding: 0,
                    }}
                  >
                    <Plus size={13} />
                    Add Academic Year
                  </button>
                </div>
                <select
                  className="select"
                  value={form.academic_year}
                  onChange={(e) => updateField("academic_year", e.target.value)}
                  disabled={loadingOptions}
                >
                  <option value="">Select Academic Year</option>
                  {academicYearOptions.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
                {fieldErrors.academic_year && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.academic_year}
                  </div>
                )}
              </div>

              <div className="field">
                <Label required>Start Date</Label>
                <input
                  type="date"
                  className="input"
                  value={form.admission_start_date}
                  onChange={(e) => updateField("admission_start_date", e.target.value)}
                />
                {fieldErrors.admission_start_date && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.admission_start_date}
                  </div>
                )}
              </div>

              <div className="field">
                <Label required>End Date</Label>
                <input
                  type="date"
                  className="input"
                  value={form.admission_end_date}
                  onChange={(e) => updateField("admission_end_date", e.target.value)}
                />
                {fieldErrors.admission_end_date && (
                  <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.admission_end_date}
                  </div>
                )}
              </div>

              <div className="field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.published === 1}
                    onChange={(e) => updateField("published", e.target.checked ? 1 : 0)}
                  />
                  Published on website
                </label>
              </div>

              <div className="field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.enable_admission_application === 1}
                    onChange={(e) => updateField("enable_admission_application", e.target.checked ? 1 : 0)}
                  />
                  Enable Admission Application
                </label>
              </div>
            </div>
          </SectionPanel>

          <SectionPanel icon={BookOpen} title="Eligibility and Classes">
            <div style={{ marginBottom: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={addProgramEntry} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} />
                Add Class
              </button>
            </div>

            {form.program_details.length === 0 ? (
              <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No programs added yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ minWidth: "150px" }}>Class</th>
                      <th style={{ minWidth: "150px" }}>Naming Series</th>
                      <th style={{ minWidth: "100px" }}>Min Age</th>
                      <th style={{ minWidth: "100px" }}>Max Age</th>
                      <th style={{ minWidth: "120px" }}>Application Fee</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.program_details.map((entry, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="select"
                            value={entry.program || ""}
                            onChange={(e) => updateProgramEntry(index, "program", e.target.value)}
                          >
                            <option value="">Select Program</option>
                            {programOptions.map((item) => (
                              <option key={item.name} value={item.name}>{item.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            className="input"
                            value={entry.applicant_naming_series || ""}
                            onChange={(e) => updateProgramEntry(index, "applicant_naming_series", e.target.value)}
                            placeholder="e.g., EDU-APP-.YYYY.-"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input"
                            value={entry.min_age || ""}
                            onChange={(e) => updateProgramEntry(index, "min_age", e.target.value)}
                            placeholder="Min age"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input"
                            value={entry.max_age || ""}
                            onChange={(e) => updateProgramEntry(index, "max_age", e.target.value)}
                            placeholder="Max age"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input"
                            value={entry.application_fee || ""}
                            onChange={(e) => updateProgramEntry(index, "application_fee", e.target.value)}
                            placeholder="Fee"
                            min="0"
                          />
                        </td>
                        <td>
                          <button type="button" className="iconbtn" onClick={() => removeProgramEntry(index)} style={{ color: "var(--danger)" }}>
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
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || loading}>
            {saving || loading ? "Saving..." : editing ? "Update Admission" : "Create Admission"}
          </button>
        </div>
      </form>
    </>
  );
}
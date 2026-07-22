import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  FileText, 
  GraduationCap, 
  Calendar, 
  Users, 
  Building2, 
  DollarSign, 
  Layers, 
  Plus, 
  Trash2, 
  Search, 
  X,
  AlertCircle,
  Calculator,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentCategories,
  getFeeCategories,
  getCompanies,
  getReceivableAccounts,
  getCostCenters,
} from "../../../services/feeStructureService.js";

const EMPTY_FORM = {
  program: "",
  student_category: "",
  academic_year: "",
  academic_term: "",
  company: "",
  receivable_account: "",
  cost_center: "",
  components: [],
  total_amount: 0,
  docstatus: 0, // 0=Draft, 1=Submitted, 2=Cancelled
};

const EMPTY_COMPONENT_ENTRY = {
  fees_category: "",
  amount: 0,
  discount: 0,
  description: "",
  total: 0,
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

// Status badge component
function StatusBadge({ status }) {
  const statusMap = {
    0: { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)", icon: Clock },
    1: { label: "Submitted", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    2: { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
  };
  
  const s = statusMap[status] || statusMap[0];
  const Icon = s.icon;
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 500,
      backgroundColor: s.bg,
      color: s.color,
    }}>
      <Icon size={12} />
      {s.label}
    </span>
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
    opt.name.toLowerCase().includes(search.toLowerCase())
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
      return selected.name;
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
                  {option.name}
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

export default function FeeStructureForm({ feeStructure, onSave, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  
  // Options state
  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentCategoryOptions, setStudentCategoryOptions] = useState([]);
  const [feeCategoryOptions, setFeeCategoryOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [receivableAccountOptions, setReceivableAccountOptions] = useState({});
  const [costCenterOptions, setCostCenterOptions] = useState({});

  const isEditing = Boolean(feeStructure);
  const isDraft = feeStructure?.docstatus === 0;
  const isSubmitted = feeStructure?.docstatus === 1;
  const isCancelled = feeStructure?.docstatus === 2;
  const canEdit = isDraft || !isEditing;

  // Load all options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [programs, academicYears, studentCategories, feeCategories, companies] = await Promise.all([
          getPrograms(),
          getAcademicYears(),
          getStudentCategories(),
          getFeeCategories(),
          getCompanies(),
        ]);
        
        setProgramOptions(programs || []);
        setAcademicYearOptions(academicYears || []);
        setStudentCategoryOptions(studentCategories || []);
        setFeeCategoryOptions(feeCategories || []);
        setCompanyOptions(companies || []);
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Load academic terms when academic year changes
  useEffect(() => {
    if (form.academic_year) {
      getAcademicTerms(form.academic_year).then(terms => {
        setAcademicTermOptions(terms || []);
      });
    } else {
      setAcademicTermOptions([]);
    }
  }, [form.academic_year]);

  // Load receivable accounts and cost centers when company changes
  useEffect(() => {
    if (form.company) {
      Promise.all([
        getReceivableAccounts(form.company),
        getCostCenters(form.company),
      ]).then(([accounts, costCenters]) => {
        setReceivableAccountOptions(prev => ({
          ...prev,
          [form.company]: accounts || []
        }));
        setCostCenterOptions(prev => ({
          ...prev,
          [form.company]: costCenters || []
        }));
      });
    }
  }, [form.company]);

  useEffect(() => {
    if (!feeStructure) {
      setForm(EMPTY_FORM);
      setFieldErrors({});
      return;
    }

    setForm({
      program: feeStructure.program || "",
      student_category: feeStructure.student_category || "",
      academic_year: feeStructure.academic_year || "",
      academic_term: feeStructure.academic_term || "",
      company: feeStructure.company || "",
      receivable_account: feeStructure.receivable_account || "",
      cost_center: feeStructure.cost_center || "",
      components: feeStructure.components || [],
      total_amount: feeStructure.total_amount || 0,
      docstatus: feeStructure.docstatus || 0,
    });
  }, [feeStructure]);

  function updateField(field, value) {
    if (!canEdit) {
      toast.error("Cannot edit a submitted or cancelled document.");
      return;
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateComponent(index, field, value) {
    if (!canEdit) {
      toast.error("Cannot edit a submitted or cancelled document.");
      return;
    }
    const updatedComponents = [...form.components];
    updatedComponents[index][field] = value;
    
    const amount = parseFloat(updatedComponents[index].amount) || 0;
    const discount = parseFloat(updatedComponents[index].discount) || 0;
    updatedComponents[index].total = amount - (amount * (discount / 100));
    
    setForm((prev) => ({ ...prev, components: updatedComponents }));
    calculateTotalAmount(updatedComponents);
  }

  function calculateTotalAmount(components) {
    const total = components.reduce((sum, comp) => sum + (comp.total || 0), 0);
    setForm(prev => ({ ...prev, total_amount: total }));
  }

  function addComponent() {
    if (!canEdit) {
      toast.error("Cannot edit a submitted or cancelled document.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      components: [...prev.components, { ...EMPTY_COMPONENT_ENTRY }],
    }));
    setFieldErrors(prev => ({ ...prev, components: null }));
  }

  function removeComponent(index) {
    if (!canEdit) {
      toast.error("Cannot edit a submitted or cancelled document.");
      return;
    }
    setForm((prev) => {
      const updatedComponents = prev.components.filter((_, i) => i !== index);
      calculateTotalAmount(updatedComponents);
      return { ...prev, components: updatedComponents };
    });
  }

  function validateForm() {
    const errors = {};
    
    if (!form.program) {
      errors.program = "Class is required";
    }
    if (!form.academic_year) {
      errors.academic_year = "Academic Year is required";
    }
    if (!form.components || form.components.length === 0) {
      errors.components = "At least one component is required";
    } else {
      form.components.forEach((comp, index) => {
        if (!comp.fees_category) {
          errors[`component_${index}`] = "Fee Category is required";
        }
        if (!comp.amount || comp.amount <= 0) {
          errors[`component_${index}_amount`] = "Amount must be greater than 0";
        }
      });
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
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

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    setActionLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (window.confirm("Are you sure you want to cancel this fee structure?")) {
      setActionLoading(true);
      try {
        await onCancel(form);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setActionLoading(false);
      }
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Status Bar */}
      {isEditing && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "var(--surface-2)",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 500, fontSize: "13px" }}>Status:</span>
            <StatusBadge status={form.docstatus} />
            {isDraft && (
              <span style={{ fontSize: "12px", color: "var(--ink-3)" }}>
                (Editable)
              </span>
            )}
            {isSubmitted && (
              <span style={{ fontSize: "12px", color: "var(--ink-3)" }}>
                (Read-only)
              </span>
            )}
            {isCancelled && (
              <span style={{ fontSize: "12px", color: "var(--ink-3)" }}>
                (Read-only)
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {isDraft && (
              <>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={actionLoading || loading}
                >
                  {actionLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancel}
                  disabled={actionLoading || loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <SectionPanel icon={FileText} title="Fee Structure Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Class</Label>
            <SearchableSelect
              value={form.program}
              onChange={(val) => updateField("program", val)}
              options={programOptions}
              placeholder="Search class..."
              label="Class"
              disabled={!canEdit || loadingOptions}
            />
            {fieldErrors.program && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={14} />
                {fieldErrors.program}
              </div>
            )}
          </div>

          <div className="field">
            <Label>Student Category</Label>
            <SearchableSelect
              value={form.student_category}
              onChange={(val) => updateField("student_category", val)}
              options={studentCategoryOptions}
              placeholder="Search category..."
              label="Student Category"
              disabled={!canEdit || loadingOptions}
            />
          </div>

          <div className="field">
            <Label required>Academic Year</Label>
            <SearchableSelect
              value={form.academic_year}
              onChange={(val) => updateField("academic_year", val)}
              options={academicYearOptions}
              placeholder="Search year..."
              label="Academic Year"
              disabled={!canEdit || loadingOptions}
            />
            {fieldErrors.academic_year && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={14} />
                {fieldErrors.academic_year}
              </div>
            )}
          </div>

          <div className="field">
            <Label>Academic Term</Label>
            <SearchableSelect
              value={form.academic_term}
              onChange={(val) => updateField("academic_term", val)}
              options={academicTermOptions}
              placeholder="Search term..."
              label="Academic Term"
              disabled={!form.academic_year || !canEdit || loadingOptions}
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Calculator} title="Fee Components">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addComponent}
            disabled={!canEdit}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Component
          </button>
        </div>

        {fieldErrors.components && (
          <div style={{ 
            color: "var(--danger)", 
            fontSize: "13px", 
            marginBottom: "12px", 
            padding: "8px 12px",
            backgroundColor: "var(--danger-soft)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={16} />
            {fieldErrors.components}
          </div>
        )}

        {form.components.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No components added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ minWidth: "150px" }}>Fee Category *</th>
                  <th style={{ minWidth: "120px" }}>Amount *</th>
                  <th style={{ minWidth: "100px" }}>Discount (%)</th>
                  <th style={{ minWidth: "120px" }}>Total</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.components.map((component, index) => (
                  <tr key={index}>
                    <td>
                      <SearchableSelect
                        value={component.fees_category}
                        onChange={(val) => updateComponent(index, "fees_category", val)}
                        options={feeCategoryOptions}
                        placeholder="Search fee category..."
                        label="Fee Category"
                        disabled={!canEdit || loadingOptions}
                      />
                      {fieldErrors[`component_${index}`] && (
                        <div style={{ color: "var(--danger)", fontSize: "11px", marginTop: "2px" }}>
                          {fieldErrors[`component_${index}`]}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input"
                        value={component.amount || ""}
                        onChange={(e) => updateComponent(index, "amount", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={!canEdit}
                      />
                      {fieldErrors[`component_${index}_amount`] && (
                        <div style={{ color: "var(--danger)", fontSize: "11px", marginTop: "2px" }}>
                          {fieldErrors[`component_${index}_amount`]}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input"
                        value={component.discount || ""}
                        onChange={(e) => updateComponent(index, "discount", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        max="100"
                        disabled={!canEdit}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {component.total ? component.total.toFixed(2) : "0.00"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeComponent(index)}
                        disabled={!canEdit}
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, backgroundColor: "var(--surface-2)" }}>
                  <td colSpan="3" style={{ textAlign: "right" }}>Total Amount:</td>
                  <td colSpan="2">{form.total_amount ? form.total_amount.toFixed(2) : "0.00"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel icon={Building2} title="Accounts">
        <div className="grid-form">
          <div className="field">
            <Label required>Company</Label>
            <SearchableSelect
              value={form.company}
              onChange={(val) => updateField("company", val)}
              options={companyOptions}
              placeholder="Search company..."
              label="Company"
              disabled={!canEdit || loadingOptions}
            />
          </div>

          <div className="field">
            <Label required>Receivable Account</Label>
            <SearchableSelect
              value={form.receivable_account}
              onChange={(val) => updateField("receivable_account", val)}
              options={receivableAccountOptions[form.company] || []}
              placeholder="Search account..."
              label="Receivable Account"
              disabled={!form.company || !canEdit || loadingOptions}
            />
          </div>

          <div className="field">
            <Label>Cost Center</Label>
            <SearchableSelect
              value={form.cost_center}
              onChange={(val) => updateField("cost_center", val)}
              options={costCenterOptions[form.company] || []}
              placeholder="Search cost center..."
              label="Cost Center"
              disabled={!form.company || !canEdit || loadingOptions}
            />
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
        {isDraft && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || !canEdit}
          >
            {loading ? "Saving..." : isEditing ? "Update Fee Structure" : "Create Fee Structure"}
          </button>
        )}
        {!isEditing && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Fee Structure"}
          </button>
        )}
      </div>
    </form>
  );
}
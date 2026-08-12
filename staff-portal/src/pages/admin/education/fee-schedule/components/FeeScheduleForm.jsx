import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { 
  Calendar,
  FileText,
  GraduationCap,
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
  Clock,
  UserPlus
} from "lucide-react";
import {
  getFeeStructures,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentGroups,
  getTotalStudents,
  getCompanies,
  getReceivableAccounts,
  getCostCenters,
} from "@/services/education/feeScheduleService.js";
import { getFeeCategories } from "@/services/education/feeStructureService.js";
import api from "@/services/api.js";
import { getErrorMessage } from "@/utils/errors.js";
import ConfirmModal from "@/components/shared/ConfirmDialog";

const EMPTY_FORM = {
  fee_structure: "",
  posting_date: "",
  due_date: "",
  academic_year: "",
  academic_term: "",
  company: "",
  receivable_account: "",
  cost_center: "",
  student_groups: [],
  components: [],
  total_amount: 0,
  grand_total: 0,
  docstatus: 0,
  status: "Draft",
  program: "",
  student_category: "",
};

const EMPTY_STUDENT_GROUP_ENTRY = {
  student_group: "",
  total_students: 0,
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

function StatusBadge({ status }) {
  const statusMap = {
    "Draft": { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)", icon: Clock },
    "Cancelled": { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
    "Invoice Pending": { label: "Invoice Pending", color: "var(--warning)", bg: "var(--warning-soft)", icon: Clock },
    "Order Pending": { label: "Order Pending", color: "var(--warning)", bg: "var(--warning-soft)", icon: Clock },
    "In Process": { label: "In Process", color: "var(--info)", bg: "var(--info-soft)", icon: Clock },
    "Invoice Created": { label: "Invoice Created", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    "Order Created": { label: "Order Created", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    "Failed": { label: "Failed", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
  };
  
  const s = statusMap[status] || statusMap["Draft"];
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

// Function to get fee structure details using API
async function getFeeStructureDetails(name) {
  return api("frappe.client.get", {
    doctype: "Fee Structure",
    name: name,
  });
}

export default function FeeScheduleForm({ feeSchedule, onSave, onSubmit, onCancel, onGenerate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  
  // Options state
  const [feeStructureOptions, setFeeStructureOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [feeCategoryOptions, setFeeCategoryOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [receivableAccountOptions, setReceivableAccountOptions] = useState({});
  const [costCenterOptions, setCostCenterOptions] = useState({});
  const [componentOptions, setComponentOptions] = useState([]);

  const isEditing = Boolean(feeSchedule);
  const isDraft = feeSchedule?.docstatus === 0 || !isEditing;
  const isSubmitted = feeSchedule?.docstatus === 1;
  const isCancelled = feeSchedule?.docstatus === 2;
  const canEdit = !isEditing || (isEditing && isDraft);

  // Load all options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [feeStructures, programs, academicYears, feeCategories, companies] = await Promise.all([
          getFeeStructures(),
          getPrograms(),
          getAcademicYears(),
          getFeeCategories(),
          getCompanies(),
        ]);
        
        setFeeStructureOptions(feeStructures || []);
        setProgramOptions(programs || []);
        setAcademicYearOptions(academicYears || []);
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

  // Load student groups when program, academic_year, or academic_term changes
  useEffect(() => {
    if (form.program || form.academic_year) {
      getStudentGroups({
        program: form.program,
        academic_year: form.academic_year,
        academic_term: form.academic_term,
      }).then(groups => {
        setStudentGroupOptions(groups || []);
      });
    }
  }, [form.program, form.academic_year, form.academic_term]);

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

  // Load components from fee structure
  useEffect(() => {
    async function loadFeeStructureComponents() {
      if (!form.fee_structure) return;
      
      try {
        const result = await getFeeStructureDetails(form.fee_structure);
        if (result && result.components) {
          const components = result.components.map(comp => ({
            fees_category: comp.fees_category,
            amount: comp.amount || 0,
            discount: comp.discount || 0,
            description: comp.description || "",
            total: comp.total || 0,
          }));
          
          setForm(prev => ({
            ...prev,
            components: components,
            program: result.program || "",
            student_category: result.student_category || "",
            academic_year: result.academic_year || prev.academic_year,
            academic_term: result.academic_term || prev.academic_term,
            company: result.company || prev.company,
            receivable_account: result.receivable_account || prev.receivable_account,
            cost_center: result.cost_center || prev.cost_center,
          }));
          
          const total = components.reduce((sum, comp) => sum + (comp.total || 0), 0);
          setForm(prev => {
            const totalStudents = prev.student_groups.reduce((sum, group) => sum + (group.total_students || 0), 0);
            const grandTotal = totalStudents * total;
            return {
              ...prev,
              total_amount: total,
              grand_total: grandTotal,
            };
          });
        }
      } catch (err) {
        console.error("Error loading fee structure components:", err);
        toast.error("Failed to load fee structure details");
      }
    }
    
    loadFeeStructureComponents();
  }, [form.fee_structure]);

  useEffect(() => {
    if (!feeSchedule) {
      setForm({
        ...EMPTY_FORM,
        posting_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
      });
      setFieldErrors({});
      return;
    }

    setForm({
      fee_structure: feeSchedule.fee_structure || "",
      posting_date: feeSchedule.posting_date || "",
      due_date: feeSchedule.due_date || "",
      academic_year: feeSchedule.academic_year || "",
      academic_term: feeSchedule.academic_term || "",
      company: feeSchedule.company || "",
      receivable_account: feeSchedule.receivable_account || "",
      cost_center: feeSchedule.cost_center || "",
      student_groups: feeSchedule.student_groups || [],
      components: feeSchedule.components || [],
      total_amount: feeSchedule.total_amount || 0,
      grand_total: feeSchedule.grand_total || 0,
      docstatus: feeSchedule.docstatus || 0,
      status: feeSchedule.status || "Draft",
      program: feeSchedule.program || "",
      student_category: feeSchedule.student_category || "",
    });
  }, [feeSchedule]);

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

  function updateStudentGroup(index, field, value) {
    if (!canEdit) return;
    const updatedGroups = [...form.student_groups];
    updatedGroups[index][field] = value;
    
    if (field === 'student_group' && value) {
      getTotalStudents(value, form.academic_year, form.academic_term).then(total => {
        updatedGroups[index].total_students = total || 0;
        setForm((prev) => ({ ...prev, student_groups: updatedGroups }));
        calculateGrandTotal(updatedGroups);
      });
    } else {
      setForm((prev) => ({ ...prev, student_groups: updatedGroups }));
      calculateGrandTotal(updatedGroups);
    }
  }

  function addStudentGroup() {
    if (!canEdit) return;
    setForm((prev) => ({
      ...prev,
      student_groups: [...prev.student_groups, { ...EMPTY_STUDENT_GROUP_ENTRY }],
    }));
  }

  function removeStudentGroup(index) {
    if (!canEdit) return;
    const updatedGroups = form.student_groups.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, student_groups: updatedGroups }));
    calculateGrandTotal(updatedGroups);
  }

  function calculateGrandTotal(studentGroups) {
    const totalStudents = studentGroups.reduce((sum, group) => sum + (group.total_students || 0), 0);
    const grandTotal = totalStudents * form.total_amount;
    setForm(prev => ({ ...prev, grand_total: grandTotal }));
  }

  function validateForm() {
    const errors = {};
    
    if (!form.fee_structure) {
      errors.fee_structure = "Fee Structure is required";
    }
    if (!form.posting_date) {
      errors.posting_date = "Posting Date is required";
    }
    if (!form.due_date) {
      errors.due_date = "Due Date is required";
    }
    if (!form.academic_year) {
      errors.academic_year = "Academic Year is required";
    }
    if (!form.student_groups || form.student_groups.length === 0) {
      errors.student_groups = "At least one class arm is required";
    } else {
      form.student_groups.forEach((group, index) => {
        if (!group.student_group) {
          errors[`group_${index}`] = "Class Arm is required";
        }
      });
    }
    if (!form.components || form.components.length === 0) {
      errors.components = "At least one component is required";
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
      const cleanedData = cleanFormData(form);
      await onSave(cleanedData);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function cleanFormData(data) {
    const cleaned = { ...data };
    
    if (cleaned.student_groups) {
      cleaned.student_groups = cleaned.student_groups.map(group => ({
        student_group: typeof group.student_group === 'string' ? group.student_group : String(group.student_group || ''),
        total_students: Number(group.total_students) || 0,
      }));
    }
    
    if (cleaned.components) {
      cleaned.components = cleaned.components.map(comp => ({
        fees_category: typeof comp.fees_category === 'string' ? comp.fees_category : String(comp.fees_category || ''),
        amount: Number(comp.amount) || 0,
        discount: Number(comp.discount) || 0,
        description: comp.description || '',
        total: Number(comp.total) || 0,
      }));
    }
    
    return cleaned;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      const cleanedData = cleanFormData(form);
      await onSubmit(cleanedData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelConfirm() {
    setActionLoading(true);
    try {
      const cleanedData = cleanFormData(form);
      await onCancel(cleanedData);
      setCancelModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGenerateConfirm() {
    setActionLoading(true);
    try {
      await onGenerate(form);
      setGenerateModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Cancel Modal */}
      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Fee Schedule?"
        message="This action will cancel the fee schedule. This cannot be undone."
        confirmLabel="Cancel Schedule"
        variant="destructive"
        busy={actionLoading}
      />

      {/* Generate Modal */}
      <ConfirmModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onConfirm={handleGenerateConfirm}
        title="Generate Fees?"
        message="This will generate fees for all students in the selected groups. Are you sure you want to continue?"
        confirmLabel="Generate"
        variant="primary"
        busy={actionLoading}
      />

      {/* Status Bar - only show for existing documents */}
      {isEditing && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "var(--surface-2)",
          borderRadius: "8px",
          border: "1px solid hsl(var(--border))",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: "13px" }}>Status:</span>
            <StatusBadge status={form.status || "Draft"} />
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
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {isDraft && isEditing && (
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
                  onClick={() => setCancelModalOpen(true)}
                  disabled={actionLoading || loading}
                >
                  Cancel
                </button>
              </>
            )}
            {isSubmitted && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setGenerateModalOpen(true)}
                disabled={actionLoading}
              >
                {actionLoading ? "Generating..." : "Generate Fees"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rest of the form remains the same */}
      <SectionPanel icon={FileText} title="Fee Schedule Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Fee Structure</Label>
            <SearchableSelect
              value={form.fee_structure}
              onChange={(val) => updateField("fee_structure", val)}
              options={feeStructureOptions}
              placeholder="Search fee structure..."
              label="Fee Structure"
              disabled={!canEdit || loadingOptions}
            />
            {fieldErrors.fee_structure && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={14} />
                {fieldErrors.fee_structure}
              </div>
            )}
          </div>

          <div className="field">
            <Label>Class</Label>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "var(--surface-2)",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border))",
              color: "var(--ink)",
              minHeight: "38px",
              display: "flex",
              alignItems: "center",
            }}>
              {form.program || "Auto-populated from Fee Structure"}
            </div>
          </div>

          <div className="field">
            <Label>Student Category</Label>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "var(--surface-2)",
              borderRadius: "6px",
              border: "1px solid hsl(var(--border))",
              color: "var(--ink)",
              minHeight: "38px",
              display: "flex",
              alignItems: "center",
            }}>
              {form.student_category || "Auto-populated from Fee Structure"}
            </div>
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

          <div className="field">
            <Label required>Posting Date</Label>
            <input
              type="date"
              className="input"
              value={form.posting_date}
              onChange={(e) => updateField("posting_date", e.target.value)}
              disabled={!canEdit}
            />
            {fieldErrors.posting_date && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.posting_date}
              </div>
            )}
          </div>

          <div className="field">
            <Label required>Due Date</Label>
            <input
              type="date"
              className="input"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              disabled={!canEdit}
            />
            {fieldErrors.due_date && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.due_date}
              </div>
            )}
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Users} title="Class Arms">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addStudentGroup}
            disabled={!canEdit}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Class Arm
          </button>
        </div>

        {fieldErrors.student_groups && (
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
            {fieldErrors.student_groups}
          </div>
        )}

        {form.student_groups.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No class arms added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ minWidth: "200px" }}>Class Arm *</th>
                  <th style={{ minWidth: "120px" }}>Total Students</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.student_groups.map((group, index) => (
                  <tr key={index}>
                    <td>
                      <SearchableSelect
                        value={group.student_group}
                        onChange={(val) => updateStudentGroup(index, "student_group", val)}
                        options={studentGroupOptions}
                        placeholder="Search class arm..."
                        label="Class Arm"
                        disabled={!canEdit || loadingOptions}
                      />
                      {fieldErrors[`group_${index}`] && (
                        <div style={{ color: "var(--danger)", fontSize: "11px", marginTop: "2px" }}>
                          {fieldErrors[`group_${index}`]}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, textAlign: "center" }}>
                      {group.total_students || 0}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeStudentGroup(index)}
                        disabled={!canEdit}
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

      <SectionPanel icon={Calculator} title="Fee Components">
        {form.components.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            Components will be auto-populated from the selected Fee Structure.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ minWidth: "150px" }}>Fee Category</th>
                  <th style={{ minWidth: "120px" }}>Amount</th>
                  <th style={{ minWidth: "100px" }}>Discount (%)</th>
                  <th style={{ minWidth: "120px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {form.components.map((component, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 550 }}>{component.fees_category || "—"}</td>
                    <td className="tnum">
                      {component.amount ? `₦${component.amount.toLocaleString()}` : "—"}
                    </td>
                    <td>{component.discount || "0"}%</td>
                    <td className="tnum" style={{ fontWeight: 600 }}>
                      {component.total ? `₦${component.total.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, backgroundColor: "var(--surface-2)" }}>
                  <td colSpan="3" style={{ textAlign: "right" }}>Total Amount per Student:</td>
                  <td>{form.total_amount ? `₦${form.total_amount.toLocaleString()}` : "0.00"}</td>
                </tr>
                <tr style={{ fontWeight: 700, backgroundColor: "var(--surface-2)" }}>
                  <td colSpan="3" style={{ textAlign: "right" }}>Grand Total (All Students):</td>
                  <td>{form.grand_total ? `₦${form.grand_total.toLocaleString()}` : "0.00"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel icon={Building2} title="Accounts">
        <div className="grid-form">
          <div className="field">
            <Label>Company</Label>
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
            <Label>Receivable Account</Label>
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
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading || !canEdit}
        >
          {loading ? "Saving..." : isEditing ? "Update Fee Schedule" : "Create Fee Schedule"}
        </button>
      </div>
    </form>
  );
}
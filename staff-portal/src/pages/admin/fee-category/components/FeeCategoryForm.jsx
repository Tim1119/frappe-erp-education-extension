import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Tag, 
  FileText, 
  Building2, 
  DollarSign, 
  Layers, 
  Plus, 
  Trash2, 
  Search, 
  X,
  Package,
  AlertCircle
} from "lucide-react";
import {
  getCompanies,
  getAccounts,
  getCostCenters,
} from "@/services/feeCategoryService.js";

const EMPTY_FORM = {
  category_name: "",
  description: "",
  item: "",
  item_defaults: [],
};

const EMPTY_DEFAULT_ENTRY = {
  company: "",
  income_account: "",
  selling_cost_center: "",
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

export default function FeeCategoryForm({ feeCategory, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState({});
  const [costCenterOptions, setCostCenterOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load companies
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const companies = await getCompanies();
        setCompanyOptions(companies || []);
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Load accounts and cost centers when company changes
  const fetchAccountsAndCostCenters = async (company, index) => {
    if (!company) return;
    
    try {
      const [accounts, costCenters] = await Promise.all([
        getAccounts(company),
        getCostCenters(company),
      ]);
      
      setAccountOptions(prev => ({
        ...prev,
        [company]: accounts || []
      }));
      
      setCostCenterOptions(prev => ({
        ...prev,
        [company]: costCenters || []
      }));
    } catch (err) {
      console.error("Error fetching accounts/cost centers:", err);
    }
  };

  useEffect(() => {
    if (!feeCategory) {
      setForm(EMPTY_FORM);
      setFieldErrors({});
      return;
    }

    setForm({
      category_name: feeCategory.category_name || "",
      description: feeCategory.description || "",
      item: feeCategory.item || "",
      item_defaults: feeCategory.item_defaults || [],
    });
  }, [feeCategory]);

  function updateField(field, value) {
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateDefaultEntry(index, field, value) {
    const updatedDefaults = [...form.item_defaults];
    updatedDefaults[index][field] = value;
    
    // Clear errors
    setFieldErrors(prev => ({ ...prev, item_defaults: null }));
    
    // If company changed, fetch accounts and cost centers
    if (field === 'company' && value) {
      fetchAccountsAndCostCenters(value, index);
      // Clear dependent fields
      updatedDefaults[index].income_account = '';
      updatedDefaults[index].selling_cost_center = '';
    }
    
    // Check for duplicate companies
    const companies = updatedDefaults.map(d => d.company).filter(c => c);
    const uniqueCompanies = new Set(companies);
    if (companies.length !== uniqueCompanies.size) {
      setFieldErrors(prev => ({ 
        ...prev, 
        item_defaults: "Cannot set multiple Item Defaults for the same company." 
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, item_defaults: null }));
    }
    
    setForm((prev) => ({ ...prev, item_defaults: updatedDefaults }));
  }

  function addDefaultEntry() {
    setForm((prev) => ({
      ...prev,
      item_defaults: [...prev.item_defaults, { ...EMPTY_DEFAULT_ENTRY }],
    }));
    // Clear errors
    setFieldErrors(prev => ({ ...prev, item_defaults: null }));
  }

  function removeDefaultEntry(index) {
    setForm((prev) => ({
      ...prev,
      item_defaults: prev.item_defaults.filter((_, i) => i !== index),
    }));
    // Clear errors
    setFieldErrors(prev => ({ ...prev, item_defaults: null }));
  }

  function validateForm() {
    const errors = {};
    
    if (!form.category_name.trim()) {
      errors.category_name = "Category name is required";
    }
    
    // Check for duplicate companies
    const companies = form.item_defaults.map(d => d.company).filter(c => c);
    const uniqueCompanies = new Set(companies);
    if (companies.length !== uniqueCompanies.size) {
      errors.item_defaults = "Cannot set multiple Item Defaults for the same company.";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
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
      // Handle validation errors from the server
      if (err.messages) {
        toast.error(err.messages.join('\n'));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const isEditing = Boolean(feeCategory);

  return (
    <form onSubmit={submit}>
      <SectionPanel icon={Tag} title="Fee Category Information">
        <div className="grid-form">
          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label required>Category Name</Label>
            <input
              className="input"
              value={form.category_name}
              onChange={(e) => updateField("category_name", e.target.value)}
              placeholder="Enter category name"
              disabled={isEditing} // Can't change name after creation
              style={{
                backgroundColor: isEditing ? "var(--surface-2)" : "var(--surface)",
                color: isEditing ? "var(--ink-3)" : "var(--ink)",
              }}
              data-error={!!fieldErrors.category_name}
            />
            {fieldErrors.category_name && (
              <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={14} />
                {fieldErrors.category_name}
              </div>
            )}
            {isEditing && (
              <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                Category name cannot be changed after creation.
              </div>
            )}
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

          {/* Read-only Item field - matches Frappe doctype */}
          <div className="field" style={{ gridColumn: "span 2" }}>
            <Label>Item</Label>
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
              }}
            >
              {form.item ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={16} style={{ color: "var(--ink-3)" }} />
                  <span>{form.item}</span>
                </div>
              ) : (
                <span style={{ color: "var(--ink-4)" }}>
                  Auto-populated when linked to an Item
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
              This field is automatically populated when the fee category is created.
            </div>
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={Building2} title="Accounting Defaults">
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addDefaultEntry}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} />
            Add Row
          </button>
        </div>

        {fieldErrors.item_defaults && (
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
            {fieldErrors.item_defaults}
          </div>
        )}

        {form.item_defaults.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No accounting defaults added yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ minWidth: "150px" }}>Company *</th>
                  <th style={{ minWidth: "200px" }}>Default Income Account</th>
                  <th style={{ minWidth: "180px" }}>Default Cost Center</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.item_defaults.map((defaultEntry, index) => (
                  <tr key={index}>
                    <td>
                      <SearchableSelect
                        value={defaultEntry.company}
                        onChange={(val) => updateDefaultEntry(index, "company", val)}
                        options={companyOptions}
                        placeholder="Search company..."
                        label="Company"
                        disabled={loadingOptions}
                      />
                    </td>
                    <td>
                      <SearchableSelect
                        value={defaultEntry.income_account}
                        onChange={(val) => updateDefaultEntry(index, "income_account", val)}
                        options={accountOptions[defaultEntry.company] || []}
                        placeholder="Search account..."
                        label="Account"
                        disabled={!defaultEntry.company || loadingOptions}
                      />
                    </td>
                    <td>
                      <SearchableSelect
                        value={defaultEntry.selling_cost_center}
                        onChange={(val) => updateDefaultEntry(index, "selling_cost_center", val)}
                        options={costCenterOptions[defaultEntry.company] || []}
                        placeholder="Search cost center..."
                        label="Cost Center"
                        disabled={!defaultEntry.company || loadingOptions}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => removeDefaultEntry(index)}
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
          {loading ? "Saving..." : isEditing ? "Update Fee Category" : "Create Fee Category"}
        </button>
      </div>
    </form>
  );
}
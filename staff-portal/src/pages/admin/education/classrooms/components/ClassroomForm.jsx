import { useState, useEffect } from "react";
import { Building2, Users, Hash } from "lucide-react";

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

export default function ClassroomForm({ classroom, onSave, saving, editing }) {
  const [form, setForm] = useState({
    room_name: classroom?.room_name || "",
    room_number: classroom?.room_number || "",
    seating_capacity: classroom?.seating_capacity || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classroom) {
      setForm({
        room_name: classroom.room_name || "",
        room_number: classroom.room_number || "",
        seating_capacity: classroom.seating_capacity || "",
      });
    }
  }, [classroom]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    const errors = {};
    if (!form.room_name.trim()) {
      errors.room_name = "Classroom name is required";
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
    <form onSubmit={handleSubmit}>
      <div className="panel" style={{ overflow: "visible" }}>
        <SectionPanel icon={Building2} title="Classroom Information">
          <div className="grid-form">
            <div className="field">
              <Label required>Classroom Name</Label>
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
                  {form.room_name || "—"}
                </div>
              ) : (
                <input
                  className="input"
                  value={form.room_name}
                  onChange={(e) => updateField("room_name", e.target.value)}
                  placeholder="Enter classroom name"
                />
              )}
              {fieldErrors.room_name && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.room_name}
                </div>
              )}
              {editing && (
                <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                  Classroom name cannot be changed after creation.
                </div>
              )}
            </div>

            <div className="field">
              <Label>Classroom Number</Label>
              <input
                className="input"
                value={form.room_number}
                onChange={(e) => updateField("room_number", e.target.value)}
                placeholder="Enter classroom number"
              />
            </div>

            <div className="field">
              <Label>Seating Capacity</Label>
              <input
                type="number"
                className="input"
                value={form.seating_capacity}
                onChange={(e) => updateField("seating_capacity", e.target.value)}
                placeholder="Enter seating capacity"
                min="0"
              />
            </div>
          </div>
        </SectionPanel>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving || loading ? "Saving..." : editing ? "Update Classroom" : "Create Classroom"}
        </button>
      </div>
    </form>
  );
}
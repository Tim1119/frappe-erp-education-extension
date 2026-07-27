import { useState } from "react";
import { Plus, Trash2, Users2, Contact, BookOpen } from "lucide-react";

function SectionPanel({ icon: Icon, title, sub, right, children }) {
  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="panel-head">
        <div>
          <div
            className="panel-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Icon size={15} style={{ color: "var(--ink-4)" }} />
            {title}
          </div>
          {sub && <div className="panel-sub">{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: "10px 20px 26px" }}>{children}</div>
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

function Toggle({ on, onChange }) {
  return (
    <div
      className={on ? "toggle on" : "toggle"}
      onClick={() => onChange(!on)}
      style={{ cursor: "pointer" }}
    >
      <div className="knob" />
    </div>
  );
}

const GROUP_BASED_ON = ["Batch", "Course", "Activity"];
// Display-only labels — the underlying value sent to the backend must stay
// "Course" (it's a fixed Frappe select option), but the school calls this
// "Subject", so we decouple what the user sees from what gets saved.
const GROUP_BASED_ON_LABELS = { Batch: "Batch", Course: "Subject", Activity: "Activity" };

const emptyInstructorRow = () => ({ instructor: "", instructor_name: "" });
const emptyStudentRow = () => ({
  student: "",
  student_name: "",
  group_roll_number: "",
  active: true,
});

export default function ClassArmForm({ group, options, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    academic_year: group?.academic_year || "",
    academic_term: group?.academic_term || "",
    group_based_on: group?.group_based_on || "Batch",
    student_group_name: group?.student_group_name || "",
    max_strength: group?.max_strength ?? 0,
    program: group?.program || "",
    course: group?.course || "",
    batch: group?.batch || "",
    student_category: group?.student_category || "",
    disabled: group?.disabled ?? 0,
    instructors: (group?.instructors || []).map((i) => ({
      instructor: i.instructor || "",
      instructor_name: i.instructor_name || "",
    })),
    students: (group?.students || []).map((s) => ({
      student: s.student || "",
      student_name: s.student_name || "",
      group_roll_number: s.group_roll_number ?? "",
      active: s.active !== 0,
    })),
  }));

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Instructors ──────────────────────────────────────────────────────
  function addInstructor() {
    set("instructors", [...form.instructors, emptyInstructorRow()]);
  }
  function updateInstructor(index, key, value) {
    const rows = form.instructors.map((row, i) => {
      if (i !== index) return row;
      const next = { ...row, [key]: value };
      if (key === "instructor") {
        const match = options.instructors.find((o) => o.name === value);
        next.instructor_name = match?.instructor_name || "";
      }
      return next;
    });
    set("instructors", rows);
  }
  function removeInstructor(index) {
    set(
      "instructors",
      form.instructors.filter((_, i) => i !== index),
    );
  }

  // ── Students ─────────────────────────────────────────────────────────
  function addStudent() {
    set("students", [...form.students, emptyStudentRow()]);
  }
  function updateStudent(index, key, value) {
    const rows = form.students.map((row, i) => {
      if (i !== index) return row;
      const next = { ...row, [key]: value };
      if (key === "student") {
        const match = options.students.find((o) => o.name === value);
        next.student_name = match?.student_name || "";
      }
      return next;
    });
    set("students", rows);
  }
  function removeStudent(index) {
    set(
      "students",
      form.students.filter((_, i) => i !== index),
    );
  }

  function submit(e) {
    e.preventDefault();
    onSave(form);
  }

  const showProgram = form.group_based_on !== "Activity";
  const showCourse = form.group_based_on === "Course";
  const showBatch = form.group_based_on === "Batch";

  return (
    <form onSubmit={submit}>
      <SectionPanel icon={BookOpen} title="Group Details">
        <div className="grid-form">
          <div className="field">
            <Label required>Academic Year</Label>
            <select
              className="select"
              required
              value={form.academic_year}
              onChange={(e) => set("academic_year", e.target.value)}
            >
              <option value="">Select</option>
              {options.academic_years.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <Label required>Group Based On</Label>
            <select
              className="select"
              value={form.group_based_on}
              onChange={(e) => set("group_based_on", e.target.value)}
            >
              {GROUP_BASED_ON.map((x) => (
                <option key={x} value={x}>{GROUP_BASED_ON_LABELS[x]}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <Label required>Class Arm Name</Label>
            <input
              className="input"
              required
              value={form.student_group_name}
              onChange={(e) => set("student_group_name", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Max Strength</Label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.max_strength}
              onChange={(e) => set("max_strength", Number(e.target.value))}
            />
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
              Set 0 for no limit
            </div>
          </div>

          <div className="field">
            <Label>Academic Term</Label>
            <select
              className="select"
              value={form.academic_term}
              onChange={(e) => set("academic_term", e.target.value)}
            >
              <option value="">Select</option>
              {options.academic_terms.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>

          {showProgram && (
            <div className="field">
              <Label>Class</Label>
              <select
                className="select"
                value={form.program}
                onChange={(e) => set("program", e.target.value)}
              >
                <option value="">Select</option>
                {options.programs.map((x) => (
                  <option key={x.name} value={x.name}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showCourse && (
            <div className="field">
              <Label>Subject</Label>
              <select
                className="select"
                value={form.course}
                onChange={(e) => set("course", e.target.value)}
              >
                <option value="">Select</option>
                {options.courses.map((x) => (
                  <option key={x.name} value={x.name}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showBatch && (
            <div className="field">
              <Label>Batch</Label>
              <select
                className="select"
                value={form.batch}
                onChange={(e) => set("batch", e.target.value)}
              >
                <option value="">Select</option>
                {options.batches.map((x) => (
                  <option key={x.name} value={x.name}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <Label>Student Category</Label>
            <select
              className="select"
              value={form.student_category}
              onChange={(e) => set("student_category", e.target.value)}
            >
              <option value="">Select</option>
              {options.student_categories.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 18,
          }}
        >
          <Toggle
            on={Boolean(form.disabled)}
            onChange={(v) => set("disabled", v ? 1 : 0)}
          />
          <div>
            <div style={{ fontWeight: 550, fontSize: 13.5 }}>Disabled</div>
            <div className="muted" style={{ fontSize: 11.5 }}>
              Hide this class arm from active use across the portal
            </div>
          </div>
        </div>
      </SectionPanel>

      <SectionPanel
        icon={Contact}
        title="Teachers"
        sub={`${form.instructors.length} assigned`}
        right={
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addInstructor}
          >
            <Plus size={13} />
            Add Teacher
          </button>
        }
      >
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 44 }}>No.</th>
              <th>Teacher</th>
              <th>Teacher Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {form.instructors.map((row, index) => (
              <tr key={index} className="row">
                <td className="tnum muted">{index + 1}</td>
                <td>
                  <select
                    className="select"
                    value={row.instructor}
                    onChange={(e) =>
                      updateInstructor(index, "instructor", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {options.instructors.map((i) => (
                      <option value={i.name} key={i.name}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="muted2">{row.instructor_name || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="iconbtn"
                    style={{ width: 30, height: 30 }}
                    onClick={() => removeInstructor(index)}
                  >
                    <Trash2
                      size={14}
                      style={{ color: "var(--danger-ink, #ef4444)" }}
                    />
                  </button>
                </td>
              </tr>
            ))}
            {form.instructors.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="muted"
                  style={{ textAlign: "center", padding: 20 }}
                >
                  No instructors added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionPanel>

      <SectionPanel
        icon={Users2}
        title="Students"
        sub={`${form.students.length} in this class arm`}
        right={
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addStudent}
          >
            <Plus size={13} />
            Add Student
          </button>
        }
      >
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 44 }}>No.</th>
              <th>Student</th>
              <th style={{ width: 120 }}>Roll No.</th>
              <th style={{ width: 80 }}>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {form.students.map((row, index) => (
              <tr key={index} className="row">
                <td className="tnum muted">{index + 1}</td>
                <td>
                  <select
                    className="select"
                    value={row.student}
                    onChange={(e) =>
                      updateStudent(index, "student", e.target.value)
                    }
                  >
                    <option value="">Select student</option>
                    {options.students.map((s) => (
                      <option value={s.name} key={s.name}>
                        {s.student_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={row.group_roll_number}
                    onChange={(e) =>
                      updateStudent(index, "group_roll_number", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) =>
                      updateStudent(index, "active", e.target.checked)
                    }
                    style={{ width: 16, height: 16 }}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="iconbtn"
                    style={{ width: 30, height: 30 }}
                    onClick={() => removeStudent(index)}
                  >
                    <Trash2
                      size={14}
                      style={{ color: "var(--danger-ink, #ef4444)" }}
                    />
                  </button>
                </td>
              </tr>
            ))}
            {form.students.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="muted"
                  style={{ textAlign: "center", padding: 20 }}
                >
                  No students assigned yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionPanel>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingBottom: 8,
        }}
      >
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : group ? "Update Class Arm" : "Create Class Arm"}
        </button>
      </div>
    </form>
  );
}
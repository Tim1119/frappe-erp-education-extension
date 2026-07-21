import { useEffect, useState } from "react";
import { GraduationCap, MapPin, Users as UsersIcon } from "lucide-react";
import GuardianTable from "./GuardianTable.jsx";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY_FORM = {
  student_name: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "Male",
  date_of_birth: "",
  blood_group: "",
  nationality: "",
  student_email_id: "",
  student_mobile_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  country: "Nigeria",
  pincode: "",
  enabled: 1,
};

function SectionPanel({ icon: Icon, title, children }) {
  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="panel-head">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
      </div>
      <div style={{ padding: "4px 18px 22px" }}>{children}</div>
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

export default function StudentForm({ student, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardians, setGuardians] = useState([]);

  useEffect(() => {
    if (!student) {
      setForm(EMPTY_FORM);
      setGuardians([]);
      return;
    }

    setForm({
      student_name: student.student_name || "",
      first_name: student.first_name || "",
      middle_name: student.middle_name || "",
      last_name: student.last_name || "",
      gender: student.gender || "Male",
      date_of_birth: student.date_of_birth || "",
      blood_group: student.blood_group || "",
      nationality: student.nationality || "",
      student_email_id: student.student_email_id || "",
      student_mobile_number: student.student_mobile_number || "",
      address_line_1: student.address_line_1 || "",
      address_line_2: student.address_line_2 || "",
      city: student.city || "",
      state: student.state || "",
      country: student.country || "Nigeria",
      pincode: student.pincode || "",
      enabled: student.enabled ?? 1,
    });
    setGuardians(student.guardians || []);
  }, [student]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave({ ...form, guardians });
  }

  return (
    <form onSubmit={submit}>
      <SectionPanel icon={GraduationCap} title="Personal Information">
        <div className="grid-form">
          <div className="field">
            <Label required>Student Name</Label>
            <input
              className="input"
              value={form.student_name}
              required
              onChange={(e) => updateField("student_name", e.target.value)}
            />
          </div>

          <div className="field">
            <Label required>First Name</Label>
            <input
              className="input"
              value={form.first_name}
              required
              onChange={(e) => updateField("first_name", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Middle Name</Label>
            <input
              className="input"
              value={form.middle_name}
              onChange={(e) => updateField("middle_name", e.target.value)}
            />
          </div>

          <div className="field">
            <Label required>Last Name</Label>
            <input
              className="input"
              value={form.last_name}
              required
              onChange={(e) => updateField("last_name", e.target.value)}
            />
          </div>

          <div className="field">
            <Label required>Gender</Label>
            <select
              className="select"
              value={form.gender}
              required
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="field">
            <Label required>Date of Birth</Label>
            <input
              type="date"
              className="input"
              value={form.date_of_birth}
              required
              onChange={(e) => updateField("date_of_birth", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Blood Group</Label>
            <select
              className="select"
              value={form.blood_group}
              onChange={(e) => updateField("blood_group", e.target.value)}
            >
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <Label>Nationality</Label>
            <input
              className="input"
              value={form.nationality}
              onChange={(e) => updateField("nationality", e.target.value)}
            />
          </div>

          <div className="field">
            <Label required>Email</Label>
            <input
              type="email"
              className="input"
              value={form.student_email_id}
              required
              onChange={(e) => updateField("student_email_id", e.target.value)}
            />
          </div>

          <div className="field">
            <Label required>Phone</Label>
            <input
              className="input"
              value={form.student_mobile_number}
              required
              onChange={(e) =>
                updateField("student_mobile_number", e.target.value)
              }
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={MapPin} title="Address">
        <div className="grid-form">
          <div className="field">
            <Label>Address Line 1</Label>
            <input
              className="input"
              value={form.address_line_1}
              onChange={(e) => updateField("address_line_1", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Address Line 2</Label>
            <input
              className="input"
              value={form.address_line_2}
              onChange={(e) => updateField("address_line_2", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>City</Label>
            <input
              className="input"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>State</Label>
            <input
              className="input"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Country</Label>
            <input
              className="input"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </div>

          <div className="field">
            <Label>Pincode</Label>
            <input
              className="input"
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel icon={UsersIcon} title="Guardians">
        <GuardianTable value={guardians} onChange={setGuardians} />
      </SectionPanel>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingBottom: 8,
        }}
      >
        <button type="submit" className="btn btn-primary">
          {student ? "Update Student" : "Create Student"}
        </button>
      </div>
    </form>
  );
}

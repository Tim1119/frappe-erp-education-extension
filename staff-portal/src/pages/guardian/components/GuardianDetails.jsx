import { User, Mail, Phone, Briefcase, GraduationCap, Calendar, MapPin, Users, Heart } from "lucide-react";
import { Avatar, StatusBadge, EmptyState } from "../../../components/ui/Primitives.jsx";

function Item({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value || "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
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
    </div>
  );
}

export default function GuardianDetails({ guardian }) {
  if (!guardian) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar
            name={guardian.guardian_name}
            src={guardian.image}
            size={64}
            round
          />
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {guardian.guardian_name}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {guardian.email_address && (
                <span className="badge" style={{ background: "var(--surface-2)" }}>
                  <Mail size={12} />
                  {guardian.email_address}
                </span>
              )}
              {guardian.mobile_number && (
                <span className="badge" style={{ background: "var(--surface-2)" }}>
                  <Phone size={12} />
                  {guardian.mobile_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="panel">
        <SectionHead icon={User} title="Personal Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Guardian ID" value={guardian.name} />
          <Item label="Date of Birth" value={guardian.date_of_birth} />
          <Item label="Education" value={guardian.education} />
        </div>
      </div>

      {/* Professional Information */}
      <div className="panel">
        <SectionHead icon={Briefcase} title="Professional Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Occupation" value={guardian.occupation} />
          <Item label="Designation" value={guardian.designation} />
          <Item label="Work Address" value={guardian.work_address} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="panel">
        <SectionHead icon={Phone} title="Contact Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Mobile Number" value={guardian.mobile_number} />
          <Item label="Alternate Number" value={guardian.alternate_number} />
          <Item label="Email Address" value={guardian.email_address} />
        </div>
      </div>

      {/* Students */}
      <div className="panel">
        <SectionHead 
          icon={Users} 
          title="Students" 
          sub={`${(guardian.students || []).length} students`}
        />
        {(guardian.students || []).length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students linked"
            sub="Add a student from the Guardian record in Frappe Desk."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student Name</th>
              </tr>
            </thead>
            <tbody>
              {guardian.students.map((s, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{s.student || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {s.student_name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Interests */}
      <div className="panel">
        <SectionHead 
          icon={Heart} 
          title="Interests" 
          sub={`${(guardian.interests || []).length} interests`}
        />
        {(guardian.interests || []).length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No interests listed"
            sub="Add interests from the Guardian record in Frappe Desk."
          />
        ) : (
          <div style={{ padding: "4px 18px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {guardian.interests.map((interest, i) => (
              <span key={i} className="badge" style={{ background: "var(--surface-2)" }}>
                {interest.interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { GraduationCap, MapPin, Users as UsersIcon } from "lucide-react";
import {
  Avatar,
  StatusBadge,
  EmptyState,
} from "../../../components/ui/Primitives.jsx";
import { fmtDate } from "../../../utils/format";

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

export default function StudentDetails({ student }) {
  if (!student) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar
            name={student.student_name}
            src={student.image}
            size={64}
            round
          />
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {student.student_name}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge s={student.enabled ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="panel">
        <SectionHead icon={GraduationCap} title="Personal Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="First Name" value={student.first_name} />
          <Item label="Middle Name" value={student.middle_name} />
          <Item label="Last Name" value={student.last_name} />
          <Item label="Gender" value={student.gender} />
          <Item
            label="Date of Birth"
            value={
              student.date_of_birth ? fmtDate(student.date_of_birth) : null
            }
          />
          <Item label="Blood Group" value={student.blood_group} />
          <Item label="Nationality" value={student.nationality} />
          <Item label="Email" value={student.student_email_id} />
          <Item label="Phone" value={student.student_mobile_number} />
        </div>
      </div>

      {/* Address */}
      <div className="panel">
        <SectionHead icon={MapPin} title="Address" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Address Line 1" value={student.address_line_1} />
          <Item label="Address Line 2" value={student.address_line_2} />
          <Item label="City" value={student.city} />
          <Item label="State" value={student.state} />
          <Item label="Country" value={student.country} />
          <Item label="Pincode" value={student.pincode} />
        </div>
      </div>

      {/* Guardians */}
      <div className="panel">
        <SectionHead
          icon={UsersIcon}
          title="Guardians"
          sub={`${(student.guardians || []).length} linked`}
        />
        {(student.guardians || []).length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No guardians linked"
            sub="Add a guardian from the Student record in Frappe Desk."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Relation</th>
              </tr>
            </thead>
            <tbody>
              {student.guardians.map((g, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{g.guardian_name}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {g.relation || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

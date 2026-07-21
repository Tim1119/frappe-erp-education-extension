import { User, Briefcase, Building2, Mail, Calendar, Users, Clock } from "lucide-react";
import {
  Avatar,
  StatusBadge,
  EmptyState,
} from "../../../components/ui/Primitives.jsx";

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

export default function TeacherDetails({ teacher }) {
  if (!teacher) return null;

  // Parse instructor_log if it's a string, otherwise use as is
  const instructorLog = Array.isArray(teacher.instructor_log) 
    ? teacher.instructor_log 
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar
            name={teacher.instructor_name}
            src={teacher.image}
            size={64}
            round
          />
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {teacher.instructor_name}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge 
                s={
                  teacher.status === "Active" 
                    ? "ACTIVE" 
                    : "INACTIVE"
                } 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={User} title="Basic Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Instructor ID" value={teacher.name} />
          <Item label="Employee" value={teacher.employee} />
          <Item label="Gender" value={teacher.gender} />
          <Item label="Status" value={teacher.status} />
        </div>
      </div>

      {/* Professional Information */}
      <div className="panel">
        <SectionHead icon={Briefcase} title="Professional Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Department" value={teacher.department} />
        </div>
      </div>

      {/* Instructor Log */}
      <div className="panel">
        <SectionHead 
          icon={Clock} 
          title="Instructor Log" 
          sub={`${instructorLog.length} entries`}
        />
        {instructorLog.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No log entries"
            sub="Instructor log will appear here when activities are recorded."
          />
        ) : (
          <div style={{ padding: "4px 18px 20px", overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Academic Term</th>
                  <th>Department</th>
                  <th>Program</th>
                  <th>Course</th>
                  <th>Student Group</th>
                  <th>Other Details</th>
                </tr>
              </thead>
              <tbody>
                {instructorLog.map((log, index) => (
                  <tr key={index} className="row">
                    <td style={{ fontWeight: 550 }}>{log.academic_year || "—"}</td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.academic_term || "—"}
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.department || "—"}
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.program || "—"}
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.course || "—"}
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.student_group || "—"}
                    </td>
                    <td className="muted2" style={{ fontSize: 13 }}>
                      {log.other_details || "—"}
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
}
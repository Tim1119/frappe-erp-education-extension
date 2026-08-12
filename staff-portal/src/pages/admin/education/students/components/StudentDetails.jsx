import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  GraduationCap,
  MapPin,
  Users as UsersIcon,
  Link2,
  BookOpen,
  CalendarCheck,
  FileWarning,
  Award,
  ClipboardCheck,
  Wallet,
  ClipboardList,
} from "lucide-react";
import {
  Avatar,
  StatusBadge,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";
import { fmtDate } from "@/utils/format";
import { getStudentConnections } from "@/services/studentService.js";

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

function ConnectionButton({ icon: Icon, label, path, count, loading }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        backgroundColor: "var(--surface-2)",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
        textAlign: "left",
        color: "var(--ink)",
        fontSize: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-3)";
        e.currentTarget.style.borderColor = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-2)";
        e.currentTarget.style.borderColor = "hsl(var(--border))";
      }}
    >
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {loading ? (
        <span style={{ fontSize: "10px", color: "var(--ink-3)" }}>...</span>
      ) : (
        count !== undefined && (
          <span style={{
            fontSize: "10px",
            color: "var(--ink-3)",
            backgroundColor: "var(--surface)",
            padding: "1px 6px",
            borderRadius: "10px",
            minWidth: "20px",
            textAlign: "center",
          }}>
            {count}
          </span>
        )
      )}
    </button>
  );
}

export default function StudentDetails({ student }) {
  const [connections, setConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      if (!student) return;

      setLoadingConnections(true);
      try {
        const result = await getStudentConnections(student.name);
        setConnections(result);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingConnections(false);
      }
    }

    if (student) {
      fetchConnections();
    }
  }, [student]);

  if (!student) return null;

  const connectionGroups = [
    {
      group: "Enrollment",
      items: [
        { key: "class_enrollments", label: "Class Enrollment", icon: GraduationCap, path: `/dashboard/class-enrollment?student=${student.name}` },
        { key: "subject_enrollments", label: "Subject Enrollment", icon: BookOpen, path: `/dashboard/subject-enrollment?student=${student.name}` },
      ]
    },
    {
      group: "Attendance",
      items: [
        { key: "student_attendance", label: "Student Attendance", icon: CalendarCheck, path: `/dashboard/student-attendance?student=${student.name}` },
        { key: "student_leave_applications", label: "Leave Application", icon: FileWarning, path: `/dashboard/student-leave-application?student=${student.name}` },
      ]
    },
    {
      group: "Assessment",
      items: [
        { key: "assessment_results", label: "Assessment Result", icon: Award, path: `/dashboard/assessment-result?student=${student.name}` },
        { key: "school_term_results", label: "School Term Result", icon: ClipboardCheck, path: `/dashboard/school-term-result-generator?student=${student.name}` },
      ]
    },
    {
      group: "Fee",
      items: [
        { key: "fees", label: "Fees", icon: Wallet, path: `/dashboard/fees?student=${student.name}` },
      ]
    },
    {
      group: "Activity",
      items: [
        { key: "student_logs", label: "Student Log", icon: ClipboardList, path: `/dashboard/student-log?student=${student.name}` },
      ]
    },
  ];

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

      {/* Connections - Compact Grid */}
      <div className="panel">
        <div className="panel-head">
          <div
            className="panel-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Link2 size={15} style={{ color: "var(--ink-4)" }} />
            Connections
          </div>
        </div>
        <div style={{ padding: "10px 20px 26px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "20px",
          }}>
            {connectionGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px",
                  }}
                >
                  {group.group}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {group.items.map((item, itemIndex) => (
                    <ConnectionButton
                      key={itemIndex}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      count={connections?.[item.key]}
                      loading={loadingConnections}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="panel">
        <SectionHead icon={GraduationCap} title="Personal Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
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
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
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
            sub="Add a guardian from this student's edit page."
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

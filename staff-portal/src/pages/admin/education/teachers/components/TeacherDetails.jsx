import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Building2,
  Mail,
  Calendar,
  Users,
  Clock,
  Link2,
  ClipboardList,
} from "lucide-react";
import {
  Avatar,
  StatusBadge,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";
import { getTeacherConnections } from "@/services/education/teacherService.js";

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

export default function TeacherDetails({ teacher }) {
  const [connections, setConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      if (!teacher) return;

      setLoadingConnections(true);
      try {
        const result = await getTeacherConnections(teacher.name);
        setConnections(result);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingConnections(false);
      }
    }

    if (teacher) {
      fetchConnections();
    }
  }, [teacher]);

  if (!teacher) return null;

  // Parse instructor_log if it's a string, otherwise use as is
  const instructorLog = Array.isArray(teacher.instructor_log)
    ? teacher.instructor_log
    : [];

  const connectionGroups = [
    {
      group: "Schedule",
      items: [
        { key: "subject_schedules", label: "Subject Schedule", icon: Calendar, path: `/dashboard/subject-schedule?instructor=${teacher.name}` },
      ]
    },
    {
      group: "Student",
      items: [
        { key: "class_arms", label: "Class Arm", icon: Users, path: `/dashboard/class-arms?instructor=${teacher.name}` },
      ]
    },
    {
      group: "Assessment",
      items: [
        { key: "assessment_plans", label: "Assessment Plan", icon: ClipboardList, path: `/dashboard/assessment-plan?supervisor=${teacher.name}` },
      ]
    },
  ];

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
            gridTemplateColumns: "repeat(3, 1fr)",
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

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={User} title="Basic Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Teacher ID" value={teacher.name} />
          <Item label="Employee" value={teacher.employee} />
          <Item label="Gender" value={teacher.gender} />
          <Item label="Status" value={teacher.status} />
        </div>
      </div>

      {/* Professional Information */}
      <div className="panel">
        <SectionHead icon={Briefcase} title="Professional Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Department" value={teacher.department} />
        </div>
      </div>

      {/* Teacher Log */}
      <div className="panel">
        <SectionHead 
          icon={Clock} 
          title="Teacher Log" 
          sub={`${instructorLog.length} entries`}
        />
        {instructorLog.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No log entries"
            sub="Teacher log will appear here when activities are recorded."
          />
        ) : (
          <div style={{ padding: "10px 20px 26px", overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Academic Term</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Class Arm</th>
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
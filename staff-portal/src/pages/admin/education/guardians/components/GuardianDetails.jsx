import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Phone, Briefcase, GraduationCap, Calendar, MapPin, Users, Heart, Link2, Wallet } from "lucide-react";
import { Avatar, StatusBadge, EmptyState } from "@/components/shared/OriginalPrimitives";
import { getGuardianConnections } from "@/services/guardianService.js";

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

export default function GuardianDetails({ guardian }) {
  const [connections, setConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      if (!guardian) return;

      setLoadingConnections(true);
      try {
        const result = await getGuardianConnections(guardian.name);
        setConnections(result);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingConnections(false);
      }
    }

    if (guardian) {
      fetchConnections();
    }
  }, [guardian]);

  if (!guardian) return null;

  const connectionGroups = [
    {
      group: "Family",
      items: [
        { key: "students", label: "Student", icon: Users, path: `/dashboard/students?guardian=${guardian.name}` },
      ]
    },
    {
      group: "Fee",
      items: [
        { key: "fees", label: "Fees", icon: Wallet, path: `/dashboard/fees?guardian=${guardian.name}` },
      ]
    },
  ];

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
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Guardian ID" value={guardian.name} />
          <Item label="Date of Birth" value={guardian.date_of_birth} />
          <Item label="Education" value={guardian.education} />
        </div>
      </div>

      {/* Professional Information */}
      <div className="panel">
        <SectionHead icon={Briefcase} title="Professional Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Occupation" value={guardian.occupation} />
          <Item label="Designation" value={guardian.designation} />
          <Item label="Work Address" value={guardian.work_address} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="panel">
        <SectionHead icon={Phone} title="Contact Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Mobile Number" value={guardian.mobile_number} />
          <Item label="Alternate Number" value={guardian.alternate_number} />
          <Item label="Email Address" value={guardian.email_address} />
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
            gridTemplateColumns: "repeat(2, 1fr)",
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
            sub="Add a student from this guardian's edit page."
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
            sub="Add interests from this guardian's edit page."
          />
        ) : (
          <div style={{ padding: "10px 20px 26px", display: "flex", flexWrap: "wrap", gap: 8 }}>
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
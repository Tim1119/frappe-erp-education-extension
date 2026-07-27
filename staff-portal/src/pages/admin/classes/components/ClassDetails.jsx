import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Image, 
  BookMarked,
  Users,
  ClipboardList,
  Award,
  Wallet,
  FileText,
  UserPlus,
  Calendar,
  Link2,
  ExternalLink
} from "lucide-react";
import { Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import { getErrorMessage } from "@/utils/errors.js";
import toast from "react-hot-toast";

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
        <span style={{ 
          fontSize: "10px", 
          color: "var(--ink-3)",
        }}>
          ...
        </span>
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

// Function to get count for a doctype filtered by program
async function getDoctypeCount(doctype, program) {
  try {
    const response = await fetch(`/api/method/frappe.client.get_count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({
        doctype: doctype,
        filters: {
          program: program
        }
      })
    });
    const data = await response.json();
    return data.message || 0;
  } catch (error) {
    console.error(`Error fetching count for ${doctype}:`, error);
    return 0;
  }
}

export default function ClassDetails({ classData }) {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  if (!classData) return null;

  // Connection groups based on the Program doctype links
  const connectionGroups = [
    {
      group: "Admission and Enrollments",
      items: [
        { 
          key: "student_applicants",
          label: "Student Applicant", 
          icon: UserPlus, 
          doctype: "Student Applicant",
          path: `/dashboard/student-applicants?program=${classData.name}`,
        },
        { 
          key: "program_enrollments",
          label: "Class Enrollment", 
          icon: GraduationCap, 
          doctype: "Program Enrollment",
          path: `/dashboard/class-enrollment?program=${classData.name}`,
        },
      ]
    },
    {
      group: "Student Activity",
      items: [
        { 
          key: "student_groups",
          label: "Class Arm", 
          icon: Users, 
          doctype: "Student Group",
          path: `/dashboard/class-arms?program=${classData.name}`,
        },
        { 
          key: "student_logs",
          label: "Student Log", 
          icon: ClipboardList, 
          doctype: "Student Log",
          path: `/dashboard/student-log?program=${classData.name}`,
        },
      ]
    },
    {
      group: "Assessment",
      items: [
        { 
          key: "assessment_plans",
          label: "Assessment Plan", 
          icon: Award, 
          doctype: "Assessment Plan",
          path: `/dashboard/assessment-plan?program=${classData.name}`,
        },
        { 
          key: "assessment_results",
          label: "Assessment Result", 
          icon: ClipboardList, 
          doctype: "Assessment Result",
          path: `/dashboard/assessment-result?program=${classData.name}`,
        },
      ]
    },
    {
      group: "Fee",
      items: [
        { 
          key: "fee_structures",
          label: "Fee Structure", 
          icon: FileText, 
          doctype: "Fee Structure",
          path: `/dashboard/fee-structure?program=${classData.name}`,
        },
        { 
          key: "fee_schedules",
          label: "Fee Schedule", 
          icon: Wallet, 
          doctype: "Fee Schedule",
          path: `/dashboard/fee-schedule?program=${classData.name}`,
        },
      ]
    },
  ];

  // Fetch counts for all doctypes
  useEffect(() => {
    async function fetchCounts() {
      setLoadingCounts(true);
      try {
        const allItems = connectionGroups.flatMap(group => group.items);
        const countPromises = allItems.map(item => 
          getDoctypeCount(item.doctype, classData.name)
        );
        const results = await Promise.all(countPromises);
        
        const countMap = {};
        allItems.forEach((item, index) => {
          countMap[item.key] = results[index];
        });
        setCounts(countMap);
      } catch (error) {
        console.error("Error fetching counts:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingCounts(false);
      }
    }

    if (classData.name) {
      fetchCounts();
    }
  }, [classData.name]);

  // Flatten connections for easier access
  const allConnections = connectionGroups.flatMap(group => group.items);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar
            name={classData.program_name}
            src={classData.hero_image}
            size={64}
            round
          />
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {classData.program_name}
            </div>
            {classData.program_abbreviation && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {classData.program_abbreviation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={GraduationCap} title="Basic Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Class ID" value={classData.name} />
          <Item label="Class Name" value={classData.program_name} />
          <Item label="Class Abbreviation" value={classData.program_abbreviation} />
          <Item label="Department" value={classData.department} />
        </div>
      </div>

      {/* Connections - Compact Grid with Counts */}
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
            gridTemplateColumns: "repeat(4, 1fr)", 
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
                      count={counts[item.key]}
                      loading={loadingCounts}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="panel">
        <SectionHead 
          icon={BookOpen} 
          title="Subjects" 
          sub={`${(classData.courses || []).length} courses`}
        />
        {(classData.courses || []).length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects"
            sub="Add subjects from this class's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Subject Name</th>
                <th>Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {classData.courses.map((course, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{course.course || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {course.course_name || "—"}
                  </td>
                  <td>{course.required ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
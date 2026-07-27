import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Users, Hash, Link2, ExternalLink, Calendar, ClipboardList, BookOpen } from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getClassroom, deleteClassroom } from "@/services/classroomService.js";
import { getErrorMessage } from "@/utils/errors.js";

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
      <ExternalLink size={14} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}

// Function to get count for a doctype with filters
async function getDoctypeCount(doctype, filters) {
  try {
    const response = await fetch(`/api/method/frappe.client.get_count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({
        doctype: doctype,
        filters: filters
      })
    });
    const data = await response.json();
    return data.message || 0;
  } catch (error) {
    console.error(`Error fetching count for ${doctype}:`, error);
    return 0;
  }
}

export default function ClassroomProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getClassroom(name);
        setClassroom(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  // Fetch counts for connections
  useEffect(() => {
    async function fetchCounts() {
      if (!classroom) return;
      
      setLoadingCounts(true);
      try {
        // Use the 'room' field to filter
        const scheduleCount = await getDoctypeCount("Course Schedule", {
          room: classroom.name
        });
        
        const assessmentPlanCount = await getDoctypeCount("Assessment Plan", {
          room: classroom.name
        });

        setCounts({
          subject_schedules: scheduleCount,
          assessment_plans: assessmentPlanCount,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingCounts(false);
      }
    }

    if (classroom) {
      fetchCounts();
    }
  }, [classroom]);

  async function handleDelete() {
    try {
      await deleteClassroom(name);
      toast.success("Classroom deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/classrooms");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading classroom...</div>;
  if (!classroom) return <div className="muted">Classroom not found</div>;

  const connectionGroups = [
    {
      group: "Subject",
      items: [
        { 
          key: "subject_schedules",
          label: "Subject Schedule", 
          icon: Calendar, 
          path: `/dashboard/subject-schedule?room=${classroom.name}`
        },
      ]
    },
    {
      group: "Assessment",
      items: [
        { 
          key: "assessment_plans",
          label: "Assessment Plan", 
          icon: ClipboardList, 
          path: `/dashboard/assessment-plan?room=${classroom.name}`
        },
      ]
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title={classroom.room_name || "Classroom Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/classrooms/${encodeURIComponent(name)}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        }
      />

      {/* Header card */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "10px 20px 26px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "var(--brand-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Building2 size={32} style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              {classroom.room_name}
            </div>
            {classroom.room_number && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Room #{classroom.room_number}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={Building2} title="Classroom Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Classroom ID" value={classroom.name} />
          <Item label="Classroom Name" value={classroom.room_name} />
          <Item label="Classroom Number" value={classroom.room_number} />
          <Item label="Seating Capacity" value={classroom.seating_capacity || "—"} />
        </div>
      </div>

      {/* Connections */}
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
          {!loadingCounts && counts.subject_schedules === 0 && counts.assessment_plans === 0 && (
            <div style={{ 
              marginTop: 12, 
              padding: "12px", 
              backgroundColor: "var(--surface-2)", 
              borderRadius: "6px",
              textAlign: "center",
              color: "var(--ink-3)",
              fontSize: "13px"
            }}>
              No connections found for this classroom.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${classroom.room_name}?`}
        message="This action cannot be undone. All data associated with this classroom will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
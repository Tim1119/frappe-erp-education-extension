import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  Contact,
  Users2,
  Pencil,
  Trash2,
  Link2,
  Award,
  ClipboardList,
  CalendarCheck,
  FileWarning,
  Calendar,
  ClipboardCheck,
} from "lucide-react";

import {
  PageHeader,
  Avatar,
  StatusBadge,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getClassArm, deleteClassArm, getClassArmConnections } from "@/services/education/classArmsService.js";
import { getErrorMessage } from "@/utils/errors.js";

function Info({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value ?? "—"}</div>
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

export default function ClassArmProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connections, setConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getClassArm(name);
        setGroup(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  useEffect(() => {
    async function fetchConnections() {
      if (!group) return;

      setLoadingConnections(true);
      try {
        const result = await getClassArmConnections(group.name);
        setConnections(result);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingConnections(false);
      }
    }

    if (group) {
      fetchConnections();
    }
  }, [group]);

  async function handleDelete() {
    try {
      await deleteClassArm(name);
      toast.success("Class arm deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/class-arms");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading class arm…</div>;
  if (!group) return <div className="muted">Class arm not found</div>;

  const connectionGroups = [
    {
      group: "Assessment",
      items: [
        { key: "assessment_plans", label: "Assessment Plan", icon: Award, path: `/dashboard/assessment-plan?student_group=${encodeURIComponent(group.name)}` },
        { key: "assessment_results", label: "Assessment Result", icon: ClipboardList, path: `/dashboard/assessment-result?student_group=${encodeURIComponent(group.name)}` },
      ]
    },
    {
      group: "Attendance",
      items: [
        { key: "student_attendance", label: "Student Attendance", icon: CalendarCheck, path: `/dashboard/student-attendance?student_group=${encodeURIComponent(group.name)}` },
        { key: "student_leave_applications", label: "Leave Application", icon: FileWarning, path: `/dashboard/student-leave-application?student_group=${encodeURIComponent(group.name)}` },
      ]
    },
    {
      group: "Schedule",
      items: [
        { key: "subject_schedules", label: "Subject Schedule", icon: Calendar, path: `/dashboard/subject-schedule?student_group=${encodeURIComponent(group.name)}` },
      ]
    },
    {
      group: "Result",
      items: [
        { key: "school_term_results", label: "School Term Result", icon: ClipboardCheck, path: `/dashboard/school-term-result-generator?student_group=${encodeURIComponent(group.name)}` },
      ]
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={group.student_group_name || group.name}
        actions={<StatusBadge s={group.disabled ? "INACTIVE" : "ACTIVE"} />}
        button={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              // onClick={() => navigate(`/dashboard/class-arms/${id}/edit`)}
              onClick={() => navigate(`/dashboard/class-arms/${encodeURIComponent(name)}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={BookOpen} title="Group Details" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Info
            label="Academic Year"
            value={group.academic_year ? group.academic_year : "-"}
          />
          <Info
            label="Academic Term"
            value={group.academic_term ? group.academic_term : "-"}
          />
          <Info
            label="Group Based On"
            value={group.group_based_on ? group.group_based_on : "-"}
          />
          <Info label="Class" value={group.program ? group.program : "-"} />
          <Info
            label="Subject"
            value={group.course ? group.course : "-"}
          />
          <Info label="Batch" value={group.batch ? group.batch : "-"} />
          <Info
            label="Student Category"
            value={group.student_category ? group.student_category : "-"}
          />
          <Info label="Max Strength" value={group.max_strength || "No limit"} />
        </div>
      </div>

      {/* Connections - Compact Grid */}
      <div className="panel" style={{ marginBottom: 18 }}>
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
            {connectionGroups.map((cGroup, groupIndex) => (
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
                  {cGroup.group}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {cGroup.items.map((item, itemIndex) => (
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

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead
          icon={Users2}
          title="Students"
          sub={`${group.students?.length || 0} enrolled`}
        />
        {!group.students?.length ? (
          <EmptyState icon={Users2} title="No students assigned" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {group.students.map((s, i) => (
                <tr key={i} className="row">
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar
                        name={s.student_name || s.student}
                        size={28}
                        src={s.image}
                      />
                      <span style={{ fontWeight: 550 }}>
                        {s.student_name || s.student}
                      </span>
                    </div>
                  </td>
                  <td className="tnum muted">{s.group_roll_number || "—"}</td>
                  <td>
                    <StatusBadge s={s.active ? "ACTIVE" : "INACTIVE"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <SectionHead
          icon={Contact}
          title="Teachers"
          sub={`${group.instructors?.length || 0} assigned`}
        />
        {!group.instructors?.length ? (
          <EmptyState icon={Contact} title="No teachers assigned" />
        ) : (
          <div
            style={{
              padding: "4px 18px 18px",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {group.instructors.map((item, i) => (
              <span key={i} className="chip">
                {item.instructor_name || item.instructor}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
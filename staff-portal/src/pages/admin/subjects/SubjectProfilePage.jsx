import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  BookOpen, 
  Building2, 
  FileText, 
  Link2, 
  ExternalLink,
  GraduationCap,
  Users,
  ClipboardList,
  Award,
  Calendar,
  User
} from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getSubject, getSubjectConnections, deleteSubject } from "@/services/subjectService.js";
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
    </button>
  );
}

export default function SubjectProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connections, setConnections] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSubject(name);
        setSubject(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  // Fetch connection counts using the backend API
  useEffect(() => {
    async function fetchConnections() {
      if (!subject) return;
      
      setLoadingConnections(true);
      try {
        const result = await getSubjectConnections(subject.name);
        setConnections(result);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to load connection counts");
      } finally {
        setLoadingConnections(false);
      }
    }

    if (subject) {
      fetchConnections();
    }
  }, [subject]);

  async function handleDelete() {
    try {
      await deleteSubject(name);
      toast.success("Subject deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/subjects");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading subject...</div>;
  if (!subject) return <div className="muted">Subject not found</div>;

  // Connection groups
  const connectionGroups = [
    {
      group: "Class and Subject",
      items: [
        { key: "classes", label: "Class", icon: GraduationCap, path: `/dashboard/classes?course=${subject.name}` },
        { key: "student_enrollments", label: "Subject Enrollment", icon: Users, path: `/dashboard/subject-enrollment?course=${subject.name}` },
        { key: "subject_schedules", label: "Subject Schedule", icon: Calendar, path: `/dashboard/subject-schedule?course=${subject.name}` },
      ]
    },
    {
      group: "Student",
      items: [
        { key: "students", label: "Student", icon: User, path: `/dashboard/students?course=${subject.name}` },
        { key: "class_arms", label: "Class Arm", icon: Users, path: `/dashboard/class-arms?course=${subject.name}` },
      ]
    },
    {
      group: "Assessment",
      items: [
        { key: "assessment_plans", label: "Assessment Plan", icon: ClipboardList, path: `/dashboard/assessment-plan?course=${subject.name}` },
        { key: "assessment_results", label: "Assessment Result", icon: Award, path: `/dashboard/assessment-result?course=${subject.name}` },
      ]
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title={subject.course_name || "Subject Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/subjects/${encodeURIComponent(name)}/edit`)}
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
          <Avatar
            name={subject.course_name}
            src={subject.hero_image}
            size={64}
            round
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>
              {subject.course_name}
            </div>
            {subject.description && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {subject.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={BookOpen} title="Basic Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Subject ID" value={subject.name} />
          <Item label="Subject Name" value={subject.course_name} />
          <Item label="Department" value={subject.department} />
          <Item label="Default Grading Scale" value={subject.default_grading_scale} />
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

      {/* Topics */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead 
          icon={BookOpen} 
          title="Topics" 
          sub={`${(subject.topics || []).length} topics`}
        />
        {(subject.topics || []).length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No topics"
            sub="Add topics from this subject's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Topic Name</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{topic.topic || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {topic.topic_name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assessment Criteria */}
      <div className="panel">
        <SectionHead 
          icon={FileText} 
          title="Assessment Criteria" 
          sub={`${(subject.assessment_criteria || []).length} criteria`}
        />
        {(subject.assessment_criteria || []).length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No assessment criteria"
            sub="Add assessment criteria from this subject's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Assessment Criteria</th>
                <th>Weightage</th>
              </tr>
            </thead>
            <tbody>
              {subject.assessment_criteria.map((criteria, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{criteria.assessment_criteria || "—"}</td>
                  <td>{criteria.weightage || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${subject.course_name}?`}
        message="This action cannot be undone. All data associated with this subject will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Building2, FileText, Link2, ExternalLink } from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "../../components/ui/Primitives.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { getSubject, deleteSubject } from "../../services/subjectService.js";
import { getErrorMessage } from "../../utils/errors.js";

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

export default function SubjectProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "4px 18px 20px" }}>
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
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Subject ID" value={subject.name} />
          <Item label="Subject Name" value={subject.course_name} />
          <Item label="Department" value={subject.department} />
          <Item label="Default Grading Scale" value={subject.default_grading_scale} />
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
            sub="Add topics from the Subject record in Frappe Desk."
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
            sub="Add assessment criteria from the Subject record in Frappe Desk."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Assessment Criteria</th>
                <th>Criteria Group</th>
                <th>Weightage</th>
              </tr>
            </thead>
            <tbody>
              {subject.assessment_criteria.map((criteria, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{criteria.assessment_criteria || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {criteria.assessment_criteria_group || "—"}
                  </td>
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
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, BookOpen, CheckCircle, XCircle, Link2, ExternalLink } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getStudentAdmission, deleteStudentAdmission } from "@/services/studentAdmissionService.js";
import { getErrorMessage } from "@/utils/errors.js";
import { fmtDate } from "@/utils/format.js";

function Item({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value || "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ published }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px",
        borderRadius: "12px", fontSize: "12px", fontWeight: 500,
        backgroundColor: published ? "var(--success-soft)" : "var(--danger-soft)",
        color: published ? "var(--success)" : "var(--danger)",
      }}
    >
      {published ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

function ConnectionButton({ icon: Icon, label, path }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px",
        backgroundColor: "var(--surface-2)", border: "1px solid hsl(var(--border))", borderRadius: "6px",
        cursor: "pointer", width: "100%", textAlign: "left", color: "var(--ink)", fontSize: "12px",
      }}
    >
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      <ExternalLink size={14} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}

export default function StudentAdmissionProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Decode in case the docname contains a slash or other reserved char.
  const name = id ? decodeURIComponent(id) : null;

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!name) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentAdmission(name);
        setAdmission(data);
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
      await deleteStudentAdmission(name);
      toast.success("Student admission deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-admissions");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading student admission...</div>;
  if (!admission) return <div className="muted">Student admission not found</div>;

  const connectionGroups = [
    {
      group: "Student",
      items: [
        { label: "Student Applicant", icon: BookOpen, path: `/dashboard/student-applicants?student_admission=${encodeURIComponent(admission.name)}` },
        { label: "Student", icon: BookOpen, path: `/dashboard/students?student_admission=${encodeURIComponent(admission.name)}` },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title={admission.title || admission.name}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/student-admissions/${encodeURIComponent(name)}/edit`)}
            >
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => setDeleteModalOpen(true)}>
              Delete
            </button>
          </div>
        }
      />

      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "10px 20px 26px" }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--brand-soft)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Calendar size={32} style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>{admission.title || admission.name}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {admission.academic_year || "No academic year"}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge published={admission.published} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={Calendar} title="Admission Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Admission ID" value={admission.name} />
          <Item label="Title" value={admission.title} />
          <Item label="Academic Year" value={admission.academic_year} />
          <Item label="Start Date" value={admission.admission_start_date ? fmtDate(admission.admission_start_date) : "—"} />
          <Item label="End Date" value={admission.admission_end_date ? fmtDate(admission.admission_end_date) : "—"} />
          <Item label="Published" value={<StatusBadge published={admission.published} />} />
          <Item label="Applications Enabled" value={admission.enable_admission_application ? "Yes" : "No"} />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead
          icon={BookOpen}
          title="Eligibility and Classes"
          sub={`${(admission.program_details || []).length} programs`}
        />
        {(admission.program_details || []).length === 0 ? (
          <EmptyState icon={BookOpen} title="No classes" sub="Add classes from the edit form." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Class</th>
                <th>Naming Series</th>
                <th>Min Age</th>
                <th>Max Age</th>
                <th>Application Fee</th>
              </tr>
            </thead>
            <tbody>
              {admission.program_details.map((program, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{program.program || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{program.applicant_naming_series || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{program.min_age ?? "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{program.max_age ?? "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{program.application_fee ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* <div className="panel">
        <div className="panel-head">
          <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link2 size={15} style={{ color: "var(--ink-4)" }} />
            Connections
          </div>
        </div>
        <div style={{ padding: "10px 20px 26px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {connectionGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                  {group.group}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {group.items.map((item, itemIndex) => (
                    <ConnectionButton key={itemIndex} icon={item.icon} label={item.label} path={item.path} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${admission.title || admission.name}?`}
        message="This action cannot be undone. All data associated with this student admission will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
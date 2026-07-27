import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User, Users, BookOpen, Home,
  CheckCircle, XCircle, Clock, UserCheck,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import {
  getStudentApplicant,
  deleteStudentApplicant,
  updateStudentApplicant,
} from "@/services/studentApplicantService.js";
import { getErrorMessage } from "@/utils/errors.js";
import { fmtDate } from "@/utils/format.js";

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

function StatusBadgeComponent({ status }) {
  const statusMap = {
    Applied: { label: "Applied", color: "var(--warning)", bg: "var(--warning-soft)", icon: Clock },
    Approved: { label: "Approved", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    Rejected: { label: "Rejected", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
    Admitted: { label: "Admitted", color: "var(--brand)", bg: "var(--brand-soft)", icon: CheckCircle },
  };
  const s = statusMap[status] || statusMap["Applied"];
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      <Icon size={12} />
      {s.label}
    </span>
  );
}

export default function StudentApplicantProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  async function load() {
    try {
      const data = await getStudentApplicant(name);
      setApplicant(data);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!name || name === "undefined") return;
    load();
  }, [name]);

  async function handleDelete() {
    try {
      await deleteStudentApplicant(name);
      toast.success("Student applicant deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/student-applicants");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // Always trust the server response for status, never assume locally.
  async function runStatusUpdate(newStatus, successMsg) {
    setActionLoading(true);
    try {
      const result = await updateStudentApplicant(name, { application_status: newStatus });
      setApplicant((prev) => ({
        ...prev,
        application_status: result?.application_status ?? newStatus,
      }));
      toast.success(successMsg);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const handleApprove = () => runStatusUpdate("Approved", "Applicant approved");
  const handleReject = () => runStatusUpdate("Rejected", "Applicant rejected");

  async function handleEnroll() {
    setActionLoading(true);
    try {
      // enroll_student expects `source_name` = the Student Applicant docname,
      // not the whole form object.
      const response = await fetch("/api/method/education.education.api.enroll_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frappe-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content || "",
        },
        body: JSON.stringify({ source_name: name }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.exception || errBody?.message || "Enrollment request failed");
      }

      const data = await response.json();

      if (data.message) {
        // Explicitly mark as Admitted regardless of what enroll_student does
        // internally — keeps the frontend state authoritative and consistent.
        await updateStudentApplicant(name, { application_status: "Admitted" });
        await load();
        toast.success("Student enrolled successfully");
      } else {
        toast.error("Failed to enroll student");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  function renderActionButtons() {
    if (!applicant) return null;
    const status = applicant.application_status;

    if (status === "Applied") {
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={16} /> Approve
          </button>
          <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      );
    }

    if (status === "Approved") {
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleEnroll} disabled={actionLoading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <UserCheck size={16} /> Enroll
          </button>
          <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      );
    }

    if (status === "Rejected") {
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={16} /> Approve
          </button>
        </div>
      );
    }

    if (status === "Admitted") {
      return (
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", backgroundColor: "var(--brand-soft)",
            color: "var(--brand)", borderRadius: 6, fontSize: 13, fontWeight: 500,
          }}
        >
          <UserCheck size={16} /> Applicant Admitted
        </span>
      );
    }

    return null;
  }

  if (loading) return <div className="muted">Loading student applicant...</div>;
  if (!applicant) return <div className="muted">Student applicant not found</div>;

  const fullName = [applicant.first_name, applicant.middle_name, applicant.last_name].filter(Boolean).join(" ");

  const tabs = [
    { key: "personal", label: "Personal Details", icon: User },
    { key: "academic", label: "Academic", icon: BookOpen },
    { key: "address", label: "Address", icon: Home },
    { key: "relations", label: "Relations", icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid-3">
            <Item label="Applicant ID" value={applicant.name} />
            <Item label="First Name" value={applicant.first_name} />
            <Item label="Middle Name" value={applicant.middle_name} />
            <Item label="Last Name" value={applicant.last_name} />
            <Item label="Gender" value={applicant.gender} />
            <Item label="Date of Birth" value={applicant.date_of_birth ? fmtDate(applicant.date_of_birth) : "—"} />
            <Item label="Blood Group" value={applicant.blood_group} />
            <Item label="Nationality" value={applicant.nationality} />
            <Item label="Student Category" value={applicant.student_category} />
            <Item label="Email Address" value={applicant.student_email_id} />
            <Item label="Mobile Number" value={applicant.student_mobile_number} />
          </div>
        );

      case "academic":
        return (
          <div className="grid-3">
            <Item label="Class" value={applicant.program} />
            <Item label="Academic Year" value={applicant.academic_year} />
            <Item label="Academic Term" value={applicant.academic_term} />
            <Item label="Application Date" value={applicant.application_date ? fmtDate(applicant.application_date) : "—"} />
            <Item label="Application Status" value={<StatusBadgeComponent status={applicant.application_status} />} />
            <Item label="Paid" value={applicant.paid ? "Yes" : "No"} />
          </div>
        );

      case "address":
        return (
          <div className="grid-3">
            <Item label="Address Line 1" value={applicant.address_line_1} />
            <Item label="Address Line 2" value={applicant.address_line_2} />
            <Item label="City" value={applicant.city} />
            <Item label="State" value={applicant.state} />
            <Item label="Country" value={applicant.country} />
            <Item label="Pincode" value={applicant.pincode} />
          </div>
        );

      case "relations":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                Guardians ({(applicant.guardians || []).length})
              </h3>
              {(applicant.guardians || []).length === 0 ? (
                <EmptyState icon={Users} title="No guardians" sub="Add guardians from the edit form." />
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Guardian Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Occupation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicant.guardians.map((guardian, i) => (
                      <tr key={i} className="row">
                        <td style={{ fontWeight: 550 }}>{guardian.guardian_name || "—"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>{guardian.email_address || "—"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>{guardian.mobile_number || "—"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>{guardian.occupation || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                Siblings ({(applicant.siblings || []).length})
              </h3>
              {(applicant.siblings || []).length === 0 ? (
                <EmptyState icon={Users} title="No siblings" sub="Add siblings from the edit form." />
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                      <th>Same Institute</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicant.siblings.map((sibling, i) => (
                      <tr key={i} className="row">
                        <td style={{ fontWeight: 550 }}>{sibling.full_name || "—"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>{sibling.gender || "—"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>
                          {sibling.date_of_birth ? fmtDate(sibling.date_of_birth) : "—"}
                        </td>
                        <td className="muted2" style={{ fontSize: 13 }}>{sibling.studying_in_same_institute || "NO"}</td>
                        <td className="muted2" style={{ fontSize: 13 }}>{sibling.program || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title={fullName || "Student Applicant"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/student-applicants/${encodeURIComponent(name)}/edit`)}
            >
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => setDeleteModalOpen(true)}>
              Delete
            </button>
          </div>
        }
      />

      <div className="panel" style={{ overflow: "visible" }}>
        {/* Image beside header, Frappe-desk style */}
        <div
          style={{
            display: "flex", gap: 20, padding: "16px 20px",
            borderBottom: "1px solid hsl(var(--border))", alignItems: "center", flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 80, height: 100, borderRadius: 8, border: "1px solid hsl(var(--border))",
              overflow: "hidden", flexShrink: 0, backgroundColor: "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {applicant.image ? (
              <img src={applicant.image} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={32} style={{ color: "var(--ink-3)" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{fullName}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 8 }}>
              {applicant.program || "No class"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusBadgeComponent status={applicant.application_status} />
              {applicant.paid ? (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
                    borderRadius: 12, fontSize: 12, fontWeight: 500,
                    backgroundColor: "var(--success-soft)", color: "var(--success)",
                  }}
                >
                  <CheckCircle size={12} /> Paid
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>{renderActionButtons()}</div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex", gap: 4, padding: "0 20px",
            borderBottom: "1px solid hsl(var(--border))", backgroundColor: "var(--surface-2)",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                  background: isActive ? "var(--surface)" : "transparent",
                  cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--brand)" : "var(--ink-3)",
                  borderRadius: "4px 4px 0 0",
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: 20 }}>{renderTabContent()}</div>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${fullName}?`}
        message="This action cannot be undone. All data associated with this student applicant will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
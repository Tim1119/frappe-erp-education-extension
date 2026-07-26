import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus } from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "../../components/ui/Primitives.jsx";
import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { usePagination, useDebounce } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";

import {
  getStudentApplicants,
  deleteStudentApplicant,
  getPrograms,
} from "../../services/studentApplicantService.js";

function StatusBadgeComponent({ status }) {
  const statusMap = {
    Applied: { label: "Applied", color: "var(--warning)", bg: "var(--warning-soft)" },
    Approved: { label: "Approved", color: "var(--success)", bg: "var(--success-soft)" },
    Rejected: { label: "Rejected", color: "var(--danger)", bg: "var(--danger-soft)" },
    Admitted: { label: "Admitted", color: "var(--brand)", bg: "var(--brand-soft)" },
  };
  const s = statusMap[status] || statusMap["Applied"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

export default function StudentApplicantsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programFromUrl = searchParams.get("program") || "";
  const statusFromUrl = searchParams.get("status") || "";

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [programFilter, setProgramFilter] = useState(programFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [programOptions, setProgramOptions] = useState([]);
  const [statusOptions] = useState(["Applied", "Approved", "Rejected", "Admitted"]);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadPrograms() {
    try {
      const result = await getPrograms();
      setProgramOptions(result.map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      const result = await getStudentApplicants({
        page,
        page_size: 20,
        search: debouncedSearch,
        program: programFilter || undefined,
        application_status: statusFilter || undefined,
      });
      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading student applicants:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, programFilter, statusFilter]);

  useEffect(() => {
    reset();
  }, [programFilter, statusFilter]);

  async function confirmDelete() {
    try {
      await deleteStudentApplicant(deleteTarget.name);
      toast.success("Student applicant deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const getSubText = () => (loading ? "Loading..." : `${totalCount} student applicants`);

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title="Student Applicants"
        sub={getSubText()}
        button={
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/student-applicants/new")}>
            <Plus size={15} />
            Add Applicant
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        searchProps={{ style: { flex: "0 0 280px" } }}
        filters={[
          { key: "program", label: "Program", value: programFilter, onChange: setProgramFilter, options: programOptions },
          { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: statusOptions },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Program</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Paid</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={item.first_name} src={item.image} size={34} />
                      <div>
                        <div style={{ fontWeight: 550 }}>
                          {item.title || `${item.first_name} ${item.last_name || ""}`}
                        </div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {item.student_email_id || item.student_mobile_number || item.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>{item.program || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{item.academic_year || "—"}</td>
                  <td><StatusBadgeComponent status={item.application_status} /></td>
                  <td>
                    {item.paid ? (
                      <span style={{ color: "var(--success)" }}>✓</span>
                    ) : (
                      <span style={{ color: "var(--ink-3)" }}>—</span>
                    )}
                  </td>
                  <td style={{ position: "relative" }}>
                    <button className="iconbtn" onClick={() => setMenuId(menuId === item.name ? null : item.name)}>
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === item.name && (
                      <div
                        className="rowmenu"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 34,
                          zIndex: 9999,
                          minWidth: 140,
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                          padding: "4px 0",
                        }}
                      >
                        <button
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/dashboard/student-applicants/${item.name}`);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px", width: "100%",
                            padding: "6px 12px", border: "none", background: "transparent",
                            cursor: "pointer", fontSize: "13px", color: "var(--ink)",
                          }}
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/dashboard/student-applicants/${item.name}/edit`);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px", width: "100%",
                            padding: "6px 12px", border: "none", background: "transparent",
                            cursor: "pointer", fontSize: "13px", color: "var(--ink)",
                          }}
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "4px 8px" }} />
                        <button
                          onClick={() => {
                            setMenuId(null);
                            setDeleteTarget(item);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px", width: "100%",
                            padding: "6px 12px", border: "none", background: "transparent",
                            cursor: "pointer", fontSize: "13px", color: "var(--danger)",
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title="No student applicants found" sub="No student applicant records available." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager page={page} setPage={setPage} pageSize={20} count={totalCount} />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.title || deleteTarget?.first_name}?`}
        message="This action cannot be undone. All data associated with this student applicant will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
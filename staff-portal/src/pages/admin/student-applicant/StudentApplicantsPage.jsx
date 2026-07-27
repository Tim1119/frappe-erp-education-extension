import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus } from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

import { usePagination, useDebounce } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getStudentApplicants,
  deleteStudentApplicant,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
} from "@/services/studentApplicantService.js";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const programFromUrl = searchParams.get("program") || "";
  const statusFromUrl = searchParams.get("status") || "";
  const academicYearFromUrl = searchParams.get("academic_year") || "";
  const academicTermFromUrl = searchParams.get("academic_term") || "";
  const studentAdmission = searchParams.get("student_admission") || undefined;

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [programFilter, setProgramFilter] = useState(programFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [academicYearFilter, setAcademicYearFilter] = useState(academicYearFromUrl);
  const [academicTermFilter, setAcademicTermFilter] = useState(academicTermFromUrl);
  const [programOptions, setProgramOptions] = useState([]);
  const [statusOptions] = useState(["Applied", "Approved", "Rejected", "Admitted"]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadPrograms() {
    try {
      const result = await getPrograms();
      setProgramOptions(result.map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadAcademicYears() {
    try {
      const result = await getAcademicYears();
      setAcademicYearOptions((result || []).map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  useEffect(() => {
    getAcademicTerms(academicYearFilter || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [academicYearFilter]);

  async function loadItems() {
    try {
      setLoading(true);
      const result = await getStudentApplicants({
        page,
        page_size: 20,
        search: debouncedSearch,
        program: programFilter || undefined,
        application_status: statusFilter || undefined,
        academic_year: academicYearFilter || undefined,
        academic_term: academicTermFilter || undefined,
        student_admission: studentAdmission,
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
    loadAcademicYears();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, programFilter, statusFilter, academicYearFilter, academicTermFilter, studentAdmission]);

  useEffect(() => {
    reset();
  }, [programFilter, statusFilter, academicYearFilter, academicTermFilter, studentAdmission]);

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
          { key: "program", label: "Class", value: programFilter, onChange: setProgramFilter, options: programOptions },
          { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: statusOptions },
          { key: "academic_year", label: "Academic Year", value: academicYearFilter, onChange: setAcademicYearFilter, options: academicYearOptions },
          { key: "academic_term", label: "Academic Term", value: academicTermFilter, onChange: setAcademicTermFilter, options: academicTermOptions },
        ]}
      />

      <ActiveFilterChip
        label="Student Admission"
        value={studentAdmission}
        onClear={() => clearParam("student_admission")}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Class</th>
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
                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/student-applicants/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/student-applicants/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
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
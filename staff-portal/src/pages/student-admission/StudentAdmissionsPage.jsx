import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageHeader, EmptyState } from "../../components/ui/Primitives.jsx";
import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { useDebounce, usePagination } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";
import { fmtDate } from "../../utils/format.js";

import {
  getStudentAdmissions,
  deleteStudentAdmission,
  getPrograms,
  getAcademicYears,
} from "../../services/studentAdmissionService.js";

function StatusBadge({ published }) {
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
        backgroundColor: published ? "var(--success-soft)" : "var(--danger-soft)",
        color: published ? "var(--success)" : "var(--danger)",
      }}
    >
      {published ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function StudentAdmissionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classFromUrl = searchParams.get("class") || "";
  const yearFromUrl = searchParams.get("academic_year") || "";

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [classFilter, setClassFilter] = useState(classFromUrl);
  const [yearFilter, setYearFilter] = useState(yearFromUrl);
  const [classOptions, setClassOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadFilters() {
    try {
      const [classes, years] = await Promise.all([getPrograms(), getAcademicYears()]);
      setClassOptions(classes.map((item) => item.name));
      setYearOptions(years.map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function load() {
    try {
      setLoading(true);
      const result = await getStudentAdmissions({
        page,
        page_size: 20,
        search: debouncedSearch,
        class_name: classFilter || undefined,
        academic_year: yearFilter || undefined,
      });
      setRows(result.rows || []);
      setCount(result.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    load();
  }, [page, debouncedSearch, classFilter, yearFilter]);

  useEffect(() => {
    reset();
  }, [classFilter, yearFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteStudentAdmission(deleteTarget.name);
      toast.success("Student admission deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // Always encode the docname before putting it in a URL — some admission
  // records have slashes in their name, which would otherwise split the
  // route into extra segments and 404.
  function goTo(name, suffix = "") {
    navigate(`/dashboard/student-admissions/${encodeURIComponent(name)}${suffix}`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title="Student Admissions"
        sub={loading ? "Loading..." : `${count} student admissions`}
        button={
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/student-admissions/new")}>
            <Plus size={15} />
            Add Student Admission
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        filters={[
          { key: "class", label: "Class", value: classFilter, onChange: setClassFilter, options: classOptions },
          { key: "academic_year", label: "Academic Year", value: yearFilter, onChange: setYearFilter, options: yearOptions },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Programs</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div style={{ fontWeight: 550 }}>{item.title || item.name}</div>
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>{item.program || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>{item.academic_year || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.admission_start_date ? fmtDate(item.admission_start_date) : "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.admission_end_date ? fmtDate(item.admission_end_date) : "—"}
                  </td>
                  <td>
                    <StatusBadge published={item.published} />
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
                            goTo(item.name);
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
                            goTo(item.name, "/edit");
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

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No student admissions found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager page={page} setPage={setPage} count={count} pageSize={20} />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.title || deleteTarget?.name} admission?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
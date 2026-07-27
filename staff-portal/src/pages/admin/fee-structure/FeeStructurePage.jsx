import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

import {
  PageHeader,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getFeeStructures,
  deleteFeeStructure,
  getPrograms,
  getAcademicYears,
  getAcademicTerms,
  getStudentCategories,
} from "@/services/feeStructureService.js";

// Status badge component
function StatusBadge({ status }) {
  const statusMap = {
    "Draft": { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)" },
    "Submitted": { label: "Submitted", color: "var(--success)", bg: "var(--success-soft)" },
    "Cancelled": { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)" },
  };
  
  const s = statusMap[status] || statusMap["Draft"];
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 500,
      backgroundColor: s.bg,
      color: s.color,
    }}>
      {status === "Draft" && <Clock size={12} />}
      {status === "Submitted" && <CheckCircle size={12} />}
      {status === "Cancelled" && <XCircle size={12} />}
      {s.label}
    </span>
  );
}

export default function FeeStructurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage, reset } = usePagination(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState(searchParams.get("program") || "");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");
  const [studentCategoryFilter, setStudentCategoryFilter] = useState(searchParams.get("student_category") || "");

  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [studentCategoryOptions, setStudentCategoryOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadFilters() {
    try {
      const [programs, academicYears, studentCategories] = await Promise.all([
        getPrograms(),
        getAcademicYears(),
        getStudentCategories(),
      ]);
      setProgramOptions(programs.map(p => p.name));
      setAcademicYearOptions(academicYears.map(y => y.name));
      setStudentCategoryOptions(studentCategories.map(c => c.name));
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
      const result = await getFeeStructures({
        page,
        search,
        program: programFilter,
        academic_year: academicYearFilter,
        academic_term: academicTermFilter,
        student_category: studentCategoryFilter,
      });
      setItems(result.rows || []);
      setTotalCount(result.count || 0);
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
    loadItems();
  }, [page, search, programFilter, academicYearFilter, academicTermFilter, studentCategoryFilter]);

  // If navigated here with a new query filter (e.g. from Connections), sync it
  useEffect(() => {
    const urlProgram = searchParams.get("program") || "";
    const urlAcademicYear = searchParams.get("academic_year") || "";
    const urlAcademicTerm = searchParams.get("academic_term") || "";
    const urlStudentCategory = searchParams.get("student_category") || "";
    let changed = false;
    if (urlProgram !== programFilter) { setProgramFilter(urlProgram); changed = true; }
    if (urlAcademicYear !== academicYearFilter) { setAcademicYearFilter(urlAcademicYear); changed = true; }
    if (urlAcademicTerm !== academicTermFilter) { setAcademicTermFilter(urlAcademicTerm); changed = true; }
    if (urlStudentCategory !== studentCategoryFilter) { setStudentCategoryFilter(urlStudentCategory); changed = true; }
    if (changed) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function confirmDelete() {
    try {
      await deleteFeeStructure(deleteTarget.name);
      toast.success("Fee structure deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title="Fee Structures"
        sub={loading ? "Loading..." : `${totalCount} fee structures`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/fee-structure/new")}
          >
            <Plus size={15} />
            Add Fee Structure
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
          {
            key: "program",
            label: "Class",
            value: programFilter,
            onChange: (v) => {
              setProgramFilter(v);
              reset();
            },
            options: programOptions,
          },
          {
            key: "academic_year",
            label: "Academic Year",
            value: academicYearFilter,
            onChange: (v) => {
              setAcademicYearFilter(v);
              reset();
            },
            options: academicYearOptions,
          },
          {
            key: "academic_term",
            label: "Academic Term",
            value: academicTermFilter,
            onChange: (v) => {
              setAcademicTermFilter(v);
              reset();
            },
            options: academicTermOptions,
          },
          {
            key: "student_category",
            label: "Student Category",
            value: studentCategoryFilter,
            onChange: (v) => {
              setStudentCategoryFilter(v);
              reset();
            },
            options: studentCategoryOptions,
          },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Class</th>
                <th>Academic Year</th>
                <th>Academic Term</th>
                <th>Student Category</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div style={{ fontWeight: 550 }}>{item.program || "—"}</div>
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.academic_year || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.academic_term || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.student_category || "—"}
                  </td>
                  <td className="tnum" style={{ fontWeight: 600 }}>
                    {item.total_amount ? `₦${item.total_amount.toLocaleString()}` : "—"}
                  </td>
                  <td>
                    <StatusBadge status={item.docstatus === 1 ? "Submitted" : item.docstatus === 2 ? "Cancelled" : "Draft"} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/fee-structure/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/fee-structure/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <EmptyState title="No fee structures found" />
          )}
          <Pager count={totalCount} page={page} setPage={setPage} pageSize={20} />
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.program} fee structure?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
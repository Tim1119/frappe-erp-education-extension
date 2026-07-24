import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

import {
  PageHeader,
  EmptyState,
} from "../../components/ui/Primitives.jsx";

import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { usePagination } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";

import {
  getFeeStructures,
  deleteFeeStructure,
  getPrograms,
  getAcademicYears,
} from "../../services/feeStructureService.js";

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
  
  const [programOptions, setProgramOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadFilters() {
    try {
      const [programs, academicYears] = await Promise.all([
        getPrograms(),
        getAcademicYears(),
      ]);
      setProgramOptions(programs.map(p => p.name));
      setAcademicYearOptions(academicYears.map(y => y.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      const result = await getFeeStructures({
        page,
        search,
        program: programFilter,
        academic_year: academicYearFilter,
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
  }, [page, search, programFilter, academicYearFilter]);

  // If navigated here with a new ?program=... (e.g. from Connections), sync the filter
  useEffect(() => {
    const urlProgram = searchParams.get("program") || "";
    if (urlProgram !== programFilter) {
      setProgramFilter(urlProgram);
      reset();
    }
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
                  <td style={{ position: "relative" }}>
                    <button
                      className="iconbtn"
                      onClick={() =>
                        setMenuId(menuId === item.name ? null : item.name)
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === item.name && (
                      <div
                        className="rowmenu"
                        style={{ right: 0, top: 34 }}
                      >
                        <button
                          onClick={() =>
                            navigate(`/dashboard/fee-structure/${item.name}`)
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {/* Only show Edit for Draft status */}
                        {item.docstatus === 0 && (
                          <button
                            onClick={() =>
                              navigate(`/dashboard/fee-structure/${item.name}/edit`)
                            }
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                        )}

                        <div className="divider" style={{ margin: "5px 0" }} />

                        {/* Only show Delete for Draft and Cancelled */}
                        {(item.docstatus === 0 || item.docstatus === 2) && (
                          <button
                            className="danger"
                            onClick={() => {
                              setMenuId(null);
                              setDeleteTarget(item);
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
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
        variant="danger"
      />
    </>
  );
}
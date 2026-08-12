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
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

import { usePagination } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getFeeSchedules,
  deleteFeeSchedule,
  getAcademicYears,
  getAcademicTerms,
} from "@/services/education/feeScheduleService.js";

// Status badge component
function StatusBadge({ status }) {
  const statusMap = {
    "Draft": { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)" },
    "Cancelled": { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)" },
    "Invoice Pending": { label: "Invoice Pending", color: "var(--warning)", bg: "var(--warning-soft)" },
    "Order Pending": { label: "Order Pending", color: "var(--warning)", bg: "var(--warning-soft)" },
    "In Process": { label: "In Process", color: "var(--info)", bg: "var(--info-soft)" },
    "Invoice Created": { label: "Invoice Created", color: "var(--success)", bg: "var(--success-soft)" },
    "Order Created": { label: "Order Created", color: "var(--success)", bg: "var(--success-soft)" },
    "Failed": { label: "Failed", color: "var(--danger)", bg: "var(--danger-soft)" },
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
      {s.label}
    </span>
  );
}

export default function FeeSchedulePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const feeStructureFilter = searchParams.get('fee_structure') || '';
  const programFilterFromUrl = searchParams.get('program') || '';
  const studentCategoryFilter = searchParams.get('student_category') || '';

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState(searchParams.get("academic_year") || "");
  const [academicTermFilter, setAcademicTermFilter] = useState(searchParams.get("academic_term") || "");
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAcademicYears()
      .then((r) => setAcademicYearOptions((r || []).map((y) => y.name)))
      .catch(() => setAcademicYearOptions([]));
  }, []);

  useEffect(() => {
    getAcademicTerms(academicYearFilter || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [academicYearFilter]);

  async function loadItems() {
    try {
      setLoading(true);
      const result = await getFeeSchedules({
        page,
        search,
        fee_structure: feeStructureFilter,
        program: programFilterFromUrl,
        status: statusFilter,
        academic_year: academicYearFilter,
        academic_term: academicTermFilter,
        student_category: studentCategoryFilter,
      });
      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading fee schedules:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [page, search, statusFilter, feeStructureFilter, programFilterFromUrl, academicYearFilter, academicTermFilter, studentCategoryFilter]);

  // Reset to page 1 whenever the URL-driven filters change
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeStructureFilter, programFilterFromUrl, studentCategoryFilter]);

  async function confirmDelete() {
    try {
      await deleteFeeSchedule(deleteTarget.name);
      toast.success("Fee schedule deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const subText = feeStructureFilter
    ? `Fee schedules for structure: ${feeStructureFilter}`
    : programFilterFromUrl
    ? `Fee schedules for class: ${programFilterFromUrl}`
    : `${totalCount} fee schedules`;

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title="Fee Schedules"
        sub={loading ? "Loading..." : subText}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/fee-schedule/new")}
          >
            <Plus size={15} />
            Add Fee Schedule
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
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              reset();
            },
            options: ["Draft", "Cancelled", "Invoice Pending", "Order Pending", "In Process", "Invoice Created", "Order Created", "Failed"],
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
        ]}
      />

      <ActiveFilterChip label="Fee Structure" value={feeStructureFilter} onClear={() => clearParam("fee_structure")} />
      <ActiveFilterChip label="Class" value={programFilterFromUrl} onClear={() => clearParam("program")} />
      <ActiveFilterChip label="Student Category" value={studentCategoryFilter} onClear={() => clearParam("student_category")} />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Fee Schedule</th>
                <th>Fee Structure</th>
                <th>Class</th>
                <th>Academic Year</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div style={{ fontWeight: 550 }}>{item.name}</div>
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.fee_structure || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.program || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.academic_year || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.due_date || "—"}
                  </td>
                  <td className="tnum" style={{ fontWeight: 600 }}>
                    {item.total_amount ? `₦${item.total_amount.toLocaleString()}` : "—"}
                  </td>
                  <td>
                    <StatusBadge status={item.status || "Draft"} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/fee-schedule/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/fee-schedule/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <EmptyState title="No fee schedules found" />
          )}
          <Pager count={totalCount} page={page} setPage={setPage} pageSize={20} />
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.name}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
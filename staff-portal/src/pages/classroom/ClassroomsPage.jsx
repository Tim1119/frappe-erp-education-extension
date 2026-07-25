import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, Building2 } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "../../components/ui/Primitives.jsx";

import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { usePagination, useDebounce } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";

import {
  getClassrooms,
  deleteClassroom,
} from "../../services/classroomService.js";

export default function ClassroomsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getClassrooms({
        page,
        page_size: 20,
        search: debouncedSearch,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading classrooms:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch]);

  async function confirmDelete() {
    try {
      await deleteClassroom(deleteTarget.name);
      toast.success("Classroom deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title="Classrooms"
        sub={loading ? "Loading..." : `${totalCount} classrooms`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/classrooms/new")}
          >
            <Plus size={15} />
            Add Classroom
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        searchProps={{
          style: {
            flex: "0 0 280px",
          },
        }}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Classroom</th>
                <th>Room Number</th>
                <th>Seating Capacity</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: "var(--brand-soft)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={16} style={{ color: "var(--brand)" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 550 }}>{item.room_name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.room_number || "—"}
                  </td>

                  <td className="tnum muted2" style={{ fontSize: 13 }}>
                    {item.seating_capacity || "—"}
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
                            navigate(`/dashboard/classrooms/${item.name}`);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "6px 12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "var(--ink)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--surface-2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/dashboard/classrooms/${item.name}/edit`);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "6px 12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "var(--ink)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--surface-2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "var(--border)",
                            margin: "4px 8px",
                          }}
                        />

                        <button
                          onClick={() => {
                            setMenuId(null);
                            setDeleteTarget(item);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "6px 12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "var(--danger)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--danger-soft)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="No classrooms found"
                      sub="No classroom records available."
                    />
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
        title={`Delete ${deleteTarget?.room_name}?`}
        message="This action cannot be undone. All data associated with this classroom will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
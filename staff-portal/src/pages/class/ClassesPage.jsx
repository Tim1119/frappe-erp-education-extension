import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "../../components/ui/Primitives.jsx";

import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { usePagination } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";

import {
  getClasses,
  deleteClass,
  getDepartments,
} from "../../services/classService.js";

export default function ClassPage() {
  const navigate = useNavigate();

  const { page, setPage } = usePagination(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getClasses({
        page,
        search,
        department: departmentFilter,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading classes:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const result = await getDepartments();
      setDepartmentOptions(result.map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, search, departmentFilter]);

  async function confirmDelete() {
    try {
      await deleteClass(deleteTarget.name);
      toast.success("Class deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Classes"
        sub={loading ? "Loading..." : `${totalCount} classes`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/classes/new")}
          >
            <Plus size={15} />
            Add Class
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchProps={{
          style: {
            flex: "0 0 280px",
          },
        }}
        filterProps={{
          style: {
            width: 160,
            minWidth: 160,
            flex: "0 0 160px",
          },
        }}
        filters={[
          {
            key: "department",
            label: "Department",
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: departmentOptions,
          },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Abbreviation</th>
                <th>Department</th>
                <th></th>
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
                      <Avatar
                        name={item.program_name}
                        src={item.hero_image}
                        size={34}
                      />
                      <div style={{ fontWeight: 550 }}>{item.program_name}</div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.program_abbreviation || "—"}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.department || "—"}
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
                          right: 0,
                          top: 34,
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(`/dashboard/classes/${item.name}`)
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/dashboard/classes/${item.name}/edit`)
                          }
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <div
                          className="divider"
                          style={{
                            margin: "5px 0",
                          }}
                        />

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
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="No classes found"
                      sub="No class records available."
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
        title={`Delete ${deleteTarget?.program_name}?`}
        message="This action cannot be undone. All data associated with this class will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
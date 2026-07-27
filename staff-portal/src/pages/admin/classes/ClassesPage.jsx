import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getClasses,
  deleteClass,
  getDepartments,
} from "@/services/classService.js";

export default function ClassPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseFromUrl = searchParams.get("course") || "";

  const { page, setPage } = usePagination(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState(courseFromUrl);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getClasses({
        page,
        search,
        department: departmentFilter,
        course: courseFilter || undefined,
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
  }, [page, search, departmentFilter, courseFilter]);

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

  // Get the display name for the filter
  const getFilterDisplay = () => {
    if (courseFilter) {
      return `classes with course: ${courseFilter}`;
    }
    return `${totalCount} classes`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Classes"
        sub={loading ? "Loading..." : getFilterDisplay()}
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

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/classes/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/classes/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title={courseFilter ? `No classes found for course: ${courseFilter}` : "No classes found"}
                      sub={courseFilter ? `No class records available for this course.` : "No class records available."}
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
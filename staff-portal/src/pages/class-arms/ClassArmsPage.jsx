import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageHeader, EmptyState } from "../../components/ui/Primitives.jsx";

import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { useDebounce, usePagination } from "../../hooks.js";

import { getErrorMessage } from "../../utils/errors.js";

import {
  getClassArms,
  deleteClassArm,
} from "../../services/classArmsService.js";

export default function ClassArmsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const program = searchParams.get("program") || undefined;

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 350);

  const [rows, setRows] = useState([]);

  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [menuId, setMenuId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try {
      setLoading(true);

      const result = await getClassArms({
        page,

        page_size: 20,

        search: debouncedSearch,

        program,
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
    load();
  }, [page, debouncedSearch, program]);

  // Reset to page 1 whenever the program filter changes
  useEffect(() => {
    reset();
  }, [program]);

  async function removeClassArm() {
    if (!deleteTarget) return;

    try {
      await deleteClassArm(deleteTarget.name);

      toast.success("Class Arm deleted");

      setDeleteTarget(null);

      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"

        title="Class Arms"

        sub={loading ? "Loading..." : `${count} class arms`}

        button={
          <button
            className="btn btn-primary"

            onClick={() => navigate("/dashboard/class-arms/new")}
          >
            Add Class Arm
          </button>
        }
      />

      <Toolbar
        search={search}

        onSearch={(v) => {
          setSearch(v);

          reset();
        }}
      />

      <div className="panel">
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>

                <th>Name</th>

                <th>Program</th>

                <th>Year</th>

                <th>Term</th>

                <th>Course</th>

                <th>Students</th>

                <th>Strength</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((group) => (
                <tr key={group.name}>
                  <td>{group.name}</td>

                  <td>
                    <strong>{group.student_group_name || group.name}</strong>
                  </td>

                  <td>{group.program || "-"}</td>

                  <td>{group.academic_year || "-"}</td>

                  <td>{group.academic_term || "-"}</td>

                  <td>{group.course_name || "-"}</td>

                  <td>{group.students_count || 0}</td>

                  <td>{group.max_strength || "-"}</td>

                  <td
                    style={{
                      position: "relative",
                    }}
                  >
                    <button
                      className="iconbtn"

                      onClick={() =>
                        setMenuId(menuId === group.name ? null : group.name)
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === group.name && (
                      <div
                        className="rowmenu"

                        style={{
                          right: 0,
                          top: 34,
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/class-arms/${encodeURIComponent(group.name)}`,
                            )
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/class-arms/${encodeURIComponent(group.name)}/edit`,
                            )
                          }
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <div className="divider" />

                        <button
                          className="danger"

                          onClick={() => {
                            setMenuId(null);

                            setDeleteTarget(group);
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

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState title="No class arms found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={page}

          setPage={setPage}

          count={count}

          pageSize={20}
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}

        onClose={() => setDeleteTarget(null)}

        onConfirm={removeClassArm}

        title={`Delete ${
          deleteTarget?.student_group_name || deleteTarget?.name
        }?`}

        message="This action cannot be undone."

        confirmLabel="Delete"

        variant="danger"
      />
    </>
  );
}
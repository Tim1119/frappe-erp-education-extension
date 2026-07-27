import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

import { useDebounce, usePagination } from "@/hooks";

import { getErrorMessage } from "@/utils/errors.js";

import {
  getSubjects,
  deleteSubject,
  getDepartments,
} from "@/services/subjectService.js";

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const departmentFromUrl = searchParams.get("department") || undefined;
  const topicFilter = searchParams.get("topic") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState(departmentFromUrl || "");
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Load department options for filter dropdown
  useEffect(() => {
    async function loadDepartments() {
      try {
        const result = await getDepartments();
        setDepartmentOptions(result.map((item) => item.name));
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    loadDepartments();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const result = await getSubjects({
        page,
        page_size: 20,
        search: debouncedSearch,
        department: departmentFilter || undefined,
        topic: topicFilter || undefined,
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
  }, [page, debouncedSearch, departmentFilter, topicFilter]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    reset();
  }, [departmentFilter, topicFilter]);

  async function removeSubject() {
    if (!deleteTarget) return;

    try {
      await deleteSubject(deleteTarget.name);
      toast.success("Subject deleted");
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
        title="Subjects"
        sub={loading ? "Loading..." : `${count} subjects`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/subjects/new")}
          >
            Add Subject
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
          {
            key: "department",
            label: "Department",
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: departmentOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Topic" value={topicFilter} onClear={() => clearParam("topic")} />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Department</th>
                <th>Description</th>
                <th>Grading Scale</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((subject) => (
                <tr key={subject.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        name={subject.course_name}
                        src={subject.hero_image}
                        size={34}
                      />
                      <div>
                        <div style={{ fontWeight: 550 }}>
                          {subject.course_name}
                        </div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {subject.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {subject.department || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {subject.description || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {subject.default_grading_scale || "—"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/subjects/${encodeURIComponent(subject.name)}`)}
                    onEdit={() => navigate(`/dashboard/subjects/${encodeURIComponent(subject.name)}/edit`)}
                    onDelete={() => setDeleteTarget(subject)}
                  />
                </td>
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No subjects found" />
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
        onConfirm={removeSubject}
        title={`Delete ${deleteTarget?.course_name}?`}
        message="This action cannot be undone. All data associated with this subject will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
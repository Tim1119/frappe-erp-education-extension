import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react";

import {
  PageHeader,
  Avatar,
  StatusBadge,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination } from "@/hooks";

import {
  getTeachers,
  deleteTeacher,
  getDepartments,
} from "@/services/teacherService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function TeachersPage() {
  const navigate = useNavigate();

  const { page, setPage } = usePagination(1);

  const [teachers, setTeachers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadTeachers() {
    try {
      setLoading(true);

      const result = await getTeachers({
        page,
        search,
        status: statusFilter,
        department: departmentFilter,
      });

      setTeachers(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
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
    loadTeachers();
  }, [page, search, statusFilter, departmentFilter]);

  async function confirmDelete() {
    try {
      await deleteTeacher(deleteTarget.name);
      toast.success("Teacher deleted");
      setDeleteTarget(null);
      loadTeachers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Teachers"
        sub={loading ? "Loading..." : `${totalCount} instructors`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/teachers/new")}
          >
            Add Teacher
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
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: ["Active", "Left"],
          },
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
                <th>Name</th>
                <th>Teacher ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        name={teacher.instructor_name}
                        src={teacher.image}
                        size={34}
                      />
                      <div>{teacher.instructor_name}</div>
                    </div>
                  </td>

                  <td className="muted tnum" style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>
                    {teacher.name}
                  </td>

                  <td>{teacher.employee || "-"}</td>

                  <td>{teacher.department || "-"}</td>

                  <td>{teacher.gender || "-"}</td>

                  <td>
                    <StatusBadge 
                      s={
                        teacher.status === "Active" 
                          ? "ACTIVE" 
                          : "INACTIVE"
                      } 
                    />
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/teachers/${teacher.name}`)}
                    onEdit={() => navigate(`/dashboard/teachers/${teacher.name}/edit`)}
                    onDelete={() => setDeleteTarget(teacher)}
                  />
                </td>
                </tr>
              ))}

              {!loading && teachers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No teachers found"
                      sub="No teacher records available."
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
        title={`Delete ${deleteTarget?.instructor_name}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
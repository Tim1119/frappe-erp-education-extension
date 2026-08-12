import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

import { usePagination } from "@/hooks";

import {
  getStudents,
  deleteStudent,
  getClassArms,
} from "@/services/education/studentService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseFilter = searchParams.get("course") || "";
  const studentAdmissionFilter = searchParams.get("student_admission") || "";
  const guardianFilter = searchParams.get("guardian") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classArmFilter, setClassArmFilter] = useState(searchParams.get("class_arm") || "");

  const [classArmOptions, setClassArmOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadStudents() {
    try {
      setLoading(true);

      const result = await getStudents({
        page,
        search,
        status: statusFilter,
        class_arm: classArmFilter,
        course: courseFilter || undefined,
        student_admission: studentAdmissionFilter || undefined,
        guardian: guardianFilter || undefined,
      });

      setStudents(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadClassArms() {
    try {
      const result = await getClassArms({ page_size: 500 });

      setClassArmOptions((result.rows || []).map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadClassArms();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, search, statusFilter, classArmFilter, courseFilter, studentAdmissionFilter, guardianFilter]);

  // Reset to page 1 whenever a URL-driven filter changes
  useEffect(() => {
    reset();
  }, [courseFilter, studentAdmissionFilter, guardianFilter]);

  async function confirmDelete() {
    try {
      await deleteStudent(deleteTarget.name);

      toast.success("Student deleted");

      setDeleteTarget(null);

      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Students"
        sub={loading ? "Loading..." : `${totalCount} students`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/students/new")}
          >
            Add Student
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
            options: ["Active", "Inactive"],
          },

          {
            key: "class_arm",
            label: "Class Arm",
            value: classArmFilter,
            onChange: setClassArmFilter,
            options: classArmOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Subject" value={courseFilter} onClear={() => clearParam("course")} />
      <ActiveFilterChip label="Student Admission" value={studentAdmissionFilter} onClear={() => clearParam("student_admission")} />
      <ActiveFilterChip label="Guardian" value={guardianFilter} onClear={() => clearParam("guardian")} />

      <div className="panel">
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Class Arm</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        name={student.student_name}
                        src={student.image}
                        size={34}
                      />

                      <div>{student.student_name}</div>
                    </div>
                  </td>

                  <td>{student.name}</td>

                  <td>{student.class || "-"}</td>

                  <td>{student.class_arm || "-"}</td>

                  <td>{student.gender || "-"}</td>

                  <td>{student.student_email_id || "-"}</td>

                  <td>
                    <StatusBadge s={student.enabled ? "ACTIVE" : "INACTIVE"} />
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/students/${student.name}`)}
                    onEdit={() => navigate(`/dashboard/students/${student.name}/edit`)}
                    onDelete={() => setDeleteTarget(student)}
                  />
                </td>
                </tr>
              ))}

              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No students found"
                      sub="No student records available."
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

        title={`Delete ${deleteTarget?.student_name}?`}

        message="This action cannot be undone."

        confirmLabel="Delete"

        variant="destructive"
      />
    </>
  );
}

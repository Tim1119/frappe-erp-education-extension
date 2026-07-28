import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";
import { usePagination } from "@/hooks";
import {
  getSubjectSchedules,
  deleteSubjectSchedule,
  getStudentGroups,
  getInstructors,
} from "@/services/subjectScheduleService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

// Frappe Time fields serialize as "HH:MM:SS" -- trim seconds for display.
function fmtTime(t) {
  return t ? String(t).slice(0, 5) : "—";
}

export default function SubjectSchedulesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // SubjectProfilePage.jsx links here with ?course=, ClassroomProfilePage.jsx
  // with ?room= -- both real, already-wired Connections links pointing at
  // this route from before this module existed.
  const courseFilter = searchParams.get("course") || "";
  const roomFilter = searchParams.get("room") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Seeded from the URL too -- Subject Scheduling Tool's own success
  // feedback links here with ?student_group= after generating schedules.
  const [studentGroupFilter, setStudentGroupFilter] = useState(searchParams.get("student_group") || "");
  const [instructorFilter, setInstructorFilter] = useState("");

  const [studentGroupOptions, setStudentGroupOptions] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);

  useEffect(() => {
    getStudentGroups()
      .then((r) => setStudentGroupOptions((r || []).map((g) => g.name)))
      .catch(() => {});
    getInstructors()
      .then((r) => setInstructorOptions((r || []).map((i) => i.name)))
      .catch(() => {});
  }, []);

  async function load() {
    try {
      setLoading(true);
      const r = await getSubjectSchedules({
        page,
        search,
        student_group: studentGroupFilter || undefined,
        instructor: instructorFilter || undefined,
        course: courseFilter || undefined,
        room: roomFilter || undefined,
      });
      setRows(r.rows || []);
      setTotal(r.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, search, studentGroupFilter, instructorFilter, courseFilter, roomFilter]);

  useEffect(() => {
    reset();
  }, [studentGroupFilter, instructorFilter, courseFilter, roomFilter]);

  async function confirmDelete() {
    try {
      await deleteSubjectSchedule(deleteTarget.name);
      toast.success("Subject schedule deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Subject Schedules"
        description={loading ? "Loading…" : `${total} subject schedules`}
      >
        <Button onClick={() => navigate("/dashboard/subject-schedule/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Subject Schedule
        </Button>
      </PageHeader>

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "student_group",
            label: "Class Arm",
            value: studentGroupFilter,
            onChange: setStudentGroupFilter,
            options: studentGroupOptions,
          },
          {
            key: "instructor",
            label: "Teacher",
            value: instructorFilter,
            onChange: setInstructorFilter,
            options: instructorOptions,
          },
        ]}
      />

      <ActiveFilterChip label="Subject" value={courseFilter} onClear={() => clearParam("course")} />
      <ActiveFilterChip label="Classroom" value={roomFilter} onClear={() => clearParam("room")} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Class Arm</TableHead>
              <TableHead className="hidden sm:table-cell">Teacher</TableHead>
              <TableHead className="hidden sm:table-cell">Classroom</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/subject-schedule/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ backgroundColor: r.color || "#ccc" }}
                  />
                  {r.title || r.name}
                </TableCell>
                <TableCell>{r.student_group}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.instructor_name || r.instructor}</TableCell>
                <TableCell className="hidden sm:table-cell">{r.room || "—"}</TableCell>
                <TableCell>{fmtDate(r.schedule_date)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {fmtTime(r.from_time)} – {fmtTime(r.to_time)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/subject-schedule/${encodeURIComponent(r.name)}`)}
                    onEdit={() => navigate(`/dashboard/subject-schedule/${encodeURIComponent(r.name)}/edit`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No subject schedules found" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pager page={page} setPage={setPage} pageSize={20} count={total} />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete schedule "${deleteTarget?.title || deleteTarget?.name}"?`}
        description="This action cannot be undone."
      />
    </>
  );
}

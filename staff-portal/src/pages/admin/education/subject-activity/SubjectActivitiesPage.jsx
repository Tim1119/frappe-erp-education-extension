import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { usePagination } from "@/hooks";
import {
  getSubjectActivities,
  deleteSubjectActivity,
  getStudents,
  getCourses,
} from "@/services/education/subjectActivityService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDateTime } from "@/utils/format";

const CONTENT_TYPE_OPTIONS = ["Article", "Video"];

// Course Activity is a real, permanently-locked system activity log
// (every field is set_only_once; the only real creation path is
// Course Enrollment.add_activity(), triggered when a student views an
// Article/Video, not a staff-typed form) -- so this is List + Profile
// only, no Add button, no Edit action. Delete is kept since Academics
// User genuinely has real delete permission (e.g. removing a bad
// auto-logged entry), matching the real permissions array exactly.
export default function SubjectActivitiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, setPage } = usePagination(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState(searchParams.get("student") || "");
  const [courseFilter, setCourseFilter] = useState(searchParams.get("course") || "");
  const [contentTypeFilter, setContentTypeFilter] = useState(searchParams.get("content_type") || "");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [studentOptions, setStudentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const r = await getSubjectActivities({
        page,
        search,
        student: studentFilter,
        course: courseFilter,
        content_type: contentTypeFilter,
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
    getStudents().then((r) => setStudentOptions((r || []).map((s) => s.name))).catch(() => {});
    getCourses().then((r) => setCourseOptions((r || []).map((c) => c.name))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentFilter, courseFilter, contentTypeFilter]);

  async function confirmDelete() {
    try {
      await deleteSubjectActivity(deleteTarget.name);
      toast.success("Subject activity deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Subject Activity"
        description={loading ? "Loading…" : `${total} activity records`}
      />

      <Toolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          {
            key: "student", label: "Student", value: studentFilter,
            onChange: (v) => { setStudentFilter(v); setPage(1); }, options: studentOptions,
          },
          {
            key: "course", label: "Subject", value: courseFilter,
            onChange: (v) => { setCourseFilter(v); setPage(1); }, options: courseOptions,
          },
          {
            key: "content_type", label: "Content Type", value: contentTypeFilter,
            onChange: (v) => { setContentTypeFilter(v); setPage(1); }, options: CONTENT_TYPE_OPTIONS,
          },
        ]}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead className="hidden sm:table-cell">Content</TableHead>
              <TableHead className="hidden sm:table-cell">Activity Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.name}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/subject-activity/${encodeURIComponent(r.name)}`)}
              >
                <TableCell className="font-medium">{r.student || "—"}</TableCell>
                <TableCell>{r.course || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{r.content_type || "—"}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell">{r.content || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{fmtDateTime(r.activity_date)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/subject-activity/${encodeURIComponent(r.name)}`)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No subject activity found" />
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
        title={`Delete this activity record for ${deleteTarget?.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

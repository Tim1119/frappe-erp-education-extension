import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getSubjectActivity, deleteSubjectActivity } from "@/services/education/subjectActivityService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDateTime } from "@/utils/format";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function LinkField({ label, value, onClick }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <button onClick={onClick} className="text-sm font-medium text-primary hover:underline">
        {value}
      </button>
    </div>
  );
}

// No Connections card -- confirmed via both real mechanisms: the JSON
// has no "links" array entries and no course_activity_dashboard.py file
// exists. No Edit action either -- every field on the real doctype is
// set_only_once (locked forever after creation), so there's nothing to
// edit; Delete remains since Academics User genuinely has real delete
// permission.
export default function SubjectActivityProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getSubjectActivity(name)
      .then(setActivity)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  async function handleDelete() {
    try {
      await deleteSubjectActivity(name);
      toast.success("Subject activity deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/subject-activity");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!activity) {
    return <p className="text-muted-foreground">Subject activity record not found.</p>;
  }

  const contentRoute = activity.content_type === "Video" ? "videos" : "articles";

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title={`${activity.student || "Unknown Student"} — ${activity.content_type || ""}`}
        button={
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activity.student ? (
              <LinkField
                label="Student"
                value={activity.student}
                onClick={() => navigate(`/dashboard/students/${encodeURIComponent(activity.student)}`)}
              />
            ) : (
              <Field label="Student" value={activity.student} />
            )}

            {activity.course ? (
              <LinkField
                label="Subject"
                value={activity.course}
                onClick={() => navigate(`/dashboard/subjects/${encodeURIComponent(activity.course)}`)}
              />
            ) : (
              <Field label="Subject" value={activity.course} />
            )}

            {activity.enrollment ? (
              <LinkField
                label="Subject Enrollment"
                value={activity.enrollment}
                onClick={() => navigate(`/dashboard/subject-enrollment/${encodeURIComponent(activity.enrollment)}`)}
              />
            ) : (
              <Field label="Subject Enrollment" value={activity.enrollment} />
            )}

            <div>
              <p className="text-xs text-muted-foreground">Content Type</p>
              <Badge variant="secondary" className="mt-1">{activity.content_type || "—"}</Badge>
            </div>

            {activity.content ? (
              <LinkField
                label="Content"
                value={activity.content}
                onClick={() => navigate(`/dashboard/${contentRoute}/${encodeURIComponent(activity.content)}`)}
              />
            ) : (
              <Field label="Content" value={activity.content} />
            )}

            <Field label="Activity Date" value={fmtDateTime(activity.activity_date)} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete this activity record for ${activity.student}?`}
        description="This action cannot be undone."
      />
    </>
  );
}

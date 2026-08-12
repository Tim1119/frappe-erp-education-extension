import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import {
  getAssessmentGroup,
  getAssessmentGroups,
  createAssessmentGroup,
  updateAssessmentGroup,
} from "@/services/education/assessmentGroupService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  assessment_group_name: "",
  parent_assessment_group: "",
  is_group: false,
};

export default function AssessmentGroupFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [parentOptions, setParentOptions] = useState([]);
  const [hasChildren, setHasChildren] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAssessmentGroups()
      .then((r) => setParentOptions((r.rows || []).filter((g) => g.name !== name)))
      .catch(() => {});
  }, [name]);

  useEffect(() => {
    if (!name) return;
    getAssessmentGroup(name)
      .then((d) => {
        setForm({
          assessment_group_name: d.assessment_group_name || "",
          parent_assessment_group: d.parent_assessment_group || "",
          is_group: Boolean(d.is_group),
        });
        setHasChildren(Boolean(d.has_children));
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.assessment_group_name || !form.parent_assessment_group) {
      toast.error("Assessment Group Name and Parent Assessment Group are required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateAssessmentGroup(name, form);
        toast.success("Assessment group updated");
      } else {
        await createAssessmentGroup(form);
        toast.success("Assessment group created");
      }
      navigate("/dashboard/assessment-group");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? "Edit Assessment Group" : "New Assessment Group"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assessment Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Assessment Group Name <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.assessment_group_name || "—"}
                  </div>
                ) : (
                  <Input
                    required
                    value={form.assessment_group_name}
                    onChange={(e) => upd("assessment_group_name", e.target.value)}
                    placeholder="e.g. First Term Exam"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Parent Assessment Group <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.parent_assessment_group}
                  onValueChange={(v) => upd("parent_assessment_group", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent group" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((g) => (
                      <SelectItem key={g.name} value={g.name}>
                        {"— ".repeat(g.depth || 0)}
                        {g.assessment_group_name || g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.is_group}
                    disabled={hasChildren && form.is_group}
                    onChange={(e) => upd("is_group", e.target.checked)}
                  />
                  <span className="text-sm">Is Group (can contain other assessment groups)</span>
                </label>
                {hasChildren && form.is_group && (
                  <p className="text-xs text-muted-foreground">
                    This group already has child assessment groups, so it cannot be turned into a leaf node.
                  </p>
                )}
              </div>
            </div>

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Assessment Group Name cannot be changed after creation.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/assessment-group")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Assessment Group" : "Create Assessment Group"}
          </Button>
        </div>
      </form>
    </>
  );
}

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
  getAssessmentCriteria,
  createAssessmentCriteria,
  updateAssessmentCriteria,
  getAssessmentCriteriaGroups,
} from "@/services/assessmentCriteriaService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  assessment_criteria: "",
  assessment_criteria_group: "",
};

// Mirrors assessment_criteria.py's own validate() -- a fixed reserved-word
// list, checked here only to save a round trip; the real backend check
// (case-insensitive, identical list) remains authoritative.
const RESERVED_NAMES = new Set([
  "total", "total score", "total grade", "maximum score", "score", "grade",
]);

export default function AssessmentCriteriaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAssessmentCriteriaGroups()
      .then((r) => setGroupOptions((r || []).map((g) => g.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!name) return;
    getAssessmentCriteria(name)
      .then((d) => {
        setForm({
          assessment_criteria: d.assessment_criteria || "",
          assessment_criteria_group: d.assessment_criteria_group || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.assessment_criteria) {
      toast.error("Assessment Criteria is required.");
      return;
    }
    if (!isEdit && RESERVED_NAMES.has(form.assessment_criteria.trim().toLowerCase())) {
      toast.error("Can't create standard criteria. Please rename the criteria.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateAssessmentCriteria(name, form);
        toast.success("Assessment criteria updated");
      } else {
        await createAssessmentCriteria(form);
        toast.success("Assessment criteria created");
      }
      navigate("/dashboard/assessment-criteria");
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
      <PageHeader title={isEdit ? "Edit Assessment Criteria" : "New Assessment Criteria"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assessment Criteria Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Assessment Criteria <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.assessment_criteria || "—"}
                  </div>
                ) : (
                  <Input
                    required
                    value={form.assessment_criteria}
                    onChange={(e) => upd("assessment_criteria", e.target.value)}
                    placeholder="e.g. CA1"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Assessment Criteria Group</Label>
                <Select
                  value={form.assessment_criteria_group}
                  onValueChange={(v) => upd("assessment_criteria_group", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Assessment Criteria cannot be changed after creation.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/assessment-criteria")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Assessment Criteria" : "Create Assessment Criteria"}
          </Button>
        </div>
      </form>
    </>
  );
}

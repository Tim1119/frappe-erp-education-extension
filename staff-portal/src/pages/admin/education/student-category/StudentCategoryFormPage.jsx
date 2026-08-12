import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/PageHeader";
import {
  getStudentCategory,
  createStudentCategory,
  updateStudentCategory,
} from "@/services/education/studentCategoryService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  category: "",
};

export default function StudentCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!name) return;
    getStudentCategory(name)
      .then((d) => {
        setForm({ category: d.category || "" });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateStudentCategory(name, form);
        toast.success("Student category updated");
        navigate(`/dashboard/student-category/${encodeURIComponent(name)}`);
      } else {
        const result = await createStudentCategory(form);
        toast.success("Student category created");
        navigate(`/dashboard/student-category/${encodeURIComponent(result.name)}`);
      }
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
      <PageHeader title={isEdit ? "Edit Student Category" : "New Student Category"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.category || "—"}
                  </div>
                ) : (
                  <Input
                    required
                    value={form.category}
                    onChange={(e) => upd("category", e.target.value)}
                    placeholder="e.g. Sports"
                  />
                )}
              </div>
            </div>

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Category cannot be changed after creation.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/student-category")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Student Category" : "Create Student Category"}
          </Button>
        </div>
      </form>
    </>
  );
}

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
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
} from "@/services/education/academicYearService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  academic_year_name: "",
  year_start_date: "",
  year_end_date: "",
};

export default function AcademicYearFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!name) return;
    getAcademicYear(name)
      .then((d) => {
        setForm({
          academic_year_name: d.academic_year_name || "",
          year_start_date: d.year_start_date || "",
          year_end_date: d.year_end_date || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [name]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Friendly client-side pre-check mirroring the controller's own
  // validate(): year_start_date must not be later than year_end_date.
  // The doctype's validate() still runs server-side as the source of
  // truth -- this only saves a round trip for the common typo case.
  const datesOutOfOrder = Boolean(
    form.year_start_date &&
    form.year_end_date &&
    form.year_start_date > form.year_end_date
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (datesOutOfOrder) {
      toast.error("Year Start Date cannot be later than Year End Date");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateAcademicYear(name, form);
        toast.success("Academic year updated");
        navigate(`/dashboard/academic-year/${encodeURIComponent(name)}`);
      } else {
        const result = await createAcademicYear(form);
        toast.success("Academic year created");
        navigate(`/dashboard/academic-year/${encodeURIComponent(result.name)}`);
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
      <PageHeader title={isEdit ? "Edit Academic Year" : "New Academic Year"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic Year Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Academic Year Name <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.academic_year_name || "—"}
                  </div>
                ) : (
                  <Input
                    required
                    value={form.academic_year_name}
                    onChange={(e) => upd("academic_year_name", e.target.value)}
                    placeholder="e.g. 2026/2027"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Year Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.year_start_date}
                  onChange={(e) => upd("year_start_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Year End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.year_end_date}
                  onChange={(e) => upd("year_end_date", e.target.value)}
                />
              </div>
            </div>

            {datesOutOfOrder && (
              <p className="mt-4 text-xs text-destructive">
                Year Start Date cannot be later than Year End Date.
              </p>
            )}

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Academic Year Name cannot be changed after creation.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/academic-year")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || datesOutOfOrder}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Academic Year" : "Create Academic Year"}
          </Button>
        </div>
      </form>
    </>
  );
}

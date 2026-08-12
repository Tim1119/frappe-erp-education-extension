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
  getAcademicTerm,
  createAcademicTerm,
  updateAcademicTerm,
  getAcademicYears,
} from "@/services/education/academicTermService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY = {
  academic_year: "",
  term_name: "",
  term_start_date: "",
  term_end_date: "",
};

export default function AcademicTermFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [form, setForm] = useState(EMPTY);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAcademicYears()
      .then((r) => setYearOptions((r || []).map((y) => y.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!name) return;
    getAcademicTerm(name)
      .then((d) => {
        setForm({
          academic_year: d.academic_year || "",
          term_name: d.term_name || "",
          term_start_date: d.term_start_date || "",
          term_end_date: d.term_end_date || "",
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
    setSaving(true);
    try {
      if (isEdit) {
        await updateAcademicTerm(name, form);
        toast.success("Academic term updated");
      } else {
        await createAcademicTerm(form);
        toast.success("Academic term created");
      }
      navigate("/dashboard/academic-term");
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
      <PageHeader title={isEdit ? "Edit Academic Term" : "New Academic Term"} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic Term Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Academic Year <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.academic_year || "—"}
                  </div>
                ) : (
                  <Select
                    value={form.academic_year}
                    onValueChange={(v) => upd("academic_year", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Term Name <span className="text-destructive">*</span>
                </Label>
                {isEdit ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                    {form.term_name || "—"}
                  </div>
                ) : (
                  <Input
                    required
                    value={form.term_name}
                    onChange={(e) => upd("term_name", e.target.value)}
                    placeholder="e.g. First Term"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Term Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.term_start_date}
                  onChange={(e) => upd("term_start_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Term End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={form.term_end_date}
                  onChange={(e) => upd("term_end_date", e.target.value)}
                />
              </div>
            </div>

            {isEdit && (
              <p className="mt-4 text-xs text-muted-foreground">
                Academic Year and Term Name cannot be changed after creation.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/academic-term")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Academic Term" : "Create Academic Term"}
          </Button>
        </div>
      </form>
    </>
  );
}
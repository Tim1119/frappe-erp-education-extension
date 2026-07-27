import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import {
  getSchoolSettings,
  updateSchoolSettings,
  getCompanies,
  getPrintFormats,
} from "@/services/schoolSettingsService";
import { getErrorMessage } from "@/utils/errors";

const EMPTY_CRITERIA_ROW = { criteria_name: "", is_active: 0 };
const EMPTY_GRADE_ROW = { grade_code: "", min_percentage: "", max_percentage: "", description: "" };

const EMPTY = {
  school: "",
  next_term_start_date: "",
  secondary_school_print_format: "",
  primary_school_print_format: "",
  remark_score_for_secondary_school: "",
  remark_score_for_primary_school: "",
  principal_signature: "",
  headteacher_signature: "",
  primary_school_stamp_image: "",
  secondary_school_stamp_image: "",
  assessment_criteria_item: [],
  overall_grading_scale: [],
};

// Same upload-file pattern as ClassForm.jsx's hero_image / EducationSettingsPage's logo
async function uploadFile(file, fieldname) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doctype", "School Settings");
  formData.append("docname", "School Settings");
  formData.append("fieldname", fieldname);

  try {
    const response = await fetch("/api/method/upload_file", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-Frappe-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content || "",
      },
    });
    const result = await response.json();
    return result?.message?.file_url || null;
  } catch (err) {
    return null;
  }
}

function ImageField({ label, value, onChange, fieldname }) {
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const inputId = `upload-${fieldname}`;

  useEffect(() => {
    setLoadError(false);
  }, [value]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadFile(file, fieldname);
    setUploading(false);

    if (url) {
      onChange(url);
    } else {
      toast.error("Failed to upload image. Please try again.");
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          id={inputId}
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById(inputId).click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="outline" onClick={() => onChange("")}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      {value && (
        loadError ? (
          <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-center text-xs text-muted-foreground">
            Image unavailable
          </div>
        ) : (
          <img
            src={value}
            alt={label}
            className="mt-2 h-20 w-20 rounded-md border object-cover"
            onError={() => setLoadError(true)}
          />
        )
      )}
    </div>
  );
}

export default function SchoolSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [printFormatOptions, setPrintFormatOptions] = useState([]);

  useEffect(() => {
    getSchoolSettings()
      .then((d) => {
        setForm({
          school: d.school || "",
          next_term_start_date: d.next_term_start_date || "",
          secondary_school_print_format: d.secondary_school_print_format || "",
          primary_school_print_format: d.primary_school_print_format || "",
          remark_score_for_secondary_school: d.remark_score_for_secondary_school ?? "",
          remark_score_for_primary_school: d.remark_score_for_primary_school ?? "",
          principal_signature: d.principal_signature || "",
          headteacher_signature: d.headteacher_signature || "",
          primary_school_stamp_image: d.primary_school_stamp_image || "",
          secondary_school_stamp_image: d.secondary_school_stamp_image || "",
          assessment_criteria_item: d.assessment_criteria_item?.length
            ? d.assessment_criteria_item.map((r) => ({
                criteria_name: r.criteria_name || "",
                is_active: r.is_active || 0,
              }))
            : [],
          overall_grading_scale: d.overall_grading_scale?.length
            ? d.overall_grading_scale.map((r) => ({
                grade_code: r.grade_code || "",
                min_percentage: r.min_percentage ?? "",
                max_percentage: r.max_percentage ?? "",
                description: r.description || "",
              }))
            : [],
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCompanies()
      .then((r) => setCompanyOptions((r || []).map((c) => c.name)))
      .catch(() => {});
    getPrintFormats()
      .then((r) => setPrintFormatOptions((r || []).map((p) => p.name)))
      .catch(() => {});
  }, []);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addCriteriaRow() {
    setForm((p) => ({
      ...p,
      assessment_criteria_item: [...p.assessment_criteria_item, { ...EMPTY_CRITERIA_ROW }],
    }));
  }

  function removeCriteriaRow(index) {
    setForm((p) => ({
      ...p,
      assessment_criteria_item: p.assessment_criteria_item.filter((_, i) => i !== index),
    }));
  }

  function updateCriteriaRow(index, field, value) {
    const rows = [...form.assessment_criteria_item];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, assessment_criteria_item: rows }));
  }

  function addGradeRow() {
    setForm((p) => ({
      ...p,
      overall_grading_scale: [...p.overall_grading_scale, { ...EMPTY_GRADE_ROW }],
    }));
  }

  function removeGradeRow(index) {
    setForm((p) => ({
      ...p,
      overall_grading_scale: p.overall_grading_scale.filter((_, i) => i !== index),
    }));
  }

  function updateGradeRow(index, field, value) {
    const rows = [...form.overall_grading_scale];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, overall_grading_scale: rows }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSchoolSettings(form);
      toast.success("School settings saved");
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
      <PageHeader eyebrow="Settings" title="School Settings" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>School</Label>
                <Select value={form.school} onValueChange={(v) => upd("school", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyOptions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Next Term Start Date</Label>
                <Input
                  type="date"
                  value={form.next_term_start_date}
                  onChange={(e) => upd("next_term_start_date", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">School Result Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">Assessment Criteria Item</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criteria Name</TableHead>
                    <TableHead>Is Active</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.assessment_criteria_item.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={row.criteria_name}
                          onChange={(e) => updateCriteriaRow(index, "criteria_name", e.target.value)}
                          placeholder="e.g. Punctuality"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={row.is_active === 1}
                          onChange={(e) => updateCriteriaRow(index, "is_active", e.target.checked ? 1 : 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCriteriaRow(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" className="mt-3" onClick={addCriteriaRow}>
                <Plus className="mr-2 h-4 w-4" /> Add Criteria
              </Button>
            </div>

            <div>
              <Label className="mb-2 block">Overall Term Grading Scale</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade *</TableHead>
                    <TableHead>Min % *</TableHead>
                    <TableHead>Max % *</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.overall_grading_scale.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          required
                          value={row.grade_code}
                          onChange={(e) => updateGradeRow(index, "grade_code", e.target.value)}
                          placeholder="e.g. A"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          value={row.min_percentage}
                          onChange={(e) => updateGradeRow(index, "min_percentage", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          value={row.max_percentage}
                          onChange={(e) => updateGradeRow(index, "max_percentage", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.description}
                          onChange={(e) => updateGradeRow(index, "description", e.target.value)}
                          placeholder="Optional"
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGradeRow(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" className="mt-3" onClick={addGradeRow}>
                <Plus className="mr-2 h-4 w-4" /> Add Grade
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Print Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary School Print Format</Label>
                <Select
                  value={form.primary_school_print_format}
                  onValueChange={(v) => upd("primary_school_print_format", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select print format" />
                  </SelectTrigger>
                  <SelectContent>
                    {printFormatOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Secondary School Print Format</Label>
                <Select
                  value={form.secondary_school_print_format}
                  onValueChange={(v) => upd("secondary_school_print_format", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select print format" />
                  </SelectTrigger>
                  <SelectContent>
                    {printFormatOptions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Remark Score For School <span className="text-xs font-normal text-muted-foreground">(Good Standing or Non Good Standing)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Remark Score For Primary School <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  required
                  value={form.remark_score_for_primary_school}
                  onChange={(e) => upd("remark_score_for_primary_school", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This score specifies the mark above which primary school get a remark of Good or Fail.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Remark Score For Secondary School <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  required
                  value={form.remark_score_for_secondary_school}
                  onChange={(e) => upd("remark_score_for_secondary_school", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This score specifies the mark above which Secondary School Students get a remark of Good or Fail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageField
                label="Principal's Signature"
                fieldname="principal_signature"
                value={form.principal_signature}
                onChange={(v) => upd("principal_signature", v)}
              />
              <ImageField
                label="Headteacher Signature"
                fieldname="headteacher_signature"
                value={form.headteacher_signature}
                onChange={(v) => upd("headteacher_signature", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">School Stamp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageField
                label="Primary School Stamp Image"
                fieldname="primary_school_stamp_image"
                value={form.primary_school_stamp_image}
                onChange={(v) => upd("primary_school_stamp_image", v)}
              />
              <ImageField
                label="Secondary School Stamp Image"
                fieldname="secondary_school_stamp_image"
                value={form.secondary_school_stamp_image}
                onChange={(v) => upd("secondary_school_stamp_image", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </>
  );
}

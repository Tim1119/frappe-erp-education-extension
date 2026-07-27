import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import {
  getEducationSettings,
  updateEducationSettings,
  getAcademicYears,
  getAcademicTerms,
} from "@/services/educationSettingsService";
import { getErrorMessage } from "@/utils/errors";

const INSTRUCTOR_NAMING_OPTIONS = ["Full Name", "Naming Series", "Employee Number"];

const EMPTY = {
  current_academic_year: "",
  current_academic_term: "",
  attendance_freeze_date: "",
  validate_batch: 0,
  validate_course: 0,
  academic_term_reqd: 0,
  instructor_created_by: "Full Name",
  user_creation_skip: 0,
  create_so: 0,
  auto_submit_sales_invoice: 0,
  sales_invoice_posting_date_fee_schedule: 1,
  auto_submit_sales_order: 0,
  sales_order_transaction_date_fee_schedule: 1,
  attendance_based_on_course_schedule: 0,
  razorpay_key: "",
  razorpay_secret: "",
  school_college_name_abbreviation: "",
  school_college_logo: "",
};

function Check({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-2">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
    </label>
  );
}

export default function EducationSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [academicTermOptions, setAcademicTermOptions] = useState([]);

  useEffect(() => {
    getEducationSettings()
      .then((d) => {
        setForm({
          current_academic_year: d.current_academic_year || "",
          current_academic_term: d.current_academic_term || "",
          attendance_freeze_date: d.attendance_freeze_date || "",
          validate_batch: d.validate_batch || 0,
          validate_course: d.validate_course || 0,
          academic_term_reqd: d.academic_term_reqd || 0,
          instructor_created_by: d.instructor_created_by || "Full Name",
          user_creation_skip: d.user_creation_skip || 0,
          create_so: d.create_so || 0,
          auto_submit_sales_invoice: d.auto_submit_sales_invoice || 0,
          sales_invoice_posting_date_fee_schedule: d.sales_invoice_posting_date_fee_schedule ?? 1,
          auto_submit_sales_order: d.auto_submit_sales_order || 0,
          sales_order_transaction_date_fee_schedule: d.sales_order_transaction_date_fee_schedule ?? 1,
          attendance_based_on_course_schedule: d.attendance_based_on_course_schedule || 0,
          razorpay_key: d.razorpay_key || "",
          razorpay_secret: d.razorpay_secret || "",
          school_college_name_abbreviation: d.school_college_name_abbreviation || "",
          school_college_logo: d.school_college_logo || "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getAcademicYears()
      .then((r) => setAcademicYearOptions((r || []).map((y) => y.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getAcademicTerms(form.current_academic_year || undefined)
      .then((r) => setAcademicTermOptions((r || []).map((t) => t.name)))
      .catch(() => setAcademicTermOptions([]));
  }, [form.current_academic_year]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function uploadLogo(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doctype", "Education Settings");
    formData.append("docname", "Education Settings");
    formData.append("fieldname", "school_college_logo");

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

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const url = await uploadLogo(file);
    setUploadingLogo(false);

    if (url) {
      upd("school_college_logo", url);
    } else {
      toast.error("Failed to upload logo. Please try again.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEducationSettings(form);
      toast.success("Education settings saved");
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
      <PageHeader eyebrow="Settings" title="Education Settings" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Current Academic Year</Label>
                <Select
                  value={form.current_academic_year}
                  onValueChange={(v) => upd("current_academic_year", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Academic Term</Label>
                <Select
                  value={form.current_academic_term}
                  onValueChange={(v) => upd("current_academic_term", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic term" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTermOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Attendance Freeze Date</Label>
                <Input
                  type="date"
                  value={form.attendance_freeze_date}
                  onChange={(e) => upd("attendance_freeze_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Instructor Records to be created by</Label>
                <Select
                  value={form.instructor_created_by}
                  onValueChange={(v) => upd("instructor_created_by", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTRUCTOR_NAMING_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Check
                label="Validate Batch for Students in Class Arm"
                description="For Batch based Class Arm, the Student Batch will be validated for every Student from the Class Enrollment."
                checked={form.validate_batch}
                onChange={(v) => upd("validate_batch", v)}
              />
              <Check
                label="Validate Enrolled Subject for Students in Class Arm"
                description="For Subject based Class Arm, the Subject will be validated for every Student from the enrolled Subjects in Class Enrollment."
                checked={form.validate_course}
                onChange={(v) => upd("validate_course", v)}
              />
              <Check
                label="Make Academic Term Mandatory"
                description="If enabled, field Academic Term will be Mandatory in Class Enrollment Tool."
                checked={form.academic_term_reqd}
                onChange={(v) => upd("academic_term_reqd", v)}
              />
              <Check
                label="Skip User creation for new Student"
                description="By default, a new User is created for every new Student. If enabled, no new User will be created when a new Student is created."
                checked={form.user_creation_skip}
                onChange={(v) => upd("user_creation_skip", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accounting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Check
              label="Create Sales Order instead of Sales Invoice"
              description="By default, Sales Invoice will be created against Class Enrollment / Fee Schedule. If enabled Sales Order will be created."
              checked={form.create_so}
              onChange={(v) => upd("create_so", v)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {form.create_so ? (
                <>
                  <Check
                    label="Submit Sales Order from Class Enrollment / Fee Schedule"
                    description="By default, the Sales Order Created will be in Draft Mode. If enabled, the Sales Order will be submitted once created."
                    checked={form.auto_submit_sales_order}
                    onChange={(v) => upd("auto_submit_sales_order", v)}
                  />
                  <Check
                    label="Sales Order Posting Date should be same as Fee Schedule Posting Date"
                    description="By default, the Sales Order's Transaction Date will be equal to Fee Schedule's Transaction Date. If disabled then Sales Order's Transaction Date will be today's date."
                    checked={form.sales_order_transaction_date_fee_schedule}
                    onChange={(v) => upd("sales_order_transaction_date_fee_schedule", v)}
                  />
                </>
              ) : (
                <>
                  <Check
                    label="Submit Sales Invoice from Class Enrollment / Fee Schedule"
                    description="By default, the Sales Invoice Created will be in Draft Mode. If enabled, the Sales Invoice will be submitted once created."
                    checked={form.auto_submit_sales_invoice}
                    onChange={(v) => upd("auto_submit_sales_invoice", v)}
                  />
                  <Check
                    label="Sales Invoice Posting Date should be same as Fee Schedule Posting Date"
                    description="By default, the Sales Invoice's Posting Date will be equal to Fee Schedule's Posting Date. If disabled then Sales Invoice's Posting Date will be today's date."
                    checked={form.sales_invoice_posting_date_fee_schedule}
                    onChange={(v) => upd("sales_invoice_posting_date_fee_schedule", v)}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Portal Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Check
              label="Attendance Based on Subject Schedule"
              description="If enabled, the attendance will be marked on Subject Schedule basis and will be mandatory. If disabled, the attendance will be marked on Class Arm basis for that particular date."
              checked={form.attendance_based_on_course_schedule}
              onChange={(v) => upd("attendance_based_on_course_schedule", v)}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Razorpay Key</Label>
                <Input
                  value={form.razorpay_key}
                  onChange={(e) => upd("razorpay_key", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Razorpay Secret</Label>
                <Input
                  type="password"
                  value={form.razorpay_secret}
                  onChange={(e) => upd("razorpay_secret", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>School / College Name Abbreviation</Label>
                <Input
                  value={form.school_college_name_abbreviation}
                  onChange={(e) => upd("school_college_name_abbreviation", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>School / College Logo</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingLogo}
                  onClick={() => document.getElementById("logo-upload").click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                {form.school_college_logo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => upd("school_college_logo", "")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              {form.school_college_logo && (
                <img
                  src={form.school_college_logo}
                  alt="School / College logo"
                  className="mt-2 h-20 w-20 rounded-md border object-cover"
                />
              )}
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

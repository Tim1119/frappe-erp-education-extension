import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const EMPTY_INTERVAL = { grade_code: "", threshold: "", grade_description: "" };

const EMPTY = {
  grading_scale_name: "",
  description: "",
  intervals: [{ ...EMPTY_INTERVAL, threshold: "0" }],
};

export default function GradingScaleForm({ gradingScale, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(gradingScale);

  useEffect(() => {
    if (!gradingScale) {
      setForm(EMPTY);
      return;
    }
    setForm({
      grading_scale_name: gradingScale.grading_scale_name || "",
      description: gradingScale.description || "",
      intervals: gradingScale.intervals?.length
        ? gradingScale.intervals.map((i) => ({
            grade_code: i.grade_code || "",
            threshold: i.threshold ?? "",
            grade_description: i.grade_description || "",
          }))
        : [{ ...EMPTY_INTERVAL, threshold: "0" }],
    });
  }, [gradingScale]);

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addRow() {
    setForm((p) => ({ ...p, intervals: [...p.intervals, { ...EMPTY_INTERVAL }] }));
  }

  function removeRow(index) {
    setForm((p) => ({ ...p, intervals: p.intervals.filter((_, i) => i !== index) }));
  }

  function updateRow(index, field, value) {
    const rows = [...form.intervals];
    rows[index] = { ...rows[index], [field]: value };
    setForm((p) => ({ ...p, intervals: rows }));
  }

  // Mirrors grading_scale.py's validate(): thresholds must not repeat,
  // and a Threshold 0% row is required.
  const filledThresholds = form.intervals
    .filter((i) => i.threshold !== "" && i.threshold !== null && i.threshold !== undefined)
    .map((i) => Number(i.threshold));
  const hasDuplicateThreshold = new Set(filledThresholds).size !== filledThresholds.length;
  const hasZeroThreshold = filledThresholds.includes(0);
  const hasEmptyRow = form.intervals.length === 0;

  const canSubmit = !hasDuplicateThreshold && hasZeroThreshold && !hasEmptyRow;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Grading Scale Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Grading Scale Name <span className="text-destructive">*</span>
              </Label>
              {isEdit ? (
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  {form.grading_scale_name || "—"}
                </div>
              ) : (
                <Input
                  required
                  value={form.grading_scale_name}
                  onChange={(e) => upd("grading_scale_name", e.target.value)}
                  placeholder="e.g. Standard Grading"
                />
              )}
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => upd("description", e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>

          {isEdit && (
            <p className="mt-4 text-xs text-muted-foreground">
              Grading Scale Name cannot be changed after creation.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Intervals <span className="text-destructive">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade Code *</TableHead>
                <TableHead>Threshold (%) *</TableHead>
                <TableHead>Grade Description</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.intervals.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      required
                      value={row.grade_code}
                      onChange={(e) => updateRow(index, "grade_code", e.target.value)}
                      placeholder="e.g. A"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={row.threshold}
                      onChange={(e) => updateRow(index, "threshold", e.target.value)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.grade_description}
                      onChange={(e) => updateRow(index, "grade_description", e.target.value)}
                      placeholder="Optional"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button type="button" variant="outline" className="mt-3" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" /> Add Interval
          </Button>

          {hasEmptyRow && (
            <p className="mt-4 text-xs text-destructive">
              At least one interval is required.
            </p>
          )}
          {hasDuplicateThreshold && (
            <p className="mt-4 text-xs text-destructive">
              Each threshold can only appear once — remove the duplicate.
            </p>
          )}
          {!hasZeroThreshold && (
            <p className="mt-4 text-xs text-destructive">
              A Threshold 0% row is required.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !canSubmit}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Grading Scale" : "Create Grading Scale"}
        </Button>
      </div>
    </form>
  );
}

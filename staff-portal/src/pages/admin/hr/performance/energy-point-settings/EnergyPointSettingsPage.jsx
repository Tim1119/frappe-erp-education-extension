import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import {
  getEnergyPointSettings,
  getEnergyPointSettingsOptions,
  giveReviewPoints,
  updateEnergyPointSettings,
} from "@/services/hr/performance/energyPointSettingsService";
import { getErrorMessage } from "@/utils/errors";
import PerformanceChildTable from "../shared/PerformanceChildTable";

const REVIEW_LEVELS = {
  name: "review_levels",
  label: "Review Levels",
  fields: [
    { name: "level_name", label: "Level Name", required: true },
    { name: "role", label: "Role", type: "link", options: "roles", required: true },
    { name: "review_points", label: "Review Points", type: "number", required: true },
  ],
};

export default function EnergyPointSettingsPage() {
  const [form, setForm] = useState({
    enabled: 0,
    review_levels: [],
    point_allocation_periodicity: "Weekly",
    last_point_allocation_date: "",
  });
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState({ user: "", points: "" });
  const [giving, setGiving] = useState(false);

  useEffect(() => {
    Promise.all([getEnergyPointSettings(), getEnergyPointSettingsOptions()])
      .then(([doc, opts]) => {
        setForm({
          enabled: Number(doc.enabled) || 0,
          review_levels: doc.review_levels || [],
          point_allocation_periodicity: doc.point_allocation_periodicity || "Weekly",
          last_point_allocation_date: doc.last_point_allocation_date || "",
        });
        setOptions(opts || {});
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateEnergyPointSettings(form);
      toast.success("Energy Point Settings updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function submitReviewPoints() {
    if (!review.user) return toast.error("User is required");
    if (review.points === "" || review.points === null) return toast.error("Points are required");
    setGiving(true);
    try {
      await giveReviewPoints(review.user, review.points);
      toast.success("Review points added");
      setReview({ user: "", points: "" });
      setReviewOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGiving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const enabled = Boolean(Number(form.enabled));
  const reviewButton = enabled ? (
    <button type="button" className="btn btn-secondary" onClick={() => setReviewOpen(true)}>
      Give Review Points
    </button>
  ) : null;

  return <>
    <PageHeader
      eyebrow="HR · Performance"
      title="Energy Point Settings"
      sub="Configure energy point reviews and allocation frequency."
      button={reviewButton}
    />
    <form onSubmit={save} className="panel">
      <div className="panel-head"><div className="panel-title">Energy Point Settings</div></div>
      <div className="grid-form" style={{ padding: "16px 20px 26px" }}>
        <div className="field">
          <label className="label">Enabled</label>
          <label className="flex h-9 items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked ? 1 : 0 }))}
            />
            <span className="text-sm">{enabled ? "Yes" : "No"}</span>
          </label>
        </div>

        {enabled && <>
          <PerformanceChildTable
            table={REVIEW_LEVELS}
            rows={form.review_levels || []}
            onChange={(rows) => setForm((current) => ({ ...current, review_levels: rows }))}
            options={options}
          />
          <div className="field">
            <label className="label">Point Allocation Periodicity</label>
            <select
              className="input"
              value={form.point_allocation_periodicity}
              onChange={(event) => setForm((current) => ({ ...current, point_allocation_periodicity: event.target.value }))}
            >
              {["Daily", "Weekly", "Monthly"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Last Point Allocation Date</label>
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {form.last_point_allocation_date || "—"}
            </div>
          </div>
        </>}
      </div>
      <div className="flex justify-end p-5 pt-0">
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
      </div>
    </form>

    <Modal
      open={reviewOpen}
      onClose={() => setReviewOpen(false)}
      title="Give Review Points"
      footer={<>
        <button type="button" className="btn btn-secondary" onClick={() => setReviewOpen(false)}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={giving} onClick={submitReviewPoints}>
          {giving ? "Submitting..." : "Submit"}
        </button>
      </>}
    >
      <div className="space-y-4">
        <div className="field">
          <label className="label">User <span className="text-destructive">*</span></label>
          <SearchableSelect
            value={review.user}
            onChange={(value) => setReview((current) => ({ ...current, user: value }))}
            options={options.users || []}
            displayField="full_name"
            showId
            linkedDoctype={null}
            label="User"
            placeholder="Search user..."
          />
        </div>
        <div className="field">
          <label className="label">Points <span className="text-destructive">*</span></label>
          <input
            className="input"
            type="number"
            step="1"
            value={review.points}
            onChange={(event) => setReview((current) => ({ ...current, points: event.target.value }))}
          />
        </div>
      </div>
    </Modal>
  </>;
}

import { useState, useEffect } from "react";
import { Video as VideoIcon, Calendar, FileText, Link, Play, Clock } from "lucide-react";

function SectionPanel({ icon: Icon, title, children }) {
  return (
    <div className="panel" style={{ marginBottom: 18, overflow: "visible" }}>
      <div className="panel-head">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
      </div>
      <div style={{ padding: "4px 18px 22px", overflow: "visible" }}>{children}</div>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="label">
      {children}
      {required && (
        <span style={{ color: "var(--danger-ink, #ef4444)", marginLeft: 3 }}>
          *
        </span>
      )}
    </label>
  );
}

// Convert duration parts to seconds
function durationToSeconds(days, hours, minutes, seconds) {
  const totalSeconds = 
    (parseInt(days) || 0) * 24 * 60 * 60 +
    (parseInt(hours) || 0) * 60 * 60 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0);
  return totalSeconds;
}

// Convert seconds to duration parts
function secondsToDurationParts(totalSeconds) {
  if (!totalSeconds || totalSeconds === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  let remaining = totalSeconds;
  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining -= days * 24 * 60 * 60;
  const hours = Math.floor(remaining / (60 * 60));
  remaining -= hours * 60 * 60;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  return { days, hours, minutes, seconds };
}

export default function VideoForm({ video, onSave, saving, editing }) {
  const [form, setForm] = useState({
    title: video?.title || "",
    provider: video?.provider || "YouTube",
    url: video?.url || "",
    publish_date: video?.publish_date || "",
    duration: video?.duration || "",
    description: video?.description || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Duration parts state (in seconds)
  const [durationParts, setDurationParts] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Parse duration when video loads
  useEffect(() => {
    if (video) {
      setForm({
        title: video.title || "",
        provider: video.provider || "YouTube",
        url: video.url || "",
        publish_date: video.publish_date || "",
        duration: video.duration || "",
        description: video.description || "",
      });
      
      // If duration exists, parse it
      if (video.duration) {
        const parts = secondsToDurationParts(parseInt(video.duration) || 0);
        setDurationParts(parts);
      }
    }
  }, [video]);

  function updateField(field, value) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateDurationPart(part, value) {
    // Only allow numbers
    const numValue = parseInt(value) || 0;
    
    const updatedParts = { ...durationParts, [part]: numValue };
    setDurationParts(updatedParts);
    
    // Calculate total seconds
    const totalSeconds = durationToSeconds(
      updatedParts.days,
      updatedParts.hours,
      updatedParts.minutes,
      updatedParts.seconds
    );
    
    // Store as number (seconds) in the form
    updateField('duration', totalSeconds);
  }

  function validateForm() {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = "Title is required";
    }
    if (!form.provider) {
      errors.provider = "Provider is required";
    }
    if (!form.url.trim()) {
      errors.url = "URL is required";
    }
    if (!form.description.trim()) {
      errors.description = "Description is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  // Get formatted duration string for display
  const getFormattedDuration = () => {
    const { days, hours, minutes, seconds } = durationParts;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    return parts.length > 0 ? parts.join(' ') : '';
  };

  // Show video preview if URL is valid
  const getEmbedUrl = () => {
    if (!form.url) return null;
    const ytMatch = form.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = form.url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel" style={{ overflow: "visible" }}>
        <SectionPanel icon={VideoIcon} title="Video Information">
          <div className="grid-form">
            <div className="field">
              <Label required>Title</Label>
              {editing ? (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--surface-2)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                    minHeight: "38px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 550,
                  }}
                >
                  {form.title || "—"}
                </div>
              ) : (
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter video title"
                />
              )}
              {fieldErrors.title && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.title}
                </div>
              )}
              {editing && (
                <div style={{ fontSize: "11px", color: "var(--ink-4)", marginTop: "4px" }}>
                  Title cannot be changed after creation.
                </div>
              )}
            </div>

            <div className="field">
              <Label required>Provider</Label>
              <select
                className="select"
                value={form.provider}
                onChange={(e) => updateField("provider", e.target.value)}
              >
                <option value="YouTube">YouTube</option>
                <option value="Vimeo">Vimeo</option>
              </select>
              {fieldErrors.provider && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.provider}
                </div>
              )}
            </div>

            <div className="field">
              <Label required>URL</Label>
              <input
                className="input"
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {fieldErrors.url && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.url}
                </div>
              )}
            </div>

            <div className="field">
              <Label>Publish Date</Label>
              <input
                type="date"
                className="input"
                value={form.publish_date}
                onChange={(e) => updateField("publish_date", e.target.value)}
              />
            </div>

            <div className="field">
              <Label>Duration</Label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    className="input"
                    value={durationParts.days || ""}
                    onChange={(e) => updateDurationPart("days", e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ width: "60px", textAlign: "center" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>Days</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    className="input"
                    value={durationParts.hours || ""}
                    onChange={(e) => updateDurationPart("hours", e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ width: "60px", textAlign: "center" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>Hours</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    className="input"
                    value={durationParts.minutes || ""}
                    onChange={(e) => updateDurationPart("minutes", e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ width: "60px", textAlign: "center" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>Minutes</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    className="input"
                    value={durationParts.seconds || ""}
                    onChange={(e) => updateDurationPart("seconds", e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ width: "60px", textAlign: "center" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>Seconds</span>
                </div>
                <Clock size={16} style={{ color: "var(--ink-3)" }} />
              </div>
              {getFormattedDuration() && (
                <div style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>
                  Duration: {getFormattedDuration()}
                </div>
              )}
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <Label required>Description</Label>
              <textarea
                className="input"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter video description"
                rows={5}
                style={{ resize: "vertical" }}
              />
              {fieldErrors.description && (
                <div style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.description}
                </div>
              )}
            </div>

            {embedUrl && (
              <div className="field" style={{ gridColumn: "span 2" }}>
                <Label>Preview</Label>
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title="Video Preview"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </SectionPanel>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingBottom: 8,
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving || loading ? "Saving..." : editing ? "Update Video" : "Create Video"}
        </button>
      </div>
    </form>
  );
}
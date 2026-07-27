import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Video as VideoIcon, 
  Calendar, 
  FileText, 
  Link2, 
  Play,
  ThumbsUp,
  Eye,
  MessageCircle,
  Clock,
  ExternalLink
} from "lucide-react";

import { PageHeader, Avatar, EmptyState } from "@/components/shared/OriginalPrimitives";
import ConfirmModal from "@/components/shared/ConfirmDialog";

import { getVideo, deleteVideo } from "@/services/videoService.js";
import { getErrorMessage } from "@/utils/errors.js";
import { fmtDate } from "@/utils/format.js";

function Item({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value || "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        backgroundColor: "var(--surface-2)",
        borderRadius: "6px",
      }}
    >
      <Icon size={16} style={{ color: "var(--ink-3)" }} />
      <span style={{ fontSize: "13px", color: "var(--ink-3)" }}>{label}:</span>
      <span style={{ fontSize: "14px", fontWeight: 600 }}>
        {value !== undefined && value !== null ? Number(value).toLocaleString() : "—"}
      </span>
    </div>
  );
}

// Convert seconds to duration string (days, hours, minutes, seconds)
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "—";
  
  const numSeconds = parseInt(seconds);
  let remaining = numSeconds;
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining -= days * 24 * 60 * 60;
  const hours = Math.floor(remaining / (60 * 60));
  remaining -= hours * 60 * 60;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.length > 0 ? parts.join(' ') : "—";
}

export default function VideoProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getVideo(name);
        setVideo(data);
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  async function handleDelete() {
    try {
      await deleteVideo(name);
      toast.success("Video deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/videos");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading video...</div>;
  if (!video) return <div className="muted">Video not found</div>;

  // Get embed URL for video player
  const getEmbedUrl = () => {
    if (!video.url) return null;
    const ytMatch = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = video.url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title={video.title || "Video Profile"}
        button={
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/dashboard/videos/${encodeURIComponent(name)}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        }
      />

      {/* Header card with video player */}
      <div className="panel" style={{ marginBottom: 18 }}>
        {embedUrl ? (
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
              title={video.title}
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
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              backgroundColor: "var(--surface-2)",
              borderRadius: "8px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Play size={48} style={{ color: "var(--ink-3)" }} />
              <div style={{ marginTop: 12, color: "var(--ink-3)" }}>
                Video preview not available
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Information */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <SectionHead icon={VideoIcon} title="Video Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Video ID" value={video.name} />
          <Item label="Title" value={video.title} />
          <Item label="Provider" value={video.provider} />
          <Item label="URL" value={
            video.url ? (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--brand)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                {video.url}
                <ExternalLink size={14} />
              </a>
            ) : "—"
          } />
          <Item label="Publish Date" value={video.publish_date ? fmtDate(video.publish_date) : "—"} />
          <Item label="Duration" value={formatDuration(video.duration)} />
        </div>
      </div>

      {/* Statistics */}
      {video.provider === "YouTube" && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <SectionHead icon={Eye} title="YouTube Statistics" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
              padding: "10px 20px 26px",
            }}
          >
            <StatCard icon={Eye} label="Views" value={video.view_count} />
            <StatCard icon={ThumbsUp} label="Likes" value={video.like_count} />
            <StatCard icon={MessageCircle} label="Comments" value={video.comment_count} />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="panel">
        <SectionHead icon={FileText} title="Description" />
        <div style={{ padding: "10px 20px 26px" }}>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {video.description || "No description available."}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${video.title}?`}
        message="This action cannot be undone. All data associated with this video will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
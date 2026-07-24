import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/ui/Primitives.jsx";
import VideoForm from "./components/VideoForm.jsx";

import {
  getVideo,
  createVideo,
  updateVideo,
} from "../../services/videoService.js";

import { getErrorMessage } from "../../utils/errors.js";

export default function VideoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadVideo() {
      try {
        const data = await getVideo(name);
        setVideo(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [name, editing]);

  async function save(values) {
    setSaving(true);
    try {
      let result;

      if (editing) {
        result = await updateVideo(name, values);
        toast.success("Video updated");
      } else {
        result = await createVideo(values);
        toast.success("Video created");
      }

      const videoName = result?.name || id;
      navigate(`/dashboard/videos/${videoName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading video…</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title={editing ? "Edit Video" : "Create Video"}
      />

      <div className="panel">
        <VideoForm
          video={video}
          onSave={save}
          saving={saving}
          editing={editing}
        />
      </div>
    </>
  );
}
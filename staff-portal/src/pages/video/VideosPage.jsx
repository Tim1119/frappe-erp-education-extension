import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, Play, Calendar, ThumbsUp, Eye as EyeIcon } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "../../components/ui/Primitives.jsx";

import Toolbar from "../../components/shared/Toolbar.jsx";
import Pager from "../../components/shared/Pager.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";

import { usePagination, useDebounce } from "../../hooks.js";
import { getErrorMessage } from "../../utils/errors.js";
import { fmtDate } from "../../utils/format.js";

import {
  getVideos,
  deleteVideo,
  getVideoProviders,
} from "../../services/videoService.js";

function VideoThumbnail({ url, title }) {
  // Extract video ID from URL for thumbnail
  const getThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    // YouTube thumbnail
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/default.jpg`;
    }
    // Vimeo thumbnail - would need API call
    return null;
  };

  const thumbnail = getThumbnail(url);

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={title}
        style={{
          width: 80,
          height: 60,
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 80,
        height: 60,
        borderRadius: "4px",
        backgroundColor: "var(--brand-soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Play size={24} style={{ color: "var(--brand)" }} />
    </div>
  );
}

export default function VideosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerFromUrl = searchParams.get("provider") || "";

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [providerFilter, setProviderFilter] = useState(providerFromUrl);
  const [providerOptions, setProviderOptions] = useState([]);

  const [menuId, setMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadProviders() {
    try {
      const result = await getVideoProviders();
      // Extract unique provider names from the result
      const providers = result.map((item) => item.provider);
      setProviderOptions(providers);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getVideos({
        page,
        page_size: 20,
        search: debouncedSearch,
        provider: providerFilter || undefined,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading videos:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, providerFilter]);

  // Reset page when filter changes
  useEffect(() => {
    reset();
  }, [providerFilter]);

  async function confirmDelete() {
    try {
      await deleteVideo(deleteTarget.name);
      toast.success("Video deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const getSubText = () => {
    if (loading) return "Loading...";
    if (providerFilter) {
      return `${totalCount} ${providerFilter} videos`;
    }
    return `${totalCount} videos`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title="Videos"
        sub={getSubText()}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/videos/new")}
          >
            <Plus size={15} />
            Add Video
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        searchProps={{
          style: {
            flex: "0 0 280px",
          },
        }}
        filterProps={{
          style: {
            width: 160,
            minWidth: 160,
            flex: "0 0 160px",
          },
        }}
        filters={[
          {
            key: "provider",
            label: "Provider",
            value: providerFilter,
            onChange: setProviderFilter,
            options: providerOptions,
          },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Video</th>
                <th>Provider</th>
                <th>Publish Date</th>
                <th>Views</th>
                <th>Likes</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <VideoThumbnail url={item.url} title={item.title} />
                      <div>
                        <div style={{ fontWeight: 550 }}>{item.title}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: item.provider === "YouTube" ? "var(--brand-soft)" : "var(--surface-2)",
                        color: item.provider === "YouTube" ? "var(--brand)" : "var(--ink-3)",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {item.provider || "—"}
                    </span>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.publish_date ? fmtDate(item.publish_date) : "—"}
                  </td>

                  <td className="tnum muted2" style={{ fontSize: 13 }}>
                    {item.view_count ? Number(item.view_count).toLocaleString() : "—"}
                  </td>

                  <td className="tnum muted2" style={{ fontSize: 13 }}>
                    {item.like_count ? Number(item.like_count).toLocaleString() : "—"}
                  </td>

                  <td style={{ position: "relative" }}>
                    <button
                      className="iconbtn"
                      onClick={() =>
                        setMenuId(menuId === item.name ? null : item.name)
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === item.name && (
                      <div
                        className="rowmenu"
                        style={{
                          right: 0,
                          top: 34,
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(`/dashboard/videos/${item.name}`)
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/dashboard/videos/${item.name}/edit`)
                          }
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <div
                          className="divider"
                          style={{
                            margin: "5px 0",
                          }}
                        />

                        <button
                          className="danger"
                          onClick={() => {
                            setMenuId(null);
                            setDeleteTarget(item);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={providerFilter ? `No ${providerFilter} videos found` : "No videos found"}
                      sub={providerFilter ? `No video records available for this provider.` : "No video records available."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager page={page} setPage={setPage} pageSize={20} count={totalCount} />
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.title}?`}
        message="This action cannot be undone. All data associated with this video will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
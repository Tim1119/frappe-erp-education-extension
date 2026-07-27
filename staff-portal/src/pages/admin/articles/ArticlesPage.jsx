import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, Calendar, User } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination, useDebounce } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getArticles,
  deleteArticle,
  getTopics,
} from "@/services/articleService.js";

import { formatDate } from "@/utils/format.js";

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [topicFilter, setTopicFilter] = useState(topicFromUrl);
  const [topicOptions, setTopicOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadTopics() {
    try {
      const result = await getTopics();
      setTopicOptions(result.map((item) => item.name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getArticles({
        page,
        page_size: 20,
        search: debouncedSearch,
        topic: topicFilter || undefined,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading articles:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, topicFilter]);

  // Reset page when filter changes
  useEffect(() => {
    reset();
  }, [topicFilter]);

  async function confirmDelete() {
    try {
      await deleteArticle(deleteTarget.name);
      toast.success("Article deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const getSubText = () => {
    if (loading) return "Loading...";
    if (topicFilter) {
      return `${totalCount} articles for topic: ${topicFilter}`;
    }
    return `${totalCount} articles`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Articles"
        sub={getSubText()}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/articles/new")}
          >
            <Plus size={15} />
            Add Article
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
            key: "topic",
            label: "Topic",
            value: topicFilter,
            onChange: setTopicFilter,
            options: topicOptions,
          },
        ]}
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publish Date</th>
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
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: "var(--brand-soft)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 14, color: "var(--brand)" }}>
                          A
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 550 }}>{item.title}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.author || "—"}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.publish_date ? formatDate(item.publish_date) : "—"}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/articles/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/articles/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title={topicFilter ? `No articles found for topic: ${topicFilter}` : "No articles found"}
                      sub={topicFilter ? `No article records available for this topic.` : "No article records available."}
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
        message="This action cannot be undone. All data associated with this article will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
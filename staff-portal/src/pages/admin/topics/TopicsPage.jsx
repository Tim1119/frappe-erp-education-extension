import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, BookOpen } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import ActiveFilterChip from "@/components/shared/ActiveFilterChip";

import { usePagination, useDebounce } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getTopics,
  deleteTopic,
} from "@/services/topicService.js";

export default function TopicsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const quizFilter = searchParams.get("quiz") || "";

  function clearParam(key) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const { page, setPage, reset } = usePagination(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getTopics({
        page,
        page_size: 20,
        search: debouncedSearch,
        quiz: quizFilter || undefined,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading topics:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch, quizFilter]);

  useEffect(() => {
    reset();
  }, [quizFilter]);

  async function confirmDelete() {
    try {
      await deleteTopic(deleteTarget.name);
      toast.success("Topic deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Topics"
        sub={loading ? "Loading..." : `${totalCount} topics`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/topics/new")}
          >
            <Plus size={15} />
            Add Topic
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
      />

      <ActiveFilterChip label="Quiz" value={quizFilter} onClear={() => clearParam("quiz")} />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Description</th>
                <th style={{ width: 60 }}></th>
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
                      <Avatar
                        name={item.topic_name}
                        src={item.hero_image}
                        size={34}
                      />
                      <div>
                        <div style={{ fontWeight: 550 }}>{item.topic_name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.description || "—"}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/topics/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/topics/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      title="No topics found"
                      sub="No topic records available."
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
        title={`Delete ${deleteTarget?.topic_name}?`}
        message="This action cannot be undone. All data associated with this topic will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
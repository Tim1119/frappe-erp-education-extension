import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";

import {
  PageHeader,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination, useDebounce } from "@/hooks";
import { getErrorMessage } from "@/utils/errors.js";

import {
  getQuizzes,
  deleteQuiz,
} from "@/services/quizService.js";

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

      const result = await getQuizzes({
        page,
        page_size: 20,
        search: debouncedSearch,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [page, debouncedSearch]);

  async function confirmDelete() {
    try {
      await deleteQuiz(deleteTarget.name);
      toast.success("Quiz deleted");
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
        title="Quizzes"
        sub={loading ? "Loading..." : `${totalCount} quizzes`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/quizzes/new")}
          >
            <Plus size={15} />
            Add Quiz
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

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Passing Score</th>
                <th>Max Attempts</th>
                <th>Time Bound</th>
                <th>Duration</th>
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
                          Q
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

                  <td className="tnum" style={{ fontSize: 13, fontWeight: 600 }}>
                    {item.passing_score || 75}%
                  </td>

                  <td className="tnum" style={{ fontSize: 13 }}>
                    {item.max_attempts === 0 ? "Unlimited" : item.max_attempts}
                  </td>

                  <td>
                    {item.is_time_bound ? (
                      <span style={{ color: "var(--success)" }}>
                        <CheckCircle size={16} />
                      </span>
                    ) : (
                      <span style={{ color: "var(--ink-3)" }}>
                        <XCircle size={16} />
                      </span>
                    )}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.duration || "—"}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/quizzes/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/quizzes/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No quizzes found"
                      sub="No quiz records available."
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
        message="This action cannot be undone. All data associated with this quiz will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
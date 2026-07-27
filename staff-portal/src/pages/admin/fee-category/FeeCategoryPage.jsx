import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2, Plus } from "lucide-react";

import {
  PageHeader,
  Avatar,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination } from "@/hooks";

import {
  getFeeCategories,
  deleteFeeCategory,
} from "@/services/feeCategoryService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function FeeCategoryPage() {
  const navigate = useNavigate();

  const { page, setPage } = usePagination(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const result = await getFeeCategories({
        page,
        search,
      });

      setItems(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [page, search]);

  async function confirmDelete() {
    try {
      await deleteFeeCategory(deleteTarget.name);
      toast.success("Fee category deleted");
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title="Fee Categories"
        sub={loading ? "Loading..." : `${totalCount} fee categories`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/fee-category/new")}
          >
            <Plus size={15} />
            Add Fee Category
          </button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
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
                <th>Name</th>
                <th>Description</th>
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
                          FC
                        </span>
                      </div>
                      <div style={{ fontWeight: 550 }}>{item.category_name}</div>
                    </div>
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {item.description || "—"}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/fee-category/${item.name}`)}
                    onEdit={() => navigate(`/dashboard/fee-category/${item.name}/edit`)}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      title="No fee categories found"
                      sub="No fee category records available."
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
        title={`Delete ${deleteTarget?.category_name}?`}
        message="This action cannot be undone. All data associated with this fee category will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
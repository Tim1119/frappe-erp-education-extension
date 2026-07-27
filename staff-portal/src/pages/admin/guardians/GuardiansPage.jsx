import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react";

import {
  PageHeader,
  Avatar,
  StatusBadge,
  EmptyState,
} from "@/components/shared/OriginalPrimitives";

import Toolbar from "@/components/shared/Toolbar";
import Pager from "@/components/shared/Pager";
import ConfirmModal from "@/components/shared/ConfirmDialog";
import RowActionsMenu from "@/components/shared/RowActionsMenu";

import { usePagination } from "@/hooks";

import {
  getGuardians,
  deleteGuardian,
} from "@/services/guardianService.js";

import { getErrorMessage } from "@/utils/errors.js";

export default function GuardiansPage() {
  const navigate = useNavigate();

  const { page, setPage } = usePagination(1);

  const [guardians, setGuardians] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadGuardians() {
    try {
      setLoading(true);

      const result = await getGuardians({
        page,
        search,
      });

      setGuardians(result.rows || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuardians();
  }, [page, search]);

  async function confirmDelete() {
    try {
      await deleteGuardian(deleteTarget.name);
      toast.success("Guardian deleted");
      setDeleteTarget(null);
      loadGuardians();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Guardians"
        sub={loading ? "Loading..." : `${totalCount} guardians on record`}
        button={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/guardians/new")}
          >
            +  Add Guardian
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
        // onCreate={() => navigate("/dashboard/guardians/new")}
        // createLabel="Add Guardian"
      />

      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Occupation</th>
                <th>Education</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {guardians.map((guardian) => (
                <tr key={guardian.name}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        name={guardian.guardian_name}
                        src={guardian.image}
                        size={34}
                      />
                      <div>{guardian.guardian_name}</div>
                    </div>
                  </td>

                  <td className="tnum muted" style={{ fontSize: 12.5 }}>
                    {guardian.mobile_number || "—"}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {guardian.email_address || "—"}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {guardian.occupation || "—"}
                  </td>

                  <td className="muted2" style={{ fontSize: 13 }}>
                    {guardian.education || "—"}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    onView={() => navigate(`/dashboard/guardians/${guardian.name}`)}
                    onEdit={() => navigate(`/dashboard/guardians/${guardian.name}/edit`)}
                    onDelete={() => setDeleteTarget(guardian)}
                  />
                </td>
                </tr>
              ))}

              {!loading && guardians.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No guardians found"
                      sub="No guardian records available."
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
        title={`Delete ${deleteTarget?.guardian_name}?`}
        message="This action cannot be undone. All data associated with this guardian will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader, Avatar, EmptyState } from "../components/ui/Primitives";
import Modal from "../components/modals/Modal";
import Toolbar from "../components/shared/Toolbar";
import Pager from "../components/shared/Pager";
import { useDocList } from "../hooks/useDocList";
import { useDebounce, usePagination } from "../hooks.js";

export default function GuardiansPage() {
  const { page, setPage, reset } = usePagination(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [detail, setDetail] = useState(null);

  const { rows, count, loading } = useDocList("guardian", {
    search: debouncedSearch,
    searchFields: ["guardian_name"],
    orderBy: "modified desc",
    page,
    pageSize: 8,
  });

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Guardians"
        sub={loading ? "Loading…" : `${count} guardians on record`}
      />

      <Toolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          reset();
        }}
        onCreate={() =>
          toast(
            "Create guardians from Frappe Desk, or wire the create form up next.",
          )
        }
        createLabel="Add guardian"
      />

      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Occupation</th>
              <th>Education</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr
                key={g.name}
                className="row"
                style={{ cursor: "pointer" }}
                onClick={() => setDetail(g)}
              >
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 11 }}
                  >
                    <Avatar name={g.guardian_name} size={34} />
                    <div>
                      <div style={{ fontWeight: 550 }}>{g.guardian_name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        {g.email_address}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="tnum muted hide-sm" style={{ fontSize: 12.5 }}>
                  {g.mobile_number || "—"}
                </td>
                <td className="muted2 hide-sm" style={{ fontSize: 13 }}>
                  {g.occupation || "—"}
                </td>
                <td className="muted2" style={{ fontSize: 13 }}>
                  {g.education || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <EmptyState title="No guardians found" />
        )}
        <Pager count={count} page={page} setPage={setPage} pageSize={8} />
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.guardian_name}
      >
        {detail && (
          <div className="grid-2" style={{ gap: 14 }}>
            {[
              ["Phone", detail.mobile_number],
              ["Email", detail.email_address],
              ["Occupation", detail.occupation],
              ["Education", detail.education],
            ].map(([label, val]) => (
              <div key={label}>
                <div
                  className="muted"
                  style={{ fontSize: 11.5, marginBottom: 3 }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 550 }}>
                  {val || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

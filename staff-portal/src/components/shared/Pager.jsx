import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 8;

/** Shared pagination footer. `rows` is the full filtered array; slices client-side. */
export function usePager(rows, page, setPage, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  return { pageRows, totalPages, start, pageSize };
}

/**
 * `rows`: pass the full filtered array for client-side pagination, OR
 * `count`: pass the server-reported total when the page you're given is
 * already paginated server-side (e.g. via useDocList / Frappe REST paging).
 */
export default function Pager({
  rows,
  count,
  page,
  setPage,
  pageSize = PAGE_SIZE,
}) {
  const total = count ?? rows?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return (
    <div className="pager">
      <span className="tnum muted">
        {total
          ? `${Math.min(start + 1, total)}–${Math.min(start + pageSize, total)} of ${total}`
          : "0 records"}
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          className="pg-btn"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
          {page} / {totalPages}
        </span>
        <button
          className="pg-btn"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

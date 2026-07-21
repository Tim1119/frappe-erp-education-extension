import { Search, Plus, Download } from "lucide-react";

/**
 * Shared list-page toolbar: search box + arbitrary filter <select>s + actions.
 * Used by Students, Student Groups, Attendance, Assessments, Results, Teachers,
 * Guardians, Fees and HR list pages so the search/filter UI stays consistent.
 */
export default function Toolbar({
  search,
  onSearch,
  filters = [],
  onCreate,
  createLabel,
  onExport,
  extra,
  searchProps = {},
  filterProps = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <div
        className="input-ico"
        style={{ maxWidth: 280, flex: "1 1 220px", ...searchProps.style }}
      >
        <Search />
        <input
          className="input"
          placeholder="Search…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {filters.map((f) => (
        <select
          key={f.key}
          className="select"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          style={{ minWidth: 150, ...filterProps.style }}
        >
          <option value="">{f.allLabel || `All ${f.label}`}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}

      <div style={{ flex: 1 }} />
      {extra}
      {onExport && (
        <button className="btn btn-outline" onClick={onExport}>
          <Download size={15} />
          Export
        </button>
      )}
      {onCreate && (
        <button className="btn btn-primary" onClick={onCreate}>
          <Plus size={15} />
          {createLabel || "Add"}
        </button>
      )}
    </div>
  );
}

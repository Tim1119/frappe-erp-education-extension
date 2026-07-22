import { Tag, FileText, Building2, DollarSign, Layers, Package } from "lucide-react";
import { Avatar, EmptyState } from "../../../components/ui/Primitives.jsx";

function Item({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 550 }}>{value || "—"}</div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon size={15} style={{ color: "var(--ink-4)" }} />
          {title}
        </div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function FeeCategoryDetails({ feeCategory }) {
  if (!feeCategory) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "var(--brand-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Tag size={32} style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {feeCategory.category_name}
            </div>
            {feeCategory.description && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {feeCategory.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={Tag} title="Basic Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Category ID" value={feeCategory.name} />
          <Item label="Category Name" value={feeCategory.category_name} />
          <Item label="Description" value={feeCategory.description} />
          <Item label="Item" value={feeCategory.item} />
        </div>
      </div>

      {/* Accounting Defaults */}
      <div className="panel">
        <SectionHead 
          icon={Building2} 
          title="Accounting Defaults" 
          sub={`${(feeCategory.item_defaults || []).length} defaults`}
        />
        {(feeCategory.item_defaults || []).length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No accounting defaults"
            sub="Add accounting defaults from the Fee Category record in Frappe Desk."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Company</th>
                <th>Default Income Account</th>
                <th>Default Cost Center</th>
              </tr>
            </thead>
            <tbody>
              {feeCategory.item_defaults.map((defaultEntry, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{defaultEntry.company || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {defaultEntry.income_account || "—"}
                  </td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {defaultEntry.selling_cost_center || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
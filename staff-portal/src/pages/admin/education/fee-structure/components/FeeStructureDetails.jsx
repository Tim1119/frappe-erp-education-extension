import { FileText, GraduationCap, Calendar, Users, Building2, DollarSign, Layers, Calculator, CheckCircle, XCircle, Clock } from "lucide-react";
import { EmptyState } from "@/components/shared/OriginalPrimitives";

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

function StatusBadge({ status }) {
  const statusMap = {
    0: { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)", icon: Clock },
    1: { label: "Submitted", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    2: { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
  };
  
  const s = statusMap[status] || statusMap[0];
  const Icon = s.icon;
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 500,
      backgroundColor: s.bg,
      color: s.color,
    }}>
      <Icon size={12} />
      {s.label}
    </span>
  );
}

export default function FeeStructureDetails({ feeStructure }) {
  if (!feeStructure) return null;

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
            <FileText size={32} style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-.01em" }}
            >
              {feeStructure.program || "Fee Structure"}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {feeStructure.academic_year} {feeStructure.academic_term ? `- ${feeStructure.academic_term}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={FileText} title="Basic Information" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Fee Structure ID" value={feeStructure.name} />
          <Item label="Class" value={feeStructure.program} />
          <Item label="Student Category" value={feeStructure.student_category} />
          <Item label="Academic Year" value={feeStructure.academic_year} />
          <Item label="Academic Term" value={feeStructure.academic_term} />
          <Item label="Total Amount" value={feeStructure.total_amount ? `₦${feeStructure.total_amount.toLocaleString()}` : "—"} />
          <Item label="Status" value={<StatusBadge status={feeStructure.docstatus || 0} />} />
        </div>
      </div>

      {/* Accounts */}
      <div className="panel">
        <SectionHead icon={Building2} title="Accounts" />
        <div className="grid-3" style={{ padding: "10px 20px 26px" }}>
          <Item label="Company" value={feeStructure.company} />
          <Item label="Receivable Account" value={feeStructure.receivable_account} />
          <Item label="Cost Center" value={feeStructure.cost_center} />
        </div>
      </div>

      {/* Fee Components */}
      <div className="panel">
        <SectionHead 
          icon={Calculator} 
          title="Fee Components" 
          sub={`${(feeStructure.components || []).length} components`}
        />
        {(feeStructure.components || []).length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No components"
            sub="Add components from this fee structure's edit page."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Fee Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.components.map((component, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{component.fees_category || "—"}</td>
                  <td className="muted2" style={{ fontSize: 13 }}>
                    {component.description || "—"}
                  </td>
                  <td className="tnum">
                    {component.amount ? `₦${component.amount.toLocaleString()}` : "—"}
                  </td>
                  <td>{component.discount || "0"}%</td>
                  <td className="tnum" style={{ fontWeight: 600 }}>
                    {component.total ? `₦${component.total.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, backgroundColor: "var(--surface-2)" }}>
                <td colSpan="4" style={{ textAlign: "right" }}>Total Amount:</td>
                <td>{feeStructure.total_amount ? `₦${feeStructure.total_amount.toLocaleString()}` : "—"}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
import { Calendar, FileText, GraduationCap, Users, Building2, DollarSign, Layers, Calculator, CheckCircle, XCircle, Clock } from "lucide-react";
import { EmptyState } from "../../../components/ui/Primitives.jsx";

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
    "Draft": { label: "Draft", color: "var(--ink-3)", bg: "var(--surface-2)", icon: Clock },
    "Cancelled": { label: "Cancelled", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
    "Invoice Pending": { label: "Invoice Pending", color: "var(--warning)", bg: "var(--warning-soft)", icon: Clock },
    "Order Pending": { label: "Order Pending", color: "var(--warning)", bg: "var(--warning-soft)", icon: Clock },
    "In Process": { label: "In Process", color: "var(--info)", bg: "var(--info-soft)", icon: Clock },
    "Invoice Created": { label: "Invoice Created", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    "Order Created": { label: "Order Created", color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle },
    "Failed": { label: "Failed", color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle },
  };
  
  const s = statusMap[status] || statusMap["Draft"];
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

export default function FeeScheduleDetails({ feeSchedule }) {
  if (!feeSchedule) return null;

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
              {feeSchedule.name}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {feeSchedule.program || "No class"} - {feeSchedule.academic_year || "No academic year"}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="panel">
        <SectionHead icon={FileText} title="Basic Information" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Fee Schedule ID" value={feeSchedule.name} />
          <Item label="Fee Structure" value={feeSchedule.fee_structure} />
          <Item label="Status" value={<StatusBadge status={feeSchedule.status || "Draft"} />} />
          <Item label="Class" value={feeSchedule.program} />
          <Item label="Student Category" value={feeSchedule.student_category} />
          <Item label="Academic Year" value={feeSchedule.academic_year} />
          <Item label="Academic Term" value={feeSchedule.academic_term} />
          <Item label="Posting Date" value={feeSchedule.posting_date} />
          <Item label="Due Date" value={feeSchedule.due_date} />
        </div>
      </div>

      {/* Class Arms */}
      <div className="panel">
        <SectionHead 
          icon={Users} 
          title="Class Arms" 
          sub={`${(feeSchedule.student_groups || []).length} class arms`}
        />
        {(feeSchedule.student_groups || []).length === 0 ? (
          <EmptyState
            icon={Users}
            title="No class arms"
            sub="Add class arms from the Fee Schedule record in Frappe Desk."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Class Arm</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {feeSchedule.student_groups.map((group, i) => (
                <tr key={i} className="row">
                  <td style={{ fontWeight: 550 }}>{group.student_group || "—"}</td>
                  <td className="tnum" style={{ fontWeight: 600 }}>
                    {group.total_students || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fee Components */}
      <div className="panel">
        <SectionHead 
          icon={Calculator} 
          title="Fee Components" 
          sub={`${(feeSchedule.components || []).length} components`}
        />
        {(feeSchedule.components || []).length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No components"
            sub="Components are auto-populated from the Fee Structure."
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
              {feeSchedule.components.map((component, i) => (
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
                <td colSpan="4" style={{ textAlign: "right" }}>Total Amount per Student:</td>
                <td>{feeSchedule.total_amount ? `₦${feeSchedule.total_amount.toLocaleString()}` : "0.00"}</td>
              </tr>
              <tr style={{ fontWeight: 700, backgroundColor: "var(--surface-2)" }}>
                <td colSpan="4" style={{ textAlign: "right" }}>Grand Total (All Students):</td>
                <td>{feeSchedule.grand_total ? `₦${feeSchedule.grand_total.toLocaleString()}` : "0.00"}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Accounts */}
      <div className="panel">
        <SectionHead icon={Building2} title="Accounts" />
        <div className="grid-3" style={{ padding: "4px 18px 20px" }}>
          <Item label="Company" value={feeSchedule.company} />
          <Item label="Receivable Account" value={feeSchedule.receivable_account} />
          <Item label="Cost Center" value={feeSchedule.cost_center} />
        </div>
      </div>
    </div>
  );
}
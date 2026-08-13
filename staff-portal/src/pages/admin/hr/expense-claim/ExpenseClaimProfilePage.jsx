import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { cancelExpenseClaim, getExpenseClaim, submitExpenseClaim } from "@/services/hr/expenseClaimService";
import { getErrorMessage } from "@/utils/errors";

const F = ({ l, v }) => (
  <div>
    <p className="text-xs text-muted-foreground">{l}</p>
    <p className="text-sm font-medium">{v ?? "—"}</p>
  </div>
);

function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <>
      <div className="panel-head" style={{ cursor: "pointer" }} onClick={onToggle}>
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </div>
      </div>
      {open && children}
    </>
  );
}

function ExpensesTable({ rows }) {
  return (
    <div style={{ padding: 20, overflowX: "auto" }}>
      <table className="tbl">
        <thead><tr><th>#</th><th>Expense Date</th><th>Expense Type</th><th>Amount</th><th>Sanctioned</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td><td>{r.expense_date || "—"}</td><td>{r.expense_type || "—"}</td>
              <td>{r.amount ?? "—"}</td><td>{r.sanctioned_amount ?? "—"}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No expenses.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AdvancesTable({ rows }) {
  return (
    <div style={{ padding: 20, overflowX: "auto" }}>
      <table className="tbl">
        <thead><tr><th>#</th><th>Employee Advance</th><th>Posting Date</th><th>Advance Paid</th><th>Unclaimed</th><th>Allocated</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td><td>{r.employee_advance || "—"}</td><td>{r.posting_date || "—"}</td>
              <td>{r.advance_paid ?? "—"}</td><td>{r.unclaimed_amount ?? "—"}</td><td>{r.allocated_amount ?? "—"}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No advances.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TaxesTable({ rows }) {
  return (
    <div style={{ padding: 20, overflowX: "auto" }}>
      <table className="tbl">
        <thead><tr><th>#</th><th>Account Head</th><th>Rate</th><th>Amount</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td><td>{r.account_head || "—"}</td><td>{r.rate ?? "—"}</td>
              <td>{r.tax_amount ?? "—"}</td><td>{r.total ?? "—"}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No taxes or charges.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function ExpenseClaimProfilePage() {
  const { id } = useParams();
  const name = decodeURIComponent(id);
  const n = useNavigate();
  const [d, setD] = useState(null);
  const [advancesOpen, setAdvancesOpen] = useState(false);
  const [taxesOpen, setTaxesOpen] = useState(false);

  const load = () => getExpenseClaim(name).then((data) => {
    setD(data);
    setAdvancesOpen((data.advances || []).length > 0);
    setTaxesOpen((data.taxes || []).length > 0);
  });
  useEffect(load, [name]);

  async function a(fn, m) {
    try {
      await fn(name);
      toast.success(m);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  if (!d) return null;

  return (
    <>
      <PageHeader
        eyebrow="HR · Expense Claim"
        title={d.employee_name || d.name}
        sub={d.name}
        button={
          <div className="flex gap-2">
            {d.can_edit && <button className="btn btn-secondary" onClick={() => n(`/dashboard/expense-claims/${encodeURIComponent(name)}/edit`)}>Edit</button>}
            {d.docstatus === 0 && <button className="btn btn-primary" onClick={() => a(submitExpenseClaim, "Submitted")}>Submit</button>}
            {d.docstatus === 1 && <button className="btn btn-danger" onClick={() => a(cancelExpenseClaim, "Cancelled")}>Cancel</button>}
          </div>
        }
      />
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head"><div className="panel-title">Expense Claim Information</div></div>
        <div className="grid-form" style={{ padding: 20 }}>
          {Object.entries(d)
            .filter(([k, v]) => !Array.isArray(v) && !["owner", "creation", "modified", "modified_by", "doctype"].includes(k))
            .map(([k, v]) => <F key={k} l={k.replaceAll("_", " ")} v={v} />)}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head"><div className="panel-title">Expenses</div></div>
        <ExpensesTable rows={d.expenses || []} />
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <CollapsibleSection title="Advance Payments" open={advancesOpen} onToggle={() => setAdvancesOpen((o) => !o)}>
          <AdvancesTable rows={d.advances || []} />
        </CollapsibleSection>
      </div>

      <div className="panel">
        <CollapsibleSection title="Taxes & Charges" open={taxesOpen} onToggle={() => setTaxesOpen((o) => !o)}>
          <TaxesTable rows={d.taxes || []} />
        </CollapsibleSection>
      </div>
    </>
  );
}

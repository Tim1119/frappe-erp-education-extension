import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, FileText, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cancelExpenseClaim, getExpenseClaim, getExpenseClaimConnections, submitExpenseClaim } from "@/services/hr/expenseClaimService";
import { callMethod } from "@/services/frappeClient";
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

function ConnectionButton({ icon: Icon, label, count, path, loading }) {
  const navigate = useNavigate();
  const enabled = Boolean(path) && !loading;
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => enabled && navigate(path)}
      className="flex w-full items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-left text-sm disabled:cursor-default disabled:opacity-60"
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 font-medium">{label}</span>
      <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{loading ? "…" : count || 0}</span>
    </button>
  );
}

export default function ExpenseClaimProfilePage() {
  const { id } = useParams();
  const name = decodeURIComponent(id);
  const n = useNavigate();
  const [d, setD] = useState(null);
  const [connections, setConnections] = useState({});
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [advancesOpen, setAdvancesOpen] = useState(false);
  const [taxesOpen, setTaxesOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [data, linked] = await Promise.all([getExpenseClaim(name), getExpenseClaimConnections(name)]);
    setD(data);
    setConnections(linked || {});
    setConnectionsLoading(false);
    setAdvancesOpen((data.advances || []).length > 0);
    setTaxesOpen((data.taxes || []).length > 0);
  };
  useEffect(() => {
    setConnectionsLoading(true);
    load().catch((error) => {
      setConnectionsLoading(false);
      toast.error(getErrorMessage(error));
    });
  }, [name]);

  async function a(fn, m) {
    try {
      await fn(name);
      toast.success(m);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  function submitClaim() {
    if (!Number(d.is_paid) && !d.payable_account) {
      toast.error("Payable Account is required before submitting this Expense Claim.");
      return;
    }
    a(submitExpenseClaim, "Submitted");
  }

  async function makePayment() {
    setBusy(true);
    try {
      const viaJournalEntry = Boolean(Number(d.make_payment_via_journal_entry));
      const method = viaJournalEntry
        ? "hrms.hr.doctype.expense_claim.expense_claim.make_bank_entry"
        : "hrms.overrides.employee_payment_entry.get_payment_entry_for_employee";
      const draft = await callMethod(method, {
        dt: "Expense Claim",
        dn: name,
      });
      const target = viaJournalEntry ? "/dashboard/journal-entries/new" : "/dashboard/payment-entries/new";
      n(target, { state: { prefill: { ...draft, expense_claim: name } } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!d) return null;
  const canCreatePayment = d.docstatus === 1 && d.status !== "Paid" && d.approval_status !== "Rejected";
  const canViewLedger = d.docstatus > 0 && d.approval_status !== "Rejected";
  const canViewBankEntries = d.docstatus === 1 && Number(d.total_amount_reimbursed || 0) > 0;
  const toDate = String(d.modified || "").slice(0, 10);
  // Desk's General Ledger voucher_no on_change selects consolidated voucher
  // categorization, while the report itself enables dimensions and the
  // default finance book. Put the complete effective state in the URL so the
  // portal produces the same request instead of depending on effect order.
  const ledgerParams = new URLSearchParams({
    voucher_no: name,
    company: d.company || "",
    from_date: d.posting_date || "",
    to_date: toDate,
    categorize_by: "Categorize by Voucher (Consolidated)",
    include_dimensions: "1",
    include_default_book_entries: "1",
    show_cancelled_entries: d.docstatus === 2 ? "1" : "0",
  });
  const ledgerPath = `/dashboard/general-ledger?${ledgerParams.toString()}`;
  const bankEntriesPath = Number(d.make_payment_via_journal_entry)
    ? `/dashboard/journal-entries?reference_name=${encodeURIComponent(name)}&reference_type=${encodeURIComponent("Expense Claim")}`
    : `/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}&reference_doctype=${encodeURIComponent("Expense Claim")}`;
  const advanceNames = connections.employee_advance_names || [];
  const advancePath = advanceNames.length === 1
    ? `/dashboard/employee-advances/${encodeURIComponent(advanceNames[0])}`
    : `/dashboard/employee-advances?employee=${encodeURIComponent(d.employee || "")}`;

  return (
    <>
      <PageHeader
        eyebrow="HR · Expense Claim"
        title={d.employee_name || d.name}
        sub={d.name}
        button={
          <div className="flex gap-2">
            {(canViewLedger || canViewBankEntries) && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">View <ChevronDown className="ml-1 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{canViewLedger && <DropdownMenuItem onClick={() => n(ledgerPath)}>Accounting Ledger</DropdownMenuItem>}{canViewBankEntries && <DropdownMenuItem onClick={() => n(bankEntriesPath)}>Bank Entries</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>}
            {d.can_edit && <button className="btn btn-secondary" onClick={() => n(`/dashboard/expense-claims/${encodeURIComponent(name)}/edit`)}>Edit</button>}
            {d.docstatus === 0 && <button className="btn btn-primary" onClick={submitClaim}>Submit</button>}
            {canCreatePayment && <DropdownMenu><DropdownMenuTrigger asChild><Button disabled={busy}>Create <ChevronDown className="ml-1 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={makePayment}>Payment</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
            {d.docstatus === 1 && <button className="btn btn-danger" onClick={() => a(cancelExpenseClaim, "Cancelled")}>Cancel</button>}
          </div>
        }
      />
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head"><div className="panel-title">Connections</div></div>
        <div className="grid-form" style={{ padding: 20, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <ConnectionButton icon={Wallet} label="Payment Entry" count={connections.payment_entries} loading={connectionsLoading} path={`/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}&reference_doctype=${encodeURIComponent("Expense Claim")}`} />
          <ConnectionButton icon={FileText} label="Journal Entry" count={connections.journal_entries} loading={connectionsLoading} path={`/dashboard/journal-entries?reference_name=${encodeURIComponent(name)}&reference_type=${encodeURIComponent("Expense Claim")}`} />
          <ConnectionButton icon={Wallet} label="Employee Advance" count={connections.employee_advances} loading={connectionsLoading} path={advancePath} />
        </div>
      </div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head"><div className="panel-title">Expense Claim Information</div></div>
        <div className="grid-form" style={{ padding: 20 }}>
          {Object.entries(d)
            .filter(([k, v]) => !Array.isArray(v) && !["owner", "creation", "modified", "modified_by", "doctype", "can_edit", "can_delete", "make_payment_via_journal_entry"].includes(k))
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

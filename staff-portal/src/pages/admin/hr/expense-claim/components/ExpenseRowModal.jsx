import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import { getExpenseAccountAndCostCenter } from "@/services/hr/expenseClaimService";
import { getErrorMessage } from "@/utils/errors";

function Field({ label, children, full, required = false }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</label>
      {children}
    </div>
  );
}

function Read({ value }) {
  return (
    <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { expense_date: today(), expense_type: "", default_account: "", description: "", amount: "", sanctioned_amount: "", cost_center: "", project: "" };

// One modal, reused for both Add (row === null) and Edit (row === the
// existing Expense Claim Detail row being changed).
export default function ExpenseRowModal({ open, onClose, onSave, row, types, centers, projects, company, defaultCostCenter }) {
  const navigate = useNavigate();
  const [local, setLocal] = useState(EMPTY);
  const [error, setError] = useState("");
  const [quickCreate, setQuickCreate] = useState(null);
  const [needsAccountSetup, setNeedsAccountSetup] = useState(false);

  useEffect(() => {
    if (open) {
      // Real Desk's set_child_cost_center() seeds a blank row's cost_center
      // from the parent document's own cost_center -- mirrored here so a
      // new row starts pre-filled instead of the user having to repick it.
      setLocal(row ? { ...row } : { ...EMPTY, expense_date: today(), cost_center: defaultCostCenter || "" });
      setNeedsAccountSetup(false);
      setError("");
    }
  }, [open, row, defaultCostCenter]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  // Real Desk: amount -> frm.set_value("sanctioned_amount", child.amount).
  function onAmountChange(v) {
    setLocal((x) => ({ ...x, amount: v, sanctioned_amount: v }));
  }

  // Real Desk: Expense Claim Detail's expense_type trigger calls
  // get_expense_claim_account_and_cost_center() and sets default_account +
  // cost_center on the row from the result.
  async function onExpenseTypeChange(v) {
    setLocal((x) => ({ ...x, expense_type: v, default_account: "" }));
    setNeedsAccountSetup(false);
    setError("");
    if (!v) return;
    if (!company) return setError("Select an employee and company before choosing an Expense Claim Type.");
    try {
      const res = await getExpenseAccountAndCostCenter(v, company);
      setLocal((x) => ({ ...x, default_account: res?.account ?? x.default_account, cost_center: res?.cost_center ?? x.cost_center }));
    } catch (lookupError) {
      setNeedsAccountSetup(true);
      setError(getErrorMessage(lookupError));
    }
  }

  function handleSave() {
    if (!local.expense_type) return setError("Expense Claim Type is required.");
    if (!local.default_account) return setError("Configure a default account for this Expense Claim Type and company before saving the row.");
    if (!(Number(local.amount) > 0)) return setError("Amount is required.");
    onSave(local);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={row ? "Edit Expense" : "Add Expense"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Expense Date">
          <input className="input" type="date" value={local.expense_date || ""} onChange={(e) => set("expense_date", e.target.value)} />
        </Field>
        <Field label="Expense Claim Type" required>
          <SearchableSelect value={local.expense_type || ""} onChange={onExpenseTypeChange} options={types} linkedDoctype={null} />
        </Field>
        <Field label="Amount" required>
          <input className="input" type="number" value={local.amount ?? ""} onChange={(e) => onAmountChange(e.target.value)} />
        </Field>
        <Field label="Sanctioned Amount">
          <input className="input" type="number" value={local.sanctioned_amount ?? ""} onChange={(e) => set("sanctioned_amount", e.target.value)} />
        </Field>
        <Field label="Cost Center">
          <SearchableSelect value={local.cost_center || ""} onChange={(v) => set("cost_center", v)} options={centers} linkedDoctype="Cost Center" parentDefaults={company ? { company } : {}} onCreate={() => setQuickCreate({ doctype: "Cost Center", apply: (v) => set("cost_center", v) })} createLabel="Create new Cost Center" />
        </Field>
        <Field label="Project">
          <SearchableSelect value={local.project || ""} onChange={(v) => set("project", v)} options={projects} linkedDoctype="Project" parentDefaults={company ? { company } : {}} onCreate={() => setQuickCreate({ doctype: "Project", apply: (v) => set("project", v) })} createLabel="Create new Project" />
        </Field>
        <Field label="Default Account"><Read value={local.default_account} /></Field>
        <Field label="Description" full>
          <textarea className="input" value={local.description || ""} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
      {needsAccountSetup && local.expense_type ? <Button type="button" variant="outline" className="mt-3" onClick={() => { onClose(); navigate(`/dashboard/expense-claim-types/${encodeURIComponent(local.expense_type)}/edit`); }}>Configure Expense Claim Type</Button> : null}
      <QuickCreateModal open={Boolean(quickCreate)} onClose={() => setQuickCreate(null)} doctype={quickCreate?.doctype} defaults={company ? { company } : {}} onCreated={(name) => { quickCreate?.apply(name); setQuickCreate(null); }} />
    </Modal>
  );
}

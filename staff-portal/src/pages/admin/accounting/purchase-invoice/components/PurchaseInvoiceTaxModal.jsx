import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";

function Field({ label, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const CHARGE_TYPES = ["Actual", "On Net Total", "On Previous Row Amount", "On Previous Row Total", "On Item Quantity"];
const EMPTY = { charge_type: "On Net Total", account_head: "", description: "", rate: 0, tax_amount: 0 };

// Real Purchase Taxes and Charges rate/tax_amount/total math runs entirely
// server-side in calculate_taxes_and_totals() on save -- this modal only
// collects the row's own inputs (charge_type, account, rate) for display
// preview, it does not attempt to replicate the real cascading tax engine.
export default function PurchaseInvoiceTaxModal({ open, onClose, onSave, row, company, netTotal }) {
  const [local, setLocal] = useState(EMPTY);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [quickCreate, setQuickCreate] = useState(null);

  useEffect(() => {
    if (open) { setLocal(row ? { ...row } : { ...EMPTY }); setError(""); }
  }, [open, row]);

  useEffect(() => {
    if (!open || !company) return;
    getAccountingLinkOptions("Account", { company }).then(setAccounts).catch(() => setAccounts([]));
  }, [open, company]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  function onAccountChange(v) {
    const match = accounts.find((a) => a.name === v);
    set("account_head", v);
    if (match && !local.description) set("description", v.split(" - ").slice(0, -1).join(" - ") || v);
  }

  function onRateChange(v) {
    const preview = local.charge_type === "On Net Total" && netTotal ? Math.round((Number(v || 0) * netTotal) / 100) : local.tax_amount;
    setLocal((x) => ({ ...x, rate: v, tax_amount: preview }));
  }

  function handleSave() {
    if (!local.account_head) return setError("Account Head is required.");
    if (!local.description) return setError("Description is required.");
    onSave(local);
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Tax / Charge" : "Add Tax / Charge"} size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Type *"><select className="input" value={local.charge_type || ""} onChange={(e) => set("charge_type", e.target.value)}>{CHARGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Account Head *"><SearchableSelect value={local.account_head || ""} onChange={onAccountChange} options={accounts} disabled={!company} placeholder={company ? "Search account..." : "Select a company first"} linkedDoctype={null} /></Field>
        <Field label="Rate"><input className="input" type="number" step="any" value={local.rate ?? ""} onChange={(e) => onRateChange(e.target.value)} /></Field>
        <Field label="Amount"><input className="input" type="number" step="any" value={local.tax_amount ?? ""} onChange={(e) => set("tax_amount", e.target.value)} /></Field>
        <Field label="Description *" full><textarea className="input" rows={2} value={local.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
      <QuickCreateModal open={Boolean(quickCreate)} onClose={() => setQuickCreate(null)} doctype={quickCreate?.doctype} defaults={company ? { company } : {}} onCreated={(name) => { quickCreate?.apply(name); setQuickCreate(null); }} />
    </Modal>
  );
}

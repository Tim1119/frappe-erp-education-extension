import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import { getTaxAccounts } from "@/services/education/salesInvoiceService";

function Field({ label, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
function Read({ value }) {
  return <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">{value === null || value === undefined || value === "" ? "—" : value}</div>;
}

const CHARGE_TYPES = ["On Net Total", "On Previous Row Amount", "On Previous Row Total", "On Item Quantity", "Actual"];
const EMPTY = { charge_type: "On Net Total", account_head: "", rate: 0, tax_amount: 0 };

// Real Sales Taxes and Charges cascading math runs server-side on save --
// this modal only previews a same-row percentage calc, mirroring
// PurchaseInvoiceTaxModal's own scope.
export default function SalesInvoiceTaxModal({ open, onClose, onSave, row, company, netTotal }) {
  const [local, setLocal] = useState(EMPTY);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [quickCreate, setQuickCreate] = useState(null);

  useEffect(() => { if (open) { setLocal(row ? { ...row } : { ...EMPTY }); setError(""); } }, [open, row]);
  useEffect(() => { if (!open || !company) { setAccounts([]); return; } getTaxAccounts(company).then(setAccounts).catch(() => setAccounts([])); }, [open, company]);

  const set = (key, value) => setLocal((current) => ({ ...current, [key]: value }));

  function onRateChange(value) {
    const preview = netTotal ? (Number(value || 0) * netTotal) / 100 : local.tax_amount;
    setLocal((current) => ({ ...current, rate: value, tax_amount: preview }));
  }

  function handleSave() {
    if (!local.account_head) return setError("Account Head is required.");
    onSave(local);
  }

  const isActual = local.charge_type === "Actual";

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Tax / Charge" : "Add Tax / Charge"} size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Type *"><select className="input" value={local.charge_type || ""} onChange={(e) => set("charge_type", e.target.value)}>{CHARGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Account Head *"><SearchableSelect value={local.account_head || ""} onChange={(v) => set("account_head", v)} options={accounts} disabled={!company} placeholder={company ? "Search account..." : "Select a company first"} linkedDoctype={null} /></Field>
        <Field label={isActual ? "Amount" : "Rate (%)"}>
          {isActual
            ? <input className="input" type="number" step="any" value={local.tax_amount ?? ""} onChange={(e) => set("tax_amount", e.target.value)} />
            : <input className="input" type="number" step="any" value={local.rate ?? ""} onChange={(e) => onRateChange(e.target.value)} />}
        </Field>
        <Field label="Tax Amount"><Read value={Number(local.tax_amount || 0).toLocaleString()} /></Field>
        <Field label="Description" full><input className="input" value={local.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
      <QuickCreateModal open={Boolean(quickCreate)} onClose={() => setQuickCreate(null)} doctype={quickCreate?.doctype} defaults={company ? { company } : {}} onCreated={(name) => { quickCreate?.apply(name); setQuickCreate(null); }} />
    </Modal>
  );
}

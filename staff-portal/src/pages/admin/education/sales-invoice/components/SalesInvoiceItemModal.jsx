import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getCostCenters, getIncomeAccounts } from "@/services/education/salesInvoiceService";

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

const EMPTY = { item_code: "", item_name: "", qty: 1, rate: 0, income_account: "", cost_center: "", description: "" };

// One modal reused for Add (row === null) and Edit -- mirrors
// PurchaseInvoiceItemModal's shape. Income Account / Cost Center default
// from the form's Accounting section but stay overridable per row, same
// contract the backend's _set_sales_invoice_fields() already expects
// (row.income_account, row.cost_center falling back to data.cost_center).
export default function SalesInvoiceItemModal({ open, onClose, onSave, row, company, items, defaultIncomeAccount, defaultCostCenter }) {
  const [local, setLocal] = useState(EMPTY);
  const [incomeAccounts, setIncomeAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLocal(row ? { ...row } : { ...EMPTY, income_account: defaultIncomeAccount || "", cost_center: defaultCostCenter || "" });
      setError("");
    }
  }, [open, row, defaultIncomeAccount, defaultCostCenter]);

  useEffect(() => {
    if (!open || !company) { setIncomeAccounts([]); setCostCenters([]); return; }
    getIncomeAccounts(company).then(setIncomeAccounts).catch(() => setIncomeAccounts([]));
    getCostCenters(company).then(setCostCenters).catch(() => setCostCenters([]));
  }, [open, company]);

  const set = (key, value) => setLocal((current) => ({ ...current, [key]: value }));

  function onItemChange(value) {
    set("item_code", value);
    if (!value) return;
    const item = (items || []).find((entry) => entry.name === value);
    setLocal((current) => ({ ...current, item_name: item?.item_name || value, rate: current.rate || Number(item?.standard_rate || 0) }));
  }

  function handleSave() {
    if (!local.item_code) return setError("Item is required.");
    if (!(Number(local.qty) > 0)) return setError("Quantity must be greater than zero.");
    if (!(Number(local.rate) >= 0)) return setError("Rate is required.");
    onSave({ ...local, amount: Number(local.qty || 0) * Number(local.rate || 0) });
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Item" : "Add Item"} size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Item *" full><SearchableSelect value={local.item_code || ""} onChange={onItemChange} options={items || []} displayField="item_name" showId placeholder="Search item..." /></Field>
        <Field label="Item Name"><input className="input" value={local.item_name || ""} onChange={(e) => set("item_name", e.target.value)} /></Field>
        <Field label="Quantity *"><input className="input" type="number" min="0.01" step="0.01" value={local.qty ?? ""} onChange={(e) => set("qty", e.target.value)} /></Field>
        <Field label="Rate *"><input className="input" type="number" min="0" step="0.01" value={local.rate ?? ""} onChange={(e) => set("rate", e.target.value)} /></Field>
        <Field label="Amount"><Read value={local.qty && local.rate ? (Number(local.qty) * Number(local.rate)).toLocaleString() : "—"} /></Field>
        <Field label="Income Account"><SearchableSelect value={local.income_account || ""} onChange={(v) => set("income_account", v)} options={incomeAccounts} disabled={!company} placeholder={company ? "Search account..." : "Select a company first"} /></Field>
        <Field label="Cost Center"><SearchableSelect value={local.cost_center || ""} onChange={(v) => set("cost_center", v)} options={costCenters} disabled={!company} placeholder={company ? "Search cost center..." : "Select a company first"} /></Field>
        <Field label="Description" full><textarea className="input" rows={3} value={local.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

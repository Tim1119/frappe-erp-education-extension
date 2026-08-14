import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";

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

const EMPTY = { item_code: "", item_name: "", description: "", qty: 1, uom: "", rate: 0, expense_account: "", cost_center: "", project: "" };

// One modal reused for Add (row === null) and Edit (row === the existing
// Purchase Invoice Item row). Only the fields Purchase Invoice Item marks
// in_list_view plus the accounting fields the user actually needs to set --
// warehouse/serial/batch/manufacturing fields are skipped per spec, they
// stay server-defaulted (empty) same as any other field this form doesn't
// send.
export default function PurchaseInvoiceItemModal({ open, onClose, onSave, row, company, defaultCostCenter, defaultExpenseAccount }) {
  const [local, setLocal] = useState(EMPTY);
  const [items, setItems] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLocal(row ? { ...row } : { ...EMPTY, cost_center: defaultCostCenter || "", expense_account: defaultExpenseAccount || "" });
      setError("");
    }
  }, [open, row, defaultCostCenter, defaultExpenseAccount]);

  useEffect(() => {
    if (!open) return;
    getAccountingLinkOptions("Item").then(setItems).catch(() => setItems([]));
    if (company) {
      getAccountingLinkOptions("Account", { company, fieldname: "expense_account" }).then(setExpenseAccounts).catch(() => setExpenseAccounts([]));
      getAccountingLinkOptions("Cost Center", { company }).then(setCostCenters).catch(() => setCostCenters([]));
    }
  }, [open, company]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  async function onItemChange(v) {
    set("item_code", v);
    if (!v) return;
    try {
      const data = await callMethod("frappe.client.get_value", {
        doctype: "Item",
        filters: { name: v },
        fieldname: ["item_name", "description", "stock_uom"],
      });
      setLocal((x) => ({ ...x, item_name: data?.item_name || v, description: data?.description || "", uom: x.uom || data?.stock_uom || "" }));
    } catch {
      // Item lookup failed -- user can still fill item_name/uom manually.
    }
  }

  function handleSave() {
    if (!local.item_code) return setError("Item is required.");
    if (!(Number(local.qty) > 0)) return setError("Accepted Qty is required.");
    if (!local.uom) return setError("UOM is required.");
    if (!(Number(local.rate) >= 0)) return setError("Rate is required.");
    onSave(local);
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Item" : "Add Item"} size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Item *" full><SearchableSelect value={local.item_code || ""} onChange={onItemChange} options={items} placeholder="Search item..." /></Field>
        <Field label="Item Name"><input className="input" value={local.item_name || ""} onChange={(e) => set("item_name", e.target.value)} /></Field>
        <Field label="UOM *"><input className="input" value={local.uom || ""} onChange={(e) => set("uom", e.target.value)} /></Field>
        <Field label="Accepted Qty *"><input className="input" type="number" value={local.qty ?? ""} onChange={(e) => set("qty", e.target.value)} /></Field>
        <Field label="Rate *"><input className="input" type="number" step="any" value={local.rate ?? ""} onChange={(e) => set("rate", e.target.value)} /></Field>
        <Field label="Amount"><Read value={local.qty && local.rate ? (Number(local.qty) * Number(local.rate)).toLocaleString() : "—"} /></Field>
        <Field label="Expense Head">
          <SearchableSelect value={local.expense_account || ""} onChange={(v) => set("expense_account", v)} options={expenseAccounts} disabled={!company} placeholder={company ? "Search account..." : "Select a company first"} />
        </Field>
        <Field label="Cost Center">
          <SearchableSelect value={local.cost_center || ""} onChange={(v) => set("cost_center", v)} options={costCenters} disabled={!company} placeholder={company ? "Search cost center..." : "Select a company first"} />
        </Field>
        <Field label="Project" full><input className="input" value={local.project || ""} onChange={(e) => set("project", e.target.value)} /></Field>
        <Field label="Description" full><textarea className="input" rows={3} value={local.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

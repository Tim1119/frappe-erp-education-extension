import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";

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
export default function PurchaseInvoiceItemModal({
  open, onClose, onSave, row, company, supplier, currency,
  buyingPriceList, conversionRate, postingDate, billDate, project,
  taxCategory, isReturn, defaultCostCenter, defaultExpenseAccount,
}) {
  const [local, setLocal] = useState(EMPTY);
  const [items, setItems] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [error, setError] = useState("");
  const [quickCreate, setQuickCreate] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editExpenseAccount, setEditExpenseAccount] = useState(false);

  useEffect(() => {
    if (open) {
      setLocal(row ? { ...row } : { ...EMPTY, cost_center: defaultCostCenter || "", expense_account: defaultExpenseAccount || "" });
      setEditExpenseAccount(!(row?.expense_account || defaultExpenseAccount));
      setLoadingDetails(false);
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
    setLocal((x) => ({ ...x, item_code: v, item_name: "", description: "", uom: "", rate: 0, expense_account: defaultExpenseAccount || "" }));
    setEditExpenseAccount(!defaultExpenseAccount);
    setError("");
    if (!v) return;
    if (!company) {
      setError("Select a company before adding an item so its accounting defaults can be loaded.");
      return;
    }

    setLoadingDetails(true);
    try {
      // This is the same controller method called by ERPNext Desk. Besides
      // item text/UOM/rate, it applies Item -> Item Group -> Brand -> Company
      // accounting defaults, which is where expense_account comes from.
      const details = await callMethod("erpnext.stock.get_item_details.get_item_details", {
        args: {
          item_code: v,
          doctype: "Purchase Invoice",
          company,
          supplier,
          currency,
          conversion_rate: Number(conversionRate || 1),
          price_list: buyingPriceList || undefined,
          buying_price_list: buyingPriceList || undefined,
          price_list_currency: currency || undefined,
          plc_conversion_rate: 1,
          transaction_date: postingDate,
          bill_date: billDate,
          project: local.project || project || undefined,
          qty: Number(local.qty || 1),
          uom: local.uom || undefined,
          cost_center: local.cost_center || defaultCostCenter || undefined,
          tax_category: taxCategory || undefined,
          is_return: Number(isReturn || 0),
          update_stock: 0,
          is_subcontracted: 0,
          ignore_pricing_rule: 0,
        },
        doc: {
          doctype: "Purchase Invoice",
          company,
          supplier,
          currency,
          buying_price_list: buyingPriceList,
          conversion_rate: Number(conversionRate || 1),
          posting_date: postingDate,
          bill_date: billDate,
          project,
          tax_category: taxCategory,
          is_return: Number(isReturn || 0),
        },
      });
      const expenseAccount = details?.expense_account || defaultExpenseAccount || "";
      setLocal((x) => ({
        ...x,
        item_code: v,
        item_name: details?.item_name || v,
        description: details?.description || "",
        uom: details?.uom || details?.stock_uom || "",
        stock_uom: details?.stock_uom || "",
        conversion_factor: details?.conversion_factor || 1,
        rate: Number(details?.rate ?? details?.price_list_rate ?? 0),
        expense_account: expenseAccount,
        cost_center: details?.cost_center || x.cost_center || defaultCostCenter || "",
        warehouse: details?.warehouse || "",
        item_tax_template: details?.item_tax_template || "",
        item_tax_rate: details?.item_tax_rate || "",
      }));
      setEditExpenseAccount(!expenseAccount);
    } catch (itemDetailsError) {
      // Retain a lightweight lookup as a fallback so a setup error does not
      // erase the selected item. The expense selector stays editable and the
      // original controller error explains which default is missing.
      try {
        const data = await callMethod("frappe.client.get_value", {
          doctype: "Item",
          filters: { name: v },
          fieldname: ["item_name", "description", "stock_uom"],
        });
        setLocal((x) => ({ ...x, item_name: data?.item_name || v, description: data?.description || "", uom: data?.stock_uom || "" }));
      } catch { /* Keep the selected item code. */ }
      setEditExpenseAccount(true);
      setError(getErrorMessage(itemDetailsError));
    } finally {
      setLoadingDetails(false);
    }
  }

  function handleSave() {
    if (!local.item_code) return setError("Item is required.");
    if (!(Number(local.qty) > 0)) return setError("Accepted Qty is required.");
    if (!local.uom) return setError("UOM is required.");
    if (!(Number(local.rate) >= 0)) return setError("Rate is required.");
    if (!local.expense_account) return setError("No Expense Head could be derived for this item and company. Select an expense account before saving the row.");
    onSave(local);
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Item" : "Add Item"} size="lg" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" disabled={loadingDetails} onClick={handleSave}>{loadingDetails ? "Loading defaults..." : "Save"}</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Item *" full><SearchableSelect value={local.item_code || ""} onChange={onItemChange} options={items} placeholder="Search item..." onCreate={() => setQuickCreate({ doctype: "Item", apply: onItemChange })} createLabel="Create new Item" /></Field>
        <Field label="Item Name"><Read value={local.item_name} /></Field>
        <Field label="UOM *"><input className="input" value={local.uom || ""} onChange={(e) => set("uom", e.target.value)} /></Field>
        <Field label="Accepted Qty *"><input className="input" type="number" value={local.qty ?? ""} onChange={(e) => set("qty", e.target.value)} /></Field>
        <Field label="Rate *"><input className="input" type="number" step="any" value={local.rate ?? ""} onChange={(e) => set("rate", e.target.value)} /></Field>
        <Field label="Amount"><Read value={local.qty && local.rate ? (Number(local.qty) * Number(local.rate)).toLocaleString() : "—"} /></Field>
        <Field label="Expense Head">
          {local.expense_account && !editExpenseAccount ? (
            <>
              <Read value={local.expense_account} />
              <button type="button" className="mt-1 text-xs font-medium text-primary hover:underline" onClick={() => setEditExpenseAccount(true)}>Change expense account</button>
            </>
          ) : (
            <SearchableSelect value={local.expense_account || ""} onChange={(v) => set("expense_account", v)} options={expenseAccounts} disabled={!company} placeholder={company ? "Search account..." : "Select a company first"} linkedDoctype={null} />
          )}
        </Field>
        <Field label="Cost Center">
          <SearchableSelect value={local.cost_center || ""} onChange={(v) => set("cost_center", v)} options={costCenters} disabled={!company} placeholder={company ? "Search cost center..." : "Select a company first"} onCreate={company ? () => setQuickCreate({ doctype: "Cost Center", apply: (v) => set("cost_center", v) }) : undefined} createLabel="Create new Cost Center" />
        </Field>
        <Field label="Project" full><input className="input" value={local.project || ""} onChange={(e) => set("project", e.target.value)} /></Field>
        <Field label="Description" full><textarea className="input" rows={3} value={local.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
      <QuickCreateModal open={Boolean(quickCreate)} onClose={() => setQuickCreate(null)} doctype={quickCreate?.doctype} defaults={company ? { company } : {}} onCreated={(name) => { quickCreate?.apply(name); setQuickCreate(null); }} />
    </Modal>
  );
}

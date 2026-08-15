import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchableSelect from "@/components/shared/SearchableSelect";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getCompanies, getCostCenters, getCustomers, getDebitAccounts, getFeeSchedules,
  getIncomeAccounts, getItems, getLetterHeads, getNamingSeries, getPrintHeadings,
  getStudents, getSubmittedSalesInvoices, getTaxAccounts, getTaxCategories, getTaxTemplates,
} from "@/services/education/salesInvoiceService";
import { callMethod } from "@/services/frappeClient";
import SalesInvoiceItemModal from "./SalesInvoiceItemModal";
import SalesInvoiceTaxModal from "./SalesInvoiceTaxModal";

const today = () => new Date().toLocaleDateString("en-CA");
const nowTime = () => new Date().toTimeString().slice(0, 8);

const EMPTY_FORM = {
  naming_series: "ACC-SINV-.YYYY.-", posting_date: today(), posting_time: nowTime(), set_posting_time: 0, due_date: "",
  customer: "", customer_name: "", company: "", student: "", fee_schedule: "",
  currency: "NGN", items: [], apply_discount_on: "Grand Total", discount_amount: 0,
  additional_discount_percentage: 0, taxes_and_charges: "", tax_category: "", taxes: [],
  debit_to: "", income_account: "", cost_center: "", remarks: "", is_return: 0,
  return_against: "", letter_head: "", select_print_heading: "", docstatus: 0,
};

function Label({ children, required }) {
  return <label className="label">{children}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}</label>;
}

function Field({ label, required, error, children }) {
  return <div className="field"><Label required={required}>{label}</Label>{children}{error && <p style={{ color: "var(--danger)", fontSize: 11, marginTop: 3 }}>{error}</p>}</div>;
}

function ReadOnly({ value }) {
  return <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground" style={{ minHeight: 36 }}>{value ?? "—"}</div>;
}

function Section({ title, collapsible = false, open = true, onToggle, action, children }) {
  return (
    <Card>
      <CardHeader className={`pb-3 ${collapsible ? "cursor-pointer" : ""}`} onClick={collapsible ? onToggle : undefined}>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            {collapsible && (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            {title}
          </span>
          {action}
        </CardTitle>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="iconbtn" onClick={onEdit}><Pencil size={14} /></button>
      <button type="button" className="iconbtn" onClick={onDelete}><Trash2 size={14} /></button>
    </div>
  );
}

export default function SalesInvoiceForm({ invoice, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [options, setOptions] = useState({ customers: [], students: [], companies: [], items: [], schedules: [], series: [], taxTemplates: [], taxCategories: [], letterHeads: [], printHeadings: [], returnInvoices: [], debit: [], income: [], costs: [], taxAccounts: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [taxesOpen, setTaxesOpen] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dateUnlocked, setDateUnlocked] = useState(false);
  const [itemModal, setItemModal] = useState(null); // { row, index } | { row: null, index: null }
  const [taxModal, setTaxModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { table, index }
  const canEdit = !invoice || invoice.docstatus === 0;

  useEffect(() => {
    Promise.all([getCustomers(), getStudents(), getCompanies(), getItems(), getFeeSchedules(), getNamingSeries(), getTaxTemplates(), getTaxCategories(), getLetterHeads(), getPrintHeadings(), getSubmittedSalesInvoices()])
      .then(([customers, students, companies, items, schedules, series, taxTemplates, taxCategories, letterHeads, printHeadings, returnInvoices]) => setOptions((old) => ({ ...old, customers: customers || [], students: students || [], companies: companies || [], items: items || [], schedules: schedules || [], series: (series || []).map((name) => ({ name })), taxTemplates: taxTemplates || [], taxCategories: taxCategories || [], letterHeads: letterHeads || [], printHeadings: printHeadings || [], returnInvoices: returnInvoices || [] })))
      .catch(() => toast.error("Some Sales Invoice options could not be loaded."));
  }, []);

  useEffect(() => {
    if (!invoice) return setForm({ ...EMPTY_FORM, posting_date: today(), posting_time: nowTime(), items: [], taxes: [] });
    setForm({ ...EMPTY_FORM, ...invoice, income_account: invoice.income_account || invoice.items?.[0]?.income_account || "", items: (invoice.items || []).map((row) => ({ ...row, amount: Number(row.qty || 0) * Number(row.rate || 0) })), taxes: invoice.taxes || [] });
    setDateUnlocked(Boolean(Number(invoice.set_posting_time)));
  }, [invoice]);

  useEffect(() => {
    if (!form.company) {
      setOptions((old) => ({ ...old, debit: [], income: [], costs: [], taxAccounts: [] }));
      return;
    }
    Promise.all([getDebitAccounts(form.company), getIncomeAccounts(form.company), getCostCenters(form.company), getTaxAccounts(form.company)])
      .then(([debit, income, costs, taxAccounts]) => setOptions((old) => ({ ...old, debit: debit || [], income: income || [], costs: costs || [], taxAccounts: taxAccounts || [] })))
      .catch(() => setOptions((old) => ({ ...old, debit: [], income: [], costs: [], taxAccounts: [] })));
  }, [form.company]);

  const totalQty = form.items.reduce((sum, row) => sum + Number(row.qty || 0), 0);
  const netTotal = form.items.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const percentageDiscount = netTotal * Number(form.additional_discount_percentage || 0) / 100;
  const totalTaxes = form.taxes.reduce((sum, row) => sum + (row.charge_type === "Actual" ? Number(row.tax_amount || 0) : netTotal * Number(row.rate || 0) / 100), 0);
  const grandTotal = netTotal - Number(form.discount_amount || 0) - percentageDiscount + totalTaxes;
  const roundedTotal = Math.round(grandTotal);
  const roundingAdjustment = roundedTotal - grandTotal;

  function update(field, value) { setForm((old) => ({ ...old, [field]: value })); setErrors((old) => ({ ...old, [field]: null })); }

  // Real Desk: get_party_account("Customer", ...) resolves the receivable
  // account the same way debit_to is derived on the real Sales Invoice form.
  async function fetchDebitTo(customer, company) {
    if (!customer || !company) return;
    try {
      const account = await callMethod("erpnext.accounts.party.get_party_account", { party_type: "Customer", party: customer, company });
      if (account) update("debit_to", account);
    } catch { /* no default receivable account configured for this company/customer */ }
  }

  // Real Desk: customer() -> get_party_details() fetches customer_name,
  // default_currency, etc. in one call -- mirrors PurchaseInvoiceForm's
  // onSupplierChange, called against the same generic frappe.client.get_value.
  async function selectCustomer(value) {
    setForm((old) => ({ ...old, customer: value, customer_name: "" }));
    if (!value) return;
    try {
      const data = await callMethod("frappe.client.get_value", {
        doctype: "Customer", filters: { name: value }, fieldname: ["customer_name", "default_currency"],
      });
      setForm((old) => (old.customer === value ? { ...old, customer_name: data?.customer_name || value, currency: data?.default_currency || old.currency } : old));
    } catch {
      setForm((old) => (old.customer === value ? { ...old, customer_name: value } : old));
    }
    fetchDebitTo(value, form.company);
  }

  // Real Desk: company() -> update_dimension() + get_party_account() for
  // debit_to, and defaults currency from the Company record.
  async function selectCompany(value) {
    setForm((old) => ({ ...old, company: value, debit_to: "", income_account: "", cost_center: "", taxes: old.taxes.map((row) => ({ ...row, account_head: "" })) }));
    setOptions((old) => ({ ...old, debit: [], income: [], costs: [], taxAccounts: [] }));
    if (!value) return;
    try {
      const data = await callMethod("frappe.client.get_value", { doctype: "Company", filters: { name: value }, fieldname: ["default_currency"] });
      setForm((old) => (old.company === value ? { ...old, currency: old.currency || data?.default_currency || "" } : old));
    } catch { /* leave existing currency */ }
    fetchDebitTo(form.customer, value);
  }

  function onSetPostingTime(checked) {
    setDateUnlocked(checked);
    if (checked) { update("set_posting_time", 1); return; }
    setForm((old) => ({ ...old, set_posting_time: 0, posting_date: today(), posting_time: nowTime() }));
  }

  function toggleReturn(checked) {
    setForm((old) => ({ ...old, is_return: checked ? 1 : 0, return_against: checked ? old.return_against : "" }));
  }

  function upsertRow(table, row, index) {
    setForm((old) => {
      const rows = [...(old[table] || [])];
      if (index === null || index === undefined) rows.push(row); else rows[index] = row;
      return { ...old, [table]: rows };
    });
  }
  function removeRow(table, index) {
    setForm((old) => ({ ...old, [table]: old[table].filter((_, i) => i !== index) }));
  }

  function validate() {
    const next = {};
    if (!form.customer) next.customer = "Customer is required";
    if (!form.company) next.company = "Company is required";
    if (!form.items.length) next.items = "At least one item is required";
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form, total_qty: totalQty, net_total: netTotal, total_taxes_and_charges: totalTaxes,
        grand_total: grandTotal, rounding_adjustment: roundingAdjustment, rounded_total: roundedTotal,
      });
    } finally {
      setSaving(false);
    }
  }

  const select = (value, onChange, list, placeholder, displayField, dependentDisabled = false) => <SearchableSelect value={value || ""} onChange={onChange} options={list} placeholder={placeholder} label={placeholder} displayField={displayField} disabled={!canEdit || dependentDisabled} showId={Boolean(displayField)} />;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4" style={{ padding: 20 }}>
      {!canEdit && <div style={{ padding: 12, borderRadius: 8, background: "var(--warning-soft)", color: "var(--warning-ink)", display: "flex", gap: 8 }}><AlertCircle size={16} /> This document is read-only.</div>}
      <Section title="Sales Invoice Information"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Naming Series">{select(form.naming_series, (v) => update("naming_series", v), options.series, "naming series")}</Field>
        <Field label="Posting Date">
          <div className="flex items-center gap-2">
            <input className="input" type="date" disabled={!canEdit || !dateUnlocked} value={form.posting_date || ""} onChange={(e) => update("posting_date", e.target.value)} />
            <label className="flex h-9 items-center gap-1 whitespace-nowrap text-xs font-medium text-muted-foreground"><input type="checkbox" checked={dateUnlocked} disabled={!canEdit} onChange={(e) => onSetPostingTime(e.target.checked)} /> Edit</label>
          </div>
        </Field>
        <Field label="Posting Time"><input className="input" type="time" step="1" disabled={!canEdit || !dateUnlocked} value={form.posting_time || ""} onChange={(e) => update("posting_time", e.target.value)} /></Field>
        <Field label="Payment Due Date"><input className="input" type="date" value={form.due_date || ""} onChange={(e) => update("due_date", e.target.value)} disabled={!canEdit} /></Field>
        <Field label="Customer" required error={errors.customer}>{select(form.customer, selectCustomer, options.customers, "customer", "customer_name")}</Field>
        <Field label="Customer Name"><ReadOnly value={form.customer_name} /></Field>
        <Field label="Company" required error={errors.company}>{select(form.company, selectCompany, options.companies, "company")}</Field>
        <Field label="Currency"><ReadOnly value={form.currency} /></Field>
        <Field label="Student">{select(form.student, (v) => update("student", v), options.students, "student", "student_name")}</Field>
        <Field label="Fee Schedule">{select(form.fee_schedule, (v) => update("fee_schedule", v), options.schedules, "fee schedule")}</Field>
      </div></Section>

      <Section title="Items" action={canEdit && <button type="button" className="btn btn-secondary" onClick={() => setItemModal({ row: null, index: null })}><Plus size={14} /> Add Row</button>}>
        {errors.items && <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 6 }}>{errors.items}</p>}
        <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th><th /></tr></thead><tbody>
          {form.items.map((row, i) => (
            <tr key={i} className={canEdit ? "cursor-pointer" : undefined} onClick={() => canEdit && setItemModal({ row, index: i })}>
              <td><b>{row.item_name || row.item_code}</b><div className="muted text-xs">{row.item_code}</div></td>
              <td>{row.qty}</td>
              <td>₦{Number(row.rate || 0).toLocaleString()}</td>
              <td>₦{Number(row.amount || 0).toLocaleString()}</td>
              <td>{canEdit && <RowActions onEdit={() => setItemModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "items", index: i })} />}</td>
            </tr>
          ))}
          {!form.items.length && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 16 }}>No items added.</td></tr>}
        </tbody></table></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Total Quantity"><ReadOnly value={totalQty.toLocaleString()} /></Field><Field label="Net Total"><ReadOnly value={`₦${netTotal.toLocaleString()}`} /></Field></div>
      </Section>

      <Section title="Discount" collapsible open={discountOpen} onToggle={() => setDiscountOpen(!discountOpen)}><div className="grid gap-4 md:grid-cols-3"><Field label="Apply Discount On"><select className="select" value={form.apply_discount_on || ""} onChange={(e) => update("apply_discount_on", e.target.value)} disabled={!canEdit}><option>Grand Total</option><option>Net Total</option></select></Field><Field label="Discount Amount"><input className="input" type="number" value={form.discount_amount || 0} onChange={(e) => update("discount_amount", Number(e.target.value))} disabled={!canEdit} /></Field><Field label="Additional Discount Percentage"><input className="input" type="number" value={form.additional_discount_percentage || 0} onChange={(e) => update("additional_discount_percentage", Number(e.target.value))} disabled={!canEdit} /></Field></div></Section>

      <Section title="Taxes" collapsible open={taxesOpen} onToggle={() => setTaxesOpen(!taxesOpen)} action={taxesOpen && canEdit && <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setTaxModal({ row: null, index: null }); }}><Plus size={14} /> Add Tax</button>}>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Sales Taxes and Charges Template">{select(form.taxes_and_charges, (v) => update("taxes_and_charges", v), options.taxTemplates, "tax template")}</Field><Field label="Tax Category">{select(form.tax_category, (v) => update("tax_category", v), options.taxCategories, "tax category")}</Field></div>
        <div className="mt-3 overflow-x-auto"><table className="tbl"><thead><tr><th>Type</th><th>Account Head</th><th>Rate</th><th>Tax Amount</th><th /></tr></thead><tbody>
          {form.taxes.map((row, i) => (
            <tr key={i} className={canEdit ? "cursor-pointer" : undefined} onClick={() => canEdit && setTaxModal({ row, index: i })}>
              <td>{row.charge_type}</td><td>{row.account_head}</td><td>{row.charge_type === "Actual" ? "—" : `${row.rate || 0}%`}</td><td>₦{Number(row.tax_amount || 0).toLocaleString()}</td>
              <td>{canEdit && <RowActions onEdit={() => setTaxModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "taxes", index: i })} />}</td>
            </tr>
          ))}
          {!form.taxes.length && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 16 }}>No taxes added.</td></tr>}
        </tbody></table></div>
        <div className="mt-4"><Field label="Total Taxes and Charges"><ReadOnly value={`₦${totalTaxes.toLocaleString()}`} /></Field></div>
      </Section>

      <Section title="Totals"><div className="grid gap-4 md:grid-cols-3"><Field label="Grand Total"><ReadOnly value={`₦${grandTotal.toLocaleString()}`} /></Field><Field label="Rounding Adjustment"><ReadOnly value={`₦${roundingAdjustment.toLocaleString()}`} /></Field><Field label="Rounded Total"><ReadOnly value={`₦${roundedTotal.toLocaleString()}`} /></Field></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Outstanding Amount"><ReadOnly value={`₦${Number(invoice?.outstanding_amount ?? roundedTotal).toLocaleString()}`} /></Field><Field label="In Words"><ReadOnly value={invoice?.in_words || "Calculated on save"} /></Field></div></Section>

      <Section title="Accounting" collapsible open={accountingOpen} onToggle={() => setAccountingOpen(!accountingOpen)}><div className="grid gap-4 md:grid-cols-3"><Field label="Debit To">{select(form.debit_to, (v) => update("debit_to", v), options.debit, form.company ? "Search receivable account..." : "Select a company first", undefined, !form.company)}</Field><Field label="Income Account">{select(form.income_account, (v) => update("income_account", v), options.income, form.company ? "Search income account..." : "Select a company first", undefined, !form.company)}</Field><Field label="Cost Center">{select(form.cost_center, (v) => update("cost_center", v), options.costs, form.company ? "Search cost center..." : "Select a company first", undefined, !form.company)}</Field></div><div className="mt-4"><Field label="Remarks"><textarea className="input" rows={3} value={form.remarks || ""} onChange={(e) => update("remarks", e.target.value)} disabled={!canEdit} /></Field></div></Section>

      <Section title="More Information" collapsible open={moreOpen} onToggle={() => setMoreOpen(!moreOpen)}><div className="grid gap-4 md:grid-cols-2"><Field label="Is Return (Credit Note)"><label className="flex h-9 items-center gap-2"><input type="checkbox" checked={Boolean(Number(form.is_return))} onChange={(e) => toggleReturn(e.target.checked)} disabled={!canEdit} /> Yes</label></Field>{Boolean(Number(form.is_return)) && <Field label="Return Against">{select(form.return_against, (v) => update("return_against", v), options.returnInvoices, "Search submitted sales invoice...")}</Field>}<Field label="Letter Head">{select(form.letter_head, (v) => update("letter_head", v), options.letterHeads, "letter head")}</Field><Field label="Print Heading">{select(form.select_print_heading, (v) => update("select_print_heading", v), options.printHeadings, "print heading")}</Field></div></Section>

      <div className="flex justify-end gap-2"><button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>{canEdit && <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : invoice ? "Update Sales Invoice" : "Create Sales Invoice"}</button>}</div>

      <SalesInvoiceItemModal
        open={Boolean(itemModal)} onClose={() => setItemModal(null)} row={itemModal?.row} items={options.items}
        company={form.company} defaultIncomeAccount={form.income_account} defaultCostCenter={form.cost_center}
        onSave={(row) => { upsertRow("items", row, itemModal?.index); setItemModal(null); }}
      />
      <SalesInvoiceTaxModal
        open={Boolean(taxModal)} onClose={() => setTaxModal(null)} row={taxModal?.row}
        company={form.company} netTotal={netTotal}
        onSave={(row) => { upsertRow("taxes", row, taxModal?.index); setTaxModal(null); }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { removeRow(deleteTarget.table, deleteTarget.index); setDeleteTarget(null); }}
        title="Remove this row?" description="This action cannot be undone." confirmLabel="Remove"
      />
    </form>
  );
}

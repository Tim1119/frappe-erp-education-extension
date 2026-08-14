import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";
import PurchaseInvoiceItemModal from "./PurchaseInvoiceItemModal";
import PurchaseInvoiceTaxModal from "./PurchaseInvoiceTaxModal";
import PurchaseInvoicePaymentScheduleModal from "./PurchaseInvoicePaymentScheduleModal";
import PurchaseInvoiceAdvanceModal from "./PurchaseInvoiceAdvanceModal";

const NAMING_SERIES = ["ACC-PINV-.YYYY.-", "ACC-PINV-RET-.YYYY.-"];
const APPLY_DISCOUNT_ON = ["Grand Total", "Net Total"];

function Field({ label, required, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}{required ? <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span> : null}</label>
      {children}
    </div>
  );
}
function Read({ value }) {
  return <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">{value === null || value === undefined || value === "" ? "—" : value}</div>;
}
function CollapsibleSection({ title, open, onToggle, action, children }) {
  return (
    <div className="panel" style={{ marginBottom: 14 }}>
      <div className="panel-head">
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={onToggle}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </div>
        {action}
      </div>
      {open && <div className="grid-form" style={{ padding: "10px 20px 26px" }}>{children}</div>}
    </div>
  );
}
function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button type="button" className="btn btn-ghost" onClick={onEdit}><Pencil size={14} /></button>
      <button type="button" className="btn btn-ghost" onClick={onDelete}><Trash2 size={14} /></button>
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

const DEFAULTS = {
  naming_series: NAMING_SERIES[0], supplier: "", supplier_name: "", company: "",
  posting_date: today(), posting_time: nowTime(), set_posting_time: 0, due_date: "",
  is_return: 0, is_paid: 0,
  bill_no: "", bill_date: "",
  cost_center: "", project: "",
  currency: "", buying_price_list: "", conversion_rate: 1,
  items: [], taxes_and_charges: "", tax_category: "", taxes: [],
  total_qty: 0, net_total: 0, grand_total: 0, rounding_adjustment: 0, rounded_total: 0, in_words: "", outstanding_amount: 0, total_advance: 0,
  apply_discount_on: "Grand Total", additional_discount_percentage: 0, discount_amount: 0,
  mode_of_payment: "", cash_bank_account: "", paid_amount: 0,
  allocate_advances_automatically: 0, advances: [],
  payment_terms_template: "", payment_schedule: [],
  tc_name: "", terms: "",
  status: "Draft",
  credit_to: "", is_opening: "No",
  letter_head: "", select_print_heading: "",
};

export default function PurchaseInvoiceForm({ initial, onSave, submitLabel = "Save" }) {
  const isEdit = Boolean(initial?.name);
  const [form, setForm] = useState({ ...DEFAULTS, ...(initial || {}) });
  useEffect(() => setForm({ ...DEFAULTS, ...(initial || {}) }), [initial]);

  const [tab, setTab] = useState("Details");
  const [open, setOpen] = useState({ information: true, items: true, taxes: true, totals: true });
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const [suppliers, setSuppliers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [taxTemplates, setTaxTemplates] = useState([]);
  const [paymentTermsTemplates, setPaymentTermsTemplates] = useState([]);

  useEffect(() => {
    getAccountingLinkOptions("Supplier").then(setSuppliers).catch(() => setSuppliers([]));
    getAccountingLinkOptions("Company").then(setCompanies).catch(() => setCompanies([]));
    getAccountingLinkOptions("Payment Terms Template").then(setPaymentTermsTemplates).catch(() => setPaymentTermsTemplates([]));
  }, []);

  useEffect(() => {
    if (!form.company) { setCostCenters([]); setCreditAccounts([]); setCashAccounts([]); setTaxTemplates([]); return; }
    getAccountingLinkOptions("Cost Center", { company: form.company }).then(setCostCenters).catch(() => setCostCenters([]));
    getAccountingLinkOptions("Account", { company: form.company, fieldname: "credit_to" }).then(setCreditAccounts).catch(() => setCreditAccounts([]));
    getAccountingLinkOptions("Account", { company: form.company, fieldname: "cash_bank_account" }).then(setCashAccounts).catch(() => setCashAccounts([]));
    getAccountingLinkOptions("Purchase Taxes and Charges Template", { company: form.company }).then(setTaxTemplates).catch(() => setTaxTemplates([]));
  }, [form.company]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function fetchCreditTo(supplier, company) {
    if (!supplier || !company) return;
    try {
      const account = await callMethod("erpnext.accounts.party.get_party_account", { party_type: "Supplier", party: supplier, company });
      if (account) set("credit_to", account);
    } catch { /* no default payable account configured for this company/supplier */ }
  }

  // Real Desk: supplier() -> get_party_details() fetches supplier_name,
  // default_currency, default_price_list, tax_id, payment_terms in one call.
  async function onSupplierChange(value) {
    set("supplier", value);
    if (!value) { set("supplier_name", ""); return; }
    try {
      const data = await callMethod("frappe.client.get_value", {
        doctype: "Supplier", filters: { name: value },
        fieldname: ["supplier_name", "default_currency", "default_price_list", "payment_terms"],
      });
      setForm((f) => ({
        ...f,
        supplier_name: data?.supplier_name || value,
        currency: data?.default_currency || f.currency,
        buying_price_list: data?.default_price_list || f.buying_price_list,
        payment_terms_template: data?.payment_terms || f.payment_terms_template,
      }));
    } catch { /* leave existing values -- user can fill manually */ }
    fetchCreditTo(value, form.company);
  }

  // Real Desk: company() -> update_dimension() + get_party_account() for credit_to.
  async function onCompanyChange(value) {
    set("company", value);
    if (!value) return;
    try {
      const data = await callMethod("frappe.client.get_value", { doctype: "Company", filters: { name: value }, fieldname: ["default_currency", "cost_center"] });
      setForm((f) => ({ ...f, currency: f.currency || data?.default_currency || "", cost_center: f.cost_center || data?.cost_center || "" }));
    } catch { /* leave existing values */ }
    if (!form.buying_price_list) {
      try {
        const bs = await callMethod("frappe.client.get_value", { doctype: "Buying Settings", filters: {}, fieldname: ["buying_price_list"] });
        if (bs?.buying_price_list) set("buying_price_list", bs.buying_price_list);
      } catch { /* Buying Settings has no default price list configured */ }
    }
    fetchCreditTo(form.supplier, value);
  }

  function onSetPostingTime(checked) {
    if (checked) { set("set_posting_time", 1); return; }
    setForm((f) => ({ ...f, set_posting_time: 0, posting_date: today(), posting_time: nowTime() }));
  }

  // ─── Child tables ────────────────────────────────────────────────────
  const [itemModal, setItemModal] = useState(null); // { row, index } | { row: null } for add
  const [taxModal, setTaxModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [advanceModal, setAdvanceModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { table, index }

  function upsertRow(table, row, index) {
    setForm((f) => {
      const rows = [...(f[table] || [])];
      if (index === undefined || index === null) rows.push(row);
      else rows[index] = row;
      return { ...f, [table]: rows };
    });
  }
  function removeRow(table, index) {
    setForm((f) => ({ ...f, [table]: f[table].filter((_, i) => i !== index) }));
  }

  const netTotalPreview = useMemo(() => (form.items || []).reduce((sum, r) => sum + Number(r.qty || 0) * Number(r.rate || 0), 0), [form.items]);
  const totalQtyPreview = useMemo(() => (form.items || []).reduce((sum, r) => sum + Number(r.qty || 0), 0), [form.items]);

  function submit(e) {
    e.preventDefault();
    if (!form.supplier) return;
    if (!form.items?.length) return;
    if (!form.credit_to) return;
    onSave(form);
  }

  const TABS = ["Details", "Payments", "Terms", "More Info"];

  return (
    <form onSubmit={submit}>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => <button type="button" key={t} className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === "Details" && <>
        <CollapsibleSection title="Information" open={open.information} onToggle={() => toggle("information")}>
          <Field label="Series"><select className="input" value={form.naming_series} onChange={(e) => set("naming_series", e.target.value)}>{NAMING_SERIES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Supplier" required><SearchableSelect value={form.supplier} onChange={onSupplierChange} options={suppliers} placeholder="Search supplier..." /></Field>
          <Field label="Supplier Name"><Read value={form.supplier_name} /></Field>
          <Field label="Posting Date" required>
            <input className="input" type="date" disabled={!form.set_posting_time} value={form.posting_date || ""} onChange={(e) => set("posting_date", e.target.value)} />
          </Field>
          <Field label="Posting Time">
            <input className="input" type="time" step="1" disabled={!form.set_posting_time} value={form.posting_time || ""} onChange={(e) => set("posting_time", e.target.value)} />
          </Field>
          <Field label="Edit Posting Date and Time">
            <label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={Boolean(form.set_posting_time)} onChange={(e) => onSetPostingTime(e.target.checked)} /> Edit Posting Date and Time</label>
          </Field>
          <Field label="Company"><SearchableSelect value={form.company} onChange={onCompanyChange} options={companies} placeholder="Search company..." /></Field>
          <Field label="Due Date"><input className="input" type="date" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></Field>
          <Field label="Is Return (Debit Note)"><label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={Boolean(form.is_return)} onChange={(e) => set("is_return", e.target.checked ? 1 : 0)} /> Is Return</label></Field>
          <Field label="Is Paid"><label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={Boolean(form.is_paid)} onChange={(e) => set("is_paid", e.target.checked ? 1 : 0)} /> Is Paid</label></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Supplier Invoice" open={Boolean(open.supplierInvoice)} onToggle={() => toggle("supplierInvoice")}>
          <Field label="Supplier Invoice No"><input className="input" value={form.bill_no || ""} onChange={(e) => set("bill_no", e.target.value)} /></Field>
          <Field label="Supplier Invoice Date"><input className="input" type="date" value={form.bill_date || ""} onChange={(e) => set("bill_date", e.target.value)} /></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Accounting Dimensions" open={Boolean(open.dimensions)} onToggle={() => toggle("dimensions")}>
          <Field label="Cost Center"><SearchableSelect value={form.cost_center || ""} onChange={(v) => set("cost_center", v)} options={costCenters} disabled={!form.company} placeholder={form.company ? "Search cost center..." : "Select a company first"} /></Field>
          <Field label="Project"><input className="input" value={form.project || ""} onChange={(e) => set("project", e.target.value)} /></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Currency and Price List" open={Boolean(open.currency)} onToggle={() => toggle("currency")}>
          <Field label="Currency"><input className="input" value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} /></Field>
          <Field label="Price List"><input className="input" value={form.buying_price_list || ""} onChange={(e) => set("buying_price_list", e.target.value)} /></Field>
          <Field label="Exchange Rate"><input className="input" type="number" step="any" value={form.conversion_rate ?? ""} onChange={(e) => set("conversion_rate", e.target.value)} /></Field>
        </CollapsibleSection>

        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="panel-head"><div className="panel-title">Items</div>
            <Button type="button" variant="outline" size="sm" onClick={() => setItemModal({ row: null })}><Plus size={14} className="mr-1" /> Add Row</Button>
          </div>
          <div style={{ padding: "10px 20px 26px", overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th><th /></tr></thead>
              <tbody>
                {(form.items || []).map((row, i) => (
                  <tr key={i}>
                    <td><b>{row.item_name || row.item_code}</b><div className="muted text-xs">{row.item_code}</div></td>
                    <td>{row.qty} {row.uom}</td>
                    <td>{Number(row.rate || 0).toLocaleString()}</td>
                    <td>{(Number(row.qty || 0) * Number(row.rate || 0)).toLocaleString()}</td>
                    <td><RowActions onEdit={() => setItemModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "items", index: i })} /></td>
                  </tr>
                ))}
                {!form.items?.length && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 16 }}>No items added.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <CollapsibleSection title="Taxes and Charges" open={Boolean(open.taxes)} onToggle={() => toggle("taxes")}
          action={<Button type="button" variant="outline" size="sm" onClick={() => setTaxModal({ row: null })}><Plus size={14} className="mr-1" /> Add Row</Button>}>
          <Field label="Purchase Taxes and Charges Template"><SearchableSelect value={form.taxes_and_charges || ""} onChange={(v) => set("taxes_and_charges", v)} options={taxTemplates} disabled={!form.company} placeholder={form.company ? "Search template..." : "Select a company first"} /></Field>
          <Field label="Tax Category"><input className="input" value={form.tax_category || ""} onChange={(e) => set("tax_category", e.target.value)} /></Field>
          <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Type</th><th>Account Head</th><th>Rate</th><th>Amount</th><th>Total</th><th /></tr></thead>
              <tbody>
                {(form.taxes || []).map((row, i) => (
                  <tr key={i}>
                    <td>{row.charge_type}</td><td>{row.account_head}</td><td>{row.rate}</td><td>{Number(row.tax_amount || 0).toLocaleString()}</td><td>{Number(row.total || 0).toLocaleString() || "—"}</td>
                    <td><RowActions onEdit={() => setTaxModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "taxes", index: i })} /></td>
                  </tr>
                ))}
                {!form.taxes?.length && <tr><td colSpan={6} className="muted" style={{ textAlign: "center", padding: 16 }}>No taxes added.</td></tr>}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Totals" open={Boolean(open.totals)} onToggle={() => toggle("totals")}>
          <Field label="Total Quantity"><Read value={isEdit ? form.total_qty : totalQtyPreview} /></Field>
          <Field label="Net Total"><Read value={isEdit ? Number(form.net_total || 0).toLocaleString() : "Calculated on save"} /></Field>
          <Field label="Grand Total"><Read value={isEdit ? Number(form.grand_total || 0).toLocaleString() : "Calculated on save"} /></Field>
          <Field label="Rounding Adjustment"><Read value={isEdit ? Number(form.rounding_adjustment || 0).toLocaleString() : "—"} /></Field>
          <Field label="Rounded Total"><Read value={isEdit ? Number(form.rounded_total || 0).toLocaleString() : "—"} /></Field>
          <Field label="In Words" full><Read value={form.in_words} /></Field>
          <Field label="Outstanding Amount"><Read value={isEdit ? Number(form.outstanding_amount || 0).toLocaleString() : "—"} /></Field>
          <Field label="Total Advance"><Read value={isEdit ? Number(form.total_advance || 0).toLocaleString() : "—"} /></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Additional Discount" open={Boolean(open.discount)} onToggle={() => toggle("discount")}>
          <Field label="Apply Additional Discount On"><select className="input" value={form.apply_discount_on || ""} onChange={(e) => set("apply_discount_on", e.target.value)}>{APPLY_DISCOUNT_ON.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Additional Discount Percentage"><input className="input" type="number" step="any" value={form.additional_discount_percentage ?? ""} onChange={(e) => set("additional_discount_percentage", e.target.value)} /></Field>
          <Field label="Additional Discount Amount"><input className="input" type="number" step="any" value={form.discount_amount ?? ""} onChange={(e) => set("discount_amount", e.target.value)} /></Field>
        </CollapsibleSection>
      </>}

      {tab === "Payments" && <>
        <CollapsibleSection title="Payments" open={Boolean(open.payments)} onToggle={() => toggle("payments")}>
          <Field label="Mode of Payment"><input className="input" value={form.mode_of_payment || ""} onChange={(e) => set("mode_of_payment", e.target.value)} /></Field>
          <Field label="Cash/Bank Account"><SearchableSelect value={form.cash_bank_account || ""} onChange={(v) => set("cash_bank_account", v)} options={cashAccounts} disabled={!form.company} placeholder={form.company ? "Search account..." : "Select a company first"} /></Field>
          <Field label="Paid Amount"><input className="input" type="number" step="any" value={form.paid_amount ?? ""} onChange={(e) => set("paid_amount", e.target.value)} /></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Advances" open={Boolean(open.advances)} onToggle={() => toggle("advances")}
          action={<Button type="button" variant="outline" size="sm" onClick={() => setAdvanceModal({ row: null })}><Plus size={14} className="mr-1" /> Add Row</Button>}>
          <Field label="Set Advances and Allocate (FIFO)"><label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={Boolean(form.allocate_advances_automatically)} onChange={(e) => set("allocate_advances_automatically", e.target.checked ? 1 : 0)} /> Allocate automatically</label></Field>
          <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Reference</th><th>Advance Amount</th><th>Allocated</th><th /></tr></thead>
              <tbody>
                {(form.advances || []).map((row, i) => (
                  <tr key={i}>
                    <td><b>{row.reference_name}</b><div className="muted text-xs">{row.reference_type}</div></td>
                    <td>{Number(row.advance_amount || 0).toLocaleString()}</td>
                    <td>{Number(row.allocated_amount || 0).toLocaleString()}</td>
                    <td><RowActions onEdit={() => setAdvanceModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "advances", index: i })} /></td>
                  </tr>
                ))}
                {!form.advances?.length && <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 16 }}>No advances added.</td></tr>}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      </>}

      {tab === "Terms" && <>
        <CollapsibleSection title="Payment Terms" open={Boolean(open.terms)} onToggle={() => toggle("terms")}
          action={<Button type="button" variant="outline" size="sm" onClick={() => setScheduleModal({ row: null })}><Plus size={14} className="mr-1" /> Add Row</Button>}>
          <Field label="Payment Terms Template"><SearchableSelect value={form.payment_terms_template || ""} onChange={(v) => set("payment_terms_template", v)} options={paymentTermsTemplates} /></Field>
          <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Due Date</th><th>Invoice Portion</th><th>Payment Amount</th><th /></tr></thead>
              <tbody>
                {(form.payment_schedule || []).map((row, i) => (
                  <tr key={i}>
                    <td>{row.due_date}</td><td>{row.invoice_portion}%</td><td>{Number(row.payment_amount || 0).toLocaleString()}</td>
                    <td><RowActions onEdit={() => setScheduleModal({ row, index: i })} onDelete={() => setDeleteTarget({ table: "payment_schedule", index: i })} /></td>
                  </tr>
                ))}
                {!form.payment_schedule?.length && <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 16 }}>No payment terms added.</td></tr>}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Terms and Conditions" open={Boolean(open.termsText)} onToggle={() => toggle("termsText")}>
          <Field label="Terms"><input className="input" value={form.tc_name || ""} onChange={(e) => set("tc_name", e.target.value)} /></Field>
          <Field label="Terms and Conditions" full><textarea className="input" rows={5} value={form.terms || ""} onChange={(e) => set("terms", e.target.value)} /></Field>
        </CollapsibleSection>
      </>}

      {tab === "More Info" && <>
        <CollapsibleSection title="Status" open={Boolean(open.status)} onToggle={() => toggle("status")}>
          <Field label="Status"><Read value={form.status} /></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Accounting Details" open={Boolean(open.accountingDetails)} onToggle={() => toggle("accountingDetails")}>
          <Field label="Credit To" required><SearchableSelect value={form.credit_to || ""} onChange={(v) => set("credit_to", v)} options={creditAccounts} disabled={!form.company} placeholder={form.company ? "Search account..." : "Select a company first"} /></Field>
          <Field label="Is Opening Entry"><select className="input" value={form.is_opening || "No"} onChange={(e) => set("is_opening", e.target.value)}><option>No</option><option>Yes</option></select></Field>
        </CollapsibleSection>

        <CollapsibleSection title="Print Settings" open={Boolean(open.print)} onToggle={() => toggle("print")}>
          <Field label="Letter Head"><input className="input" value={form.letter_head || ""} onChange={(e) => set("letter_head", e.target.value)} /></Field>
          <Field label="Print Heading"><input className="input" value={form.select_print_heading || ""} onChange={(e) => set("select_print_heading", e.target.value)} /></Field>
        </CollapsibleSection>
      </>}

      <div className="mt-4 flex justify-end"><button className="btn btn-primary">{submitLabel}</button></div>

      <PurchaseInvoiceItemModal
        open={Boolean(itemModal)} onClose={() => setItemModal(null)} row={itemModal?.row}
        company={form.company} defaultCostCenter={form.cost_center}
        onSave={(row) => { upsertRow("items", row, itemModal?.index); setItemModal(null); }}
      />
      <PurchaseInvoiceTaxModal
        open={Boolean(taxModal)} onClose={() => setTaxModal(null)} row={taxModal?.row}
        company={form.company} netTotal={netTotalPreview}
        onSave={(row) => { upsertRow("taxes", row, taxModal?.index); setTaxModal(null); }}
      />
      <PurchaseInvoicePaymentScheduleModal
        open={Boolean(scheduleModal)} onClose={() => setScheduleModal(null)} row={scheduleModal?.row}
        onSave={(row) => { upsertRow("payment_schedule", row, scheduleModal?.index); setScheduleModal(null); }}
      />
      <PurchaseInvoiceAdvanceModal
        open={Boolean(advanceModal)} onClose={() => setAdvanceModal(null)} row={advanceModal?.row}
        supplier={form.supplier}
        onSave={(row) => { upsertRow("advances", row, advanceModal?.index); setAdvanceModal(null); }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { removeRow(deleteTarget.table, deleteTarget.index); setDeleteTarget(null); }}
        title="Remove this row?" description="This action cannot be undone." confirmLabel="Remove"
      />
    </form>
  );
}

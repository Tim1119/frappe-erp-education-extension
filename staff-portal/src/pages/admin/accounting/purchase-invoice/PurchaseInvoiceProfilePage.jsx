import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, FileText, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Modal from "@/components/shared/Modal";
import {
  cancelAccountingDocument, deleteAccountingDocument, getAccountingConnections,
  getAccountingDocument, submitAccountingDocument,
} from "@/services/accounting/documentService";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value, full }) {
  return <div style={full ? { gridColumn: "1 / -1" } : undefined}><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="whitespace-pre-wrap text-sm font-semibold">{value === null || value === undefined || value === "" ? "—" : value}</p></div>;
}
function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <div className="panel" style={{ marginBottom: 14 }}>
      <button type="button" className="panel-head w-full text-left" style={{ cursor: "pointer" }} onClick={onToggle}>
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}{title}</div>
      </button>
      {open && <div className="grid-form" style={{ padding: "10px 20px 26px" }}>{children}</div>}
    </div>
  );
}

const PI_STATUS_COLORS = {
  Paid: "success", Unpaid: "warning", Overdue: "danger", "Partly Paid": "warning",
  Return: "gray", "Debit Note Issued": "gray", "Internal Transfer": "gray",
  "On Hold": "gray", "Temporarily on Hold": "gray",
};
function StatusPill({ doc }) {
  const label = doc.on_hold && Number(doc.outstanding_amount) > 0 && doc.docstatus === 1
    ? (doc.release_date && new Date(doc.release_date) > new Date() ? "Temporarily on Hold" : "On Hold")
    : (doc.status || "Draft");
  const tone = PI_STATUS_COLORS[label] || "gray";
  const style = tone === "gray" ? { backgroundColor: "var(--surface-3)", color: "var(--ink-3)" } : { backgroundColor: `var(--${tone}-soft)`, color: `var(--${tone}-ink)` };
  return <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold" style={style}>{label}</span>;
}

function ConnectionButton({ icon: Icon, label, path, count, loading }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", backgroundColor: "var(--surface-2)", border: "1px solid hsl(var(--border))", borderRadius: 6, cursor: "pointer", width: "100%", textAlign: "left", color: "var(--ink)", fontSize: 12 }}>
      <Icon size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {loading ? <span style={{ fontSize: 10, color: "var(--ink-3)" }}>...</span> : <span style={{ fontSize: 10, color: "var(--ink-3)", backgroundColor: "var(--surface)", padding: "1px 6px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>{count ?? 0}</span>}
    </button>
  );
}

const money = (v) => (v ? `₦${Number(v).toLocaleString()}` : "—");

export default function PurchaseInvoiceProfilePage() {
  const { id } = useParams(); const name = decodeURIComponent(id); const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [connections, setConnections] = useState(null); const [loadingConnections, setLoadingConnections] = useState(true);
  const [open, setOpen] = useState({ information: true, items: true, taxes: true, totals: true });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({ release_date: "", hold_comment: "" });
  const [busy, setBusy] = useState(false);
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  function load() { return getAccountingDocument("Purchase Invoice", name).then(setDoc).catch((e) => toast.error(getErrorMessage(e))); }
  useEffect(() => { load(); }, [name]);
  useEffect(() => {
    setLoadingConnections(true);
    getAccountingConnections("Purchase Invoice", name).then(setConnections).catch(() => setConnections({})).finally(() => setLoadingConnections(false));
  }, [name]);

  async function action(fn, message) {
    try { await fn("Purchase Invoice", name); toast.success(message); load(); } catch (e) { toast.error(getErrorMessage(e)); }
  }
  async function handleDelete() {
    try { await deleteAccountingDocument("Purchase Invoice", name); toast.success("Purchase Invoice deleted"); navigate("/dashboard/purchase-invoices"); }
    catch (e) { toast.error(getErrorMessage(e)); }
  }

  // These four all call the real ERPNext-core whitelisted methods directly
  // (same functions Desk's own buttons call) rather than reimplementing
  // their permission/validation/mapping logic here.
  async function handleMakePayment() {
    setBusy(true);
    try {
      const draft = await callMethod("erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", { dt: "Purchase Invoice", dn: name });
      navigate("/dashboard/payment-entries/new", { state: { prefill: { ...draft, purchase_invoice: name } } });
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  }
  async function handleMakeDebitNote() {
    setBusy(true);
    try {
      const draft = await callMethod("erpnext.accounts.doctype.purchase_invoice.purchase_invoice.make_debit_note", { source_name: name });
      navigate("/dashboard/purchase-invoices/new", { state: { prefill: draft } });
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  }
  async function handleBlockSave() {
    if (!blockForm.release_date) return toast.error("Release Date is required.");
    try {
      await callMethod("erpnext.accounts.doctype.purchase_invoice.purchase_invoice.block_invoice", { name, release_date: blockForm.release_date, hold_comment: blockForm.hold_comment });
      toast.success("Purchase Invoice blocked");
      setBlockOpen(false);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  }
  async function handleUnblock() {
    try {
      await callMethod("erpnext.accounts.doctype.purchase_invoice.purchase_invoice.unblock_invoice", { name });
      toast.success("Purchase Invoice unblocked");
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  }

  if (!doc) return <div className="muted">Loading…</div>;

  // Mirrors purchase_invoice.js refresh() exactly: Payment needs a nonzero
  // outstanding balance and the invoice not on hold; Return/Debit Note is
  // hidden once the invoice already is one; Block/Unblock both additionally
  // require !is_return, which the original ask's condition list omitted.
  const canPay = doc.docstatus === 1 && Number(doc.outstanding_amount) !== 0 && !doc.on_hold;
  const canReturn = doc.docstatus === 1 && !doc.is_return && (Number(doc.outstanding_amount) >= 0 || Math.abs(Number(doc.outstanding_amount)) < Number(doc.grand_total));
  const canBlock = doc.docstatus === 1 && !doc.is_return && Number(doc.outstanding_amount) !== 0 && !doc.on_hold;
  const canUnblock = doc.docstatus === 1 && !doc.is_return && Boolean(doc.on_hold);
  const showCreateMenu = canPay || canReturn || canBlock || canUnblock;
  const purchaseOrders = [...new Set((doc.items || []).map((row) => row.purchase_order).filter(Boolean))];
  const purchaseOrderPath = purchaseOrders.length === 1
    ? `/dashboard/purchase-orders/${encodeURIComponent(purchaseOrders[0])}`
    : `/dashboard/purchase-orders?purchase_invoice=${encodeURIComponent(name)}`;

  const connectionItems = [
    { key: "payments", label: "Payment Entry", icon: Wallet, path: `/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}&reference_doctype=${encodeURIComponent("Purchase Invoice")}` },
    { key: "journal_entries", label: "Journal Entry", icon: FileText, path: `/dashboard/journal-entries?reference_name=${encodeURIComponent(name)}&reference_type=${encodeURIComponent("Purchase Invoice")}` },
    { key: "purchase_returns", label: "Return / Debit Note", icon: FileText, path: `/dashboard/purchase-invoices?return_against=${encodeURIComponent(name)}` },
    { key: "purchase_orders", label: "Purchase Order", icon: FileText, path: purchaseOrderPath },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Accounting · Payables · Invoicing"
        title={<span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>{doc.supplier_name || doc.name}<StatusPill doc={doc} /></span>}
        sub={doc.name}
        button={
          <div className="flex gap-2">
            {doc.can_edit && <Button variant="outline" onClick={() => navigate(`/dashboard/purchase-invoices/${encodeURIComponent(name)}/edit`)}>Edit</Button>}
            {doc.docstatus === 0 && <Button variant="default" onClick={() => action(submitAccountingDocument, "Purchase Invoice submitted")}>Submit</Button>}
            {showCreateMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" disabled={busy}>Create <ChevronDown className="ml-1 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPay && <DropdownMenuItem onClick={handleMakePayment}>Payment</DropdownMenuItem>}
                  {canReturn && <DropdownMenuItem onClick={handleMakeDebitNote}>Return / Debit Note</DropdownMenuItem>}
                  {canBlock && <DropdownMenuItem onClick={() => { setBlockForm({ release_date: doc.release_date || "", hold_comment: doc.hold_comment || "" }); setBlockOpen(true); }}>Block Invoice</DropdownMenuItem>}
                  {canUnblock && <DropdownMenuItem onClick={handleUnblock}>Unblock Invoice</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {doc.docstatus === 1 && <Button variant="destructive" onClick={() => action(cancelAccountingDocument, "Purchase Invoice cancelled")}>Cancel</Button>}
            {doc.can_delete && <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>}
          </div>
        }
      />

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head"><div className="panel-title">Connections</div></div>
        <div className="grid-form" style={{ padding: 20, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {connectionItems.map((item) => <ConnectionButton key={item.key} icon={item.icon} label={item.label} path={item.path} count={connections?.[item.key]} loading={loadingConnections} />)}
        </div>
      </div>

      <CollapsibleSection title="Information" open={open.information} onToggle={() => toggle("information")}>
        <Field label="Series" value={doc.naming_series} />
        <Field label="Supplier" value={doc.supplier} />
        <Field label="Supplier Name" value={doc.supplier_name} />
        <Field label="Posting Date" value={fmtDate(doc.posting_date)} />
        <Field label="Posting Time" value={doc.posting_time} />
        <Field label="Company" value={doc.company} />
        <Field label="Due Date" value={fmtDate(doc.due_date)} />
        <Field label="Is Return (Debit Note)" value={doc.is_return ? "Yes" : "No"} />
        <Field label="Is Paid" value={doc.is_paid ? "Yes" : "No"} />
      </CollapsibleSection>

      <CollapsibleSection title="Supplier Invoice" open={Boolean(open.supplierInvoice)} onToggle={() => toggle("supplierInvoice")}>
        <Field label="Supplier Invoice No" value={doc.bill_no} />
        <Field label="Supplier Invoice Date" value={fmtDate(doc.bill_date)} />
      </CollapsibleSection>

      <CollapsibleSection title="Accounting Dimensions" open={Boolean(open.dimensions)} onToggle={() => toggle("dimensions")}>
        <Field label="Cost Center" value={doc.cost_center} />
        <Field label="Project" value={doc.project} />
      </CollapsibleSection>

      <CollapsibleSection title="Currency and Price List" open={Boolean(open.currency)} onToggle={() => toggle("currency")}>
        <Field label="Currency" value={doc.currency} />
        <Field label="Price List" value={doc.buying_price_list} />
        <Field label="Exchange Rate" value={doc.conversion_rate} />
      </CollapsibleSection>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head"><div className="panel-title">Items</div></div>
        <div style={{ padding: "10px 20px 26px", overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>
              {(doc.items || []).map((row, i) => (
                <tr key={i}><td><b>{row.item_name || row.item_code}</b><div className="muted text-xs">{row.item_code}</div></td><td>{row.qty} {row.uom}</td><td>{money(row.rate)}</td><td>{money(row.amount)}</td></tr>
              ))}
              {!doc.items?.length && <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 16 }}>No items.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <CollapsibleSection title="Taxes and Charges" open={Boolean(open.taxes)} onToggle={() => toggle("taxes")}>
        <Field label="Purchase Taxes and Charges Template" value={doc.taxes_and_charges} />
        <Field label="Tax Category" value={doc.tax_category} />
        <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Type</th><th>Account Head</th><th>Rate</th><th>Amount</th><th>Total</th></tr></thead>
            <tbody>
              {(doc.taxes || []).map((row, i) => <tr key={i}><td>{row.charge_type}</td><td>{row.account_head}</td><td>{row.rate}</td><td>{money(row.tax_amount)}</td><td>{money(row.total)}</td></tr>)}
              {!doc.taxes?.length && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 16 }}>No taxes.</td></tr>}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Totals" open={Boolean(open.totals)} onToggle={() => toggle("totals")}>
        <Field label="Total Quantity" value={doc.total_qty} />
        <Field label="Net Total" value={money(doc.net_total)} />
        <Field label="Grand Total" value={money(doc.grand_total)} />
        <Field label="Rounding Adjustment" value={money(doc.rounding_adjustment)} />
        <Field label="Rounded Total" value={money(doc.rounded_total)} />
        <Field label="In Words" value={doc.in_words} full />
        <Field label="Outstanding Amount" value={money(doc.outstanding_amount)} />
        <Field label="Total Advance" value={money(doc.total_advance)} />
      </CollapsibleSection>

      <CollapsibleSection title="Additional Discount" open={Boolean(open.discount)} onToggle={() => toggle("discount")}>
        <Field label="Apply Additional Discount On" value={doc.apply_discount_on} />
        <Field label="Additional Discount Percentage" value={doc.additional_discount_percentage} />
        <Field label="Additional Discount Amount" value={money(doc.discount_amount)} />
      </CollapsibleSection>

      <CollapsibleSection title="Payments" open={Boolean(open.payments)} onToggle={() => toggle("payments")}>
        <Field label="Mode of Payment" value={doc.mode_of_payment} />
        <Field label="Cash/Bank Account" value={doc.cash_bank_account} />
        <Field label="Paid Amount" value={money(doc.paid_amount)} />
      </CollapsibleSection>

      <CollapsibleSection title="Advances" open={Boolean(open.advances)} onToggle={() => toggle("advances")}>
        <Field label="Set Advances and Allocate (FIFO)" value={doc.allocate_advances_automatically ? "Yes" : "No"} />
        <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Reference</th><th>Advance Amount</th><th>Allocated</th></tr></thead>
            <tbody>
              {(doc.advances || []).map((row, i) => <tr key={i}><td><b>{row.reference_name}</b><div className="muted text-xs">{row.reference_type}</div></td><td>{money(row.advance_amount)}</td><td>{money(row.allocated_amount)}</td></tr>)}
              {!doc.advances?.length && <tr><td colSpan={3} className="muted" style={{ textAlign: "center", padding: 16 }}>No advances.</td></tr>}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Payment Terms" open={Boolean(open.terms)} onToggle={() => toggle("terms")}>
        <Field label="Payment Terms Template" value={doc.payment_terms_template} />
        <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Due Date</th><th>Invoice Portion</th><th>Payment Amount</th></tr></thead>
            <tbody>
              {(doc.payment_schedule || []).map((row, i) => <tr key={i}><td>{fmtDate(row.due_date)}</td><td>{row.invoice_portion}%</td><td>{money(row.payment_amount)}</td></tr>)}
              {!doc.payment_schedule?.length && <tr><td colSpan={3} className="muted" style={{ textAlign: "center", padding: 16 }}>No payment terms.</td></tr>}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Terms and Conditions" open={Boolean(open.termsText)} onToggle={() => toggle("termsText")}>
        <Field label="Terms" value={doc.tc_name} />
        <Field label="Terms and Conditions" value={doc.terms} full />
      </CollapsibleSection>

      <CollapsibleSection title="Status" open={Boolean(open.status)} onToggle={() => toggle("status")}>
        <Field label="Status" value={doc.status} />
      </CollapsibleSection>

      <CollapsibleSection title="Accounting Details" open={Boolean(open.accountingDetails)} onToggle={() => toggle("accountingDetails")}>
        <Field label="Credit To" value={doc.credit_to} />
        <Field label="Is Opening Entry" value={doc.is_opening} />
      </CollapsibleSection>

      <CollapsibleSection title="Print Settings" open={Boolean(open.print)} onToggle={() => toggle("print")}>
        <Field label="Letter Head" value={doc.letter_head} />
        <Field label="Print Heading" value={doc.select_print_heading} />
      </CollapsibleSection>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title={`Delete ${doc.name}?`} description="This action cannot be undone." confirmLabel="Delete" />

      <Modal
        open={blockOpen} onClose={() => setBlockOpen(false)} title="Block Invoice"
        footer={<><Button variant="outline" onClick={() => setBlockOpen(false)}>Cancel</Button><Button variant="default" onClick={handleBlockSave}>Save</Button></>}
      >
        <div className="grid-form">
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Release Date<span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span></label>
            <input className="input" type="date" value={blockForm.release_date || ""} onChange={(e) => setBlockForm((f) => ({ ...f, release_date: e.target.value }))} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Reason For Putting On Hold</label>
            <textarea className="input" rows={3} value={blockForm.hold_comment || ""} onChange={(e) => setBlockForm((f) => ({ ...f, hold_comment: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </>
  );
}

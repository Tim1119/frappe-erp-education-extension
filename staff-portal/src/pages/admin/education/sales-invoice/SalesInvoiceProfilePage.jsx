import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ban, CheckCircle2, ChevronDown, ChevronRight, FileText, Pencil, Trash2, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { cancelSalesInvoice, deleteSalesInvoice, getConnections, getSalesInvoice, submitSalesInvoice } from "@/services/education/salesInvoiceService";
import { callMethod } from "@/services/frappeClient";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value ?? "—"}</p></div>; }
function money(value) { return value === null || value === undefined || value === "" ? "—" : `₦${Number(value).toLocaleString()}`; }
function Section({ title, collapsible = false, open = true, onToggle, children }) { return <Card><CardHeader className={`pb-3 ${collapsible ? "cursor-pointer" : ""}`} onClick={collapsible ? onToggle : undefined}><CardTitle className="flex items-center gap-2 text-base">{collapsible && (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}{title}</CardTitle></CardHeader>{open && <CardContent>{children}</CardContent>}</Card>; }

// Mirrors sales_invoice_list.js's get_indicator() status_colors -- same
// tone map as SalesInvoicesPage.jsx's StatusBadge.
const STATUS_TONES = {
  Draft: "danger", Unpaid: "warning", Paid: "success", Return: "gray", "Credit Note Issued": "gray",
  "Unpaid and Discounted": "warning", "Partly Paid and Discounted": "warning", "Overdue and Discounted": "danger",
  Overdue: "danger", "Partly Paid": "warning", "Internal Transfer": "gray",
};
function StatusPill({ status }) {
  const label = status || "Draft";
  const tone = STATUS_TONES[label] || "gray";
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

export default function SalesInvoiceProfilePage() {
  const { id } = useParams(); const navigate = useNavigate(); const name = decodeURIComponent(id);
  const [invoice, setInvoice] = useState(null); const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState(null); const [loadingConnections, setLoadingConnections] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false); const [submitOpen, setSubmitOpen] = useState(false); const [cancelOpen, setCancelOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false); const [taxesOpen, setTaxesOpen] = useState(false); const [accountingOpen, setAccountingOpen] = useState(false); const [moreOpen, setMoreOpen] = useState(false);
  function load() { getSalesInvoice(name).then(setInvoice).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false)); }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [name]);
  useEffect(() => {
    setLoadingConnections(true);
    getConnections(name).then(setConnections).catch(() => setConnections({})).finally(() => setLoadingConnections(false));
  }, [name]);
  async function remove() { try { await deleteSalesInvoice(name); toast.success("Sales invoice deleted successfully"); navigate("/dashboard/sales-invoices"); } catch (err) { toast.error(getErrorMessage(err)); } }
  async function submit() { try { await submitSalesInvoice(name); toast.success("Sales invoice submitted"); setSubmitOpen(false); setLoading(true); load(); } catch (err) { toast.error(getErrorMessage(err)); } }
  async function cancel() { try { await cancelSalesInvoice(name); toast.success("Sales invoice cancelled"); setCancelOpen(false); setLoading(true); load(); } catch (err) { toast.error(getErrorMessage(err)); } }
  const [busy, setBusy] = useState(false);
  // Calls the real ERPNext-core whitelisted methods directly (same ones
  // Desk's own "Payment" / "Return / Credit Note" buttons call) so the new
  // draft actually arrives pre-filled instead of a blank form.
  async function handleMakePayment() {
    setBusy(true);
    try {
      const draft = await callMethod("erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", { dt: "Sales Invoice", dn: name });
      navigate("/dashboard/payment-entries/new", { state: { prefill: draft } });
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  }
  async function handleMakeReturn() {
    setBusy(true);
    try {
      const draft = await callMethod("erpnext.accounts.doctype.sales_invoice.sales_invoice.make_sales_return", { source_name: name });
      navigate("/dashboard/sales-invoices/new", { state: { prefill: draft } });
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!invoice) return <p className="text-muted-foreground">Sales invoice not found.</p>;
  const draft = invoice.docstatus === 0; const submitted = invoice.docstatus === 1; const cancelled = invoice.docstatus === 2;
  const incomeAccount = invoice.income_account || invoice.items?.[0]?.income_account;
  // Mirrors sales_invoice.js refresh() exactly -- Sales Invoice has no
  // on_hold field so Payment's condition is simpler than Purchase Invoice's.
  const canPay = submitted && Number(invoice.outstanding_amount) !== 0;
  const canReturn = submitted && !invoice.is_return && (Number(invoice.outstanding_amount) >= 0 || Math.abs(Number(invoice.outstanding_amount)) < Number(invoice.grand_total));

  const connectionItems = [
    { key: "payments", label: "Payment Entry", icon: Wallet, path: `/dashboard/payment-entries?reference_name=${encodeURIComponent(name)}&reference_doctype=${encodeURIComponent("Sales Invoice")}` },
    { key: "journal_entries", label: "Journal Entry", icon: FileText, path: `/dashboard/journal-entries?reference_name=${encodeURIComponent(name)}&reference_type=${encodeURIComponent("Sales Invoice")}` },
    { key: "sales_returns", label: "Return / Credit Note", icon: FileText, path: `/dashboard/sales-invoices?return_against=${encodeURIComponent(name)}` },
  ];

  return <>
    <PageHeader eyebrow="Sales Invoices" title={<span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>{invoice.customer_name || invoice.customer || invoice.name}<StatusPill status={invoice.status} /></span>} sub={invoice.name} button={<div className="flex items-center gap-2">{draft && <Button variant="outline" onClick={() => navigate(`/dashboard/sales-invoices/${encodeURIComponent(name)}/edit`)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>}{draft && <Button onClick={() => setSubmitOpen(true)}><CheckCircle2 className="mr-2 h-4 w-4" /> Submit</Button>}{(canPay || canReturn) && <DropdownMenu><DropdownMenuTrigger asChild><Button disabled={busy}>Create <ChevronDown className="ml-1 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{canPay && <DropdownMenuItem onClick={handleMakePayment}>Payment</DropdownMenuItem>}{canReturn && <DropdownMenuItem onClick={handleMakeReturn}>Return / Credit Note</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>}{submitted && <Button variant="outline" onClick={() => setCancelOpen(true)}><Ban className="mr-2 h-4 w-4" /> Cancel</Button>}{(draft || cancelled) && <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>}</div>} />
    <div className="panel mb-4"><div className="panel-head"><div className="panel-title">Connections</div></div><div className="grid-form" style={{ padding: 20, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>{connectionItems.map((item) => <ConnectionButton key={item.key} icon={item.icon} label={item.label} path={item.path} count={connections?.[item.key]} loading={loadingConnections} />)}</div></div>
    <div className="space-y-4">
      <Section title="Sales Invoice Information"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Field label="Naming Series" value={invoice.naming_series} /><Field label="Posting Date" value={fmtDate(invoice.posting_date)} /><Field label="Payment Due Date" value={fmtDate(invoice.due_date)} /><Field label="Customer" value={invoice.customer} /><Field label="Customer Name" value={invoice.customer_name} /><Field label="Company" value={invoice.company} /><Field label="Student" value={invoice.student_name || invoice.student} /><Field label="Fee Schedule" value={invoice.fee_schedule} /></div></Section>
      <Section title="Items"><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Item Name</TableHead><TableHead>Quantity</TableHead><TableHead>Rate</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody>{(invoice.items || []).map((row, i) => <TableRow key={i}><TableCell>{row.item_code}</TableCell><TableCell>{row.item_name || "—"}</TableCell><TableCell>{Number(row.qty || 0).toLocaleString()}</TableCell><TableCell>{money(row.rate)}</TableCell><TableCell>{money(row.amount)}</TableCell></TableRow>)}</TableBody></Table><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Total Quantity" value={Number(invoice.total_qty || 0).toLocaleString()} /><Field label="Net Total" value={money(invoice.net_total)} /></div></Section>
      <Section title="Discount" collapsible open={discountOpen} onToggle={() => setDiscountOpen(!discountOpen)}><div className="grid gap-4 md:grid-cols-3"><Field label="Apply Discount On" value={invoice.apply_discount_on} /><Field label="Discount Amount" value={money(invoice.discount_amount)} /><Field label="Additional Discount Percentage" value={`${Number(invoice.additional_discount_percentage || 0).toLocaleString()}%`} /></div></Section>
      <Section title="Taxes" collapsible open={taxesOpen} onToggle={() => setTaxesOpen(!taxesOpen)}><div className="mb-4 grid gap-4 md:grid-cols-2"><Field label="Sales Taxes and Charges Template" value={invoice.taxes_and_charges} /><Field label="Tax Category" value={invoice.tax_category} /></div><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Account Head</TableHead><TableHead>Rate</TableHead><TableHead>Tax Amount</TableHead></TableRow></TableHeader><TableBody>{(invoice.taxes || []).map((row, i) => <TableRow key={i}><TableCell>{row.charge_type}</TableCell><TableCell>{row.account_head}</TableCell><TableCell>{Number(row.rate || 0).toLocaleString()}</TableCell><TableCell>{money(row.tax_amount)}</TableCell></TableRow>)}</TableBody></Table><div className="mt-4"><Field label="Total Taxes and Charges" value={money(invoice.total_taxes_and_charges)} /></div></Section>
      <Section title="Totals"><div className="grid gap-4 md:grid-cols-3"><Field label="Grand Total" value={money(invoice.grand_total)} /><Field label="Rounding Adjustment" value={money(invoice.rounding_adjustment)} /><Field label="Rounded Total" value={money(invoice.rounded_total)} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Outstanding Amount" value={money(invoice.outstanding_amount)} /><Field label="In Words" value={invoice.in_words} /></div></Section>
      <Section title="Accounting" collapsible open={accountingOpen} onToggle={() => setAccountingOpen(!accountingOpen)}><div className="grid gap-4 md:grid-cols-3"><Field label="Debit To" value={invoice.debit_to} /><Field label="Income Account" value={incomeAccount} /><Field label="Cost Center" value={invoice.cost_center} /></div><div className="mt-4"><Field label="Remarks" value={invoice.remarks} /></div></Section>
      <Section title="More Information" collapsible open={moreOpen} onToggle={() => setMoreOpen(!moreOpen)}><div className="grid gap-4 md:grid-cols-2"><Field label="Is Return (Credit Note)" value={invoice.is_return ? "Yes" : "No"} />{invoice.is_return ? <Field label="Return Against" value={invoice.return_against} /> : null}<Field label="Letter Head" value={invoice.letter_head} /><Field label="Print Heading" value={invoice.select_print_heading} /></div></Section>
    </div>
    <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} title={`Delete sales invoice ${invoice.name}?`} description="This action cannot be undone." />
    <ConfirmDialog open={submitOpen} onClose={() => setSubmitOpen(false)} onConfirm={submit} title={`Submit sales invoice ${invoice.name}?`} description="Submitting creates accounting ledger entries and prevents normal editing." confirmLabel="Submit" variant="default" />
    <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={cancel} title={`Cancel sales invoice ${invoice.name}?`} description="This reverses the accounting ledger entries created on submit." confirmLabel="Cancel Document" variant="destructive" />
  </>;
}

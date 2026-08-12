import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ban, CheckCircle2, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { cancelSalesInvoice, deleteSalesInvoice, getSalesInvoice, submitSalesInvoice } from "@/services/salesInvoiceService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value ?? "—"}</p></div>; }
function money(value) { return value === null || value === undefined || value === "" ? "—" : `₦${Number(value).toLocaleString()}`; }
function Section({ title, collapsible = false, open = true, onToggle, children }) { return <Card><CardHeader className={`pb-3 ${collapsible ? "cursor-pointer" : ""}`} onClick={collapsible ? onToggle : undefined}><CardTitle className="flex items-center gap-2 text-base">{collapsible && (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}{title}</CardTitle></CardHeader>{open && <CardContent>{children}</CardContent>}</Card>; }

export default function SalesInvoiceProfilePage() {
  const { id } = useParams(); const navigate = useNavigate(); const name = decodeURIComponent(id);
  const [invoice, setInvoice] = useState(null); const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false); const [submitOpen, setSubmitOpen] = useState(false); const [cancelOpen, setCancelOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false); const [taxesOpen, setTaxesOpen] = useState(false); const [accountingOpen, setAccountingOpen] = useState(false); const [moreOpen, setMoreOpen] = useState(false);
  function load() { getSalesInvoice(name).then(setInvoice).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false)); }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [name]);
  async function remove() { try { await deleteSalesInvoice(name); toast.success("Sales invoice deleted successfully"); navigate("/dashboard/sales-invoices"); } catch (err) { toast.error(getErrorMessage(err)); } }
  async function submit() { try { await submitSalesInvoice(name); toast.success("Sales invoice submitted"); setSubmitOpen(false); setLoading(true); load(); } catch (err) { toast.error(getErrorMessage(err)); } }
  async function cancel() { try { await cancelSalesInvoice(name); toast.success("Sales invoice cancelled"); setCancelOpen(false); setLoading(true); load(); } catch (err) { toast.error(getErrorMessage(err)); } }
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!invoice) return <p className="text-muted-foreground">Sales invoice not found.</p>;
  const draft = invoice.docstatus === 0; const submitted = invoice.docstatus === 1; const cancelled = invoice.docstatus === 2;
  const incomeAccount = invoice.income_account || invoice.items?.[0]?.income_account;

  return <>
    <PageHeader eyebrow="Sales Invoices" title={invoice.name} sub={`${invoice.customer_name || invoice.customer || "No customer"} · ${invoice.status || "Draft"}`} button={<div className="flex items-center gap-2">{draft && <Button variant="outline" onClick={() => navigate(`/dashboard/sales-invoices/${encodeURIComponent(name)}/edit`)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>}{draft && <Button onClick={() => setSubmitOpen(true)}><CheckCircle2 className="mr-2 h-4 w-4" /> Submit</Button>}{submitted && <Button variant="outline" onClick={() => setCancelOpen(true)}><Ban className="mr-2 h-4 w-4" /> Cancel</Button>}{(draft || cancelled) && <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>}</div>} />
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

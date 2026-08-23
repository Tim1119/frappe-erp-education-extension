import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import Form from "../components/AccountingDocumentForm";
import { allocateReconciliation, getAccountingMeta, getAccountingNewDocumentDefaults, getUnreconciledEntries, reconcileEntries } from "@/services/accounting/documentService";
import { getErrorMessage } from "@/utils/errors";

export default function PaymentReconciliationPage() {
  const [meta, setMeta] = useState(null); const [document, setDocument] = useState({}); const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([getAccountingMeta("Payment Reconciliation"), getAccountingNewDocumentDefaults("Payment Reconciliation")])
      .then(([nextMeta, defaults]) => { setMeta(nextMeta); setDocument(defaults || {}); })
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);
  async function run(action, data) {
    const required = [["company", "Company"], ["party_type", "Party Type"], ["party", "Party"], ["receivable_payable_account", "Receivable / Payable Account"]];
    const missing = required.find(([fieldname]) => !data[fieldname]);
    if (missing) { toast.error(`${missing[1]} is required.`); return; }
    if (data.from_invoice_date && data.to_invoice_date && data.from_invoice_date > data.to_invoice_date) { toast.error("From Invoice Date cannot be after To Invoice Date."); return; }
    if (data.from_payment_date && data.to_payment_date && data.from_payment_date > data.to_payment_date) { toast.error("From Payment Date cannot be after To Payment Date."); return; }
    if (data.minimum_invoice_amount && data.maximum_invoice_amount && Number(data.minimum_invoice_amount) > Number(data.maximum_invoice_amount)) { toast.error("Minimum Invoice Amount cannot exceed Maximum Invoice Amount."); return; }
    if (data.minimum_payment_amount && data.maximum_payment_amount && Number(data.minimum_payment_amount) > Number(data.maximum_payment_amount)) { toast.error("Minimum Payment Amount cannot exceed Maximum Payment Amount."); return; }
    try {
      setBusy(true);
      const result = action === "fetch" ? await getUnreconciledEntries(data) : action === "allocate" ? await allocateReconciliation(data) : await reconcileEntries(data);
      setDocument(result || data);
      if (action === "fetch") {
        const invoices = result?.invoices || [];
        const payments = result?.payments || [];
        // Match Payment Reconciliation's Desk callback: fetched rows remain
        // visible, but an incomplete pair is reported as a warning/error
        // instead of the misleading generic success toast.
        if (!invoices.length && !payments.length) toast.error("No Unreconciled Invoices and Payments found for this party and account");
        else if (!invoices.length) toast.error("No Outstanding Invoices found for this party");
        else if (!payments.length) toast.error("No Unreconciled Payments found for this party");
        else toast.success("Unreconciled entries loaded");
      } else if (action === "allocate") toast.success("Entries allocated");
      else toast.success("Payments reconciled");
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  }
  if (!meta) return <div className="muted">Loading…</div>;
  const actions = [
    { label: "Get Unreconciled Entries", show: (doc) => Boolean(doc.receivable_payable_account), primary: (doc) => !(doc.invoices?.length && doc.payments?.length), disabled: () => busy, onClick: (doc) => run("fetch", doc) },
    { label: "Allocate", show: (doc) => Boolean(doc.invoices?.length && doc.payments?.length), primary: (doc) => !doc.allocation?.length, disabled: () => busy, onClick: (doc) => run("allocate", doc) },
    { label: "Reconcile", show: (doc) => Boolean(doc.allocation?.length), primary: () => true, disabled: () => busy, onClick: (doc) => run("reconcile", doc) },
  ];
  return <><PageHeader eyebrow="Accounting · Payables · Payments" title="Payment Reconciliation" sub="Match submitted payments against outstanding invoices" /><Form doctype="Payment Reconciliation" meta={meta} initial={document} onSave={() => {}} actions={actions} /></>;
}

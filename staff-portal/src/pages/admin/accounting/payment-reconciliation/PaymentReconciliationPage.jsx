import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import Form from "../components/AccountingDocumentForm";
import { allocateReconciliation, getAccountingMeta, getUnreconciledEntries, reconcileEntries } from "@/services/accounting/documentService";

export default function PaymentReconciliationPage() {
  const [meta, setMeta] = useState(null); const [document, setDocument] = useState({}); const [stage, setStage] = useState("fetch");
  useEffect(() => { getAccountingMeta("Payment Reconciliation").then(setMeta); }, []);
  async function run(data) {
    try {
      const result = stage === "fetch" ? await getUnreconciledEntries(data) : stage === "allocate" ? await allocateReconciliation(data) : await reconcileEntries(data);
      setDocument(result || data);
      if (stage === "fetch") { setStage("allocate"); toast.success("Unreconciled entries loaded"); }
      else if (stage === "allocate") { setStage("reconcile"); toast.success("Entries allocated"); }
      else { setStage("fetch"); toast.success("Payments reconciled"); }
    } catch (error) { toast.error(String(error)); }
  }
  if (!meta) return <div className="muted">Loading…</div>;
  const label = stage === "fetch" ? "Get Unreconciled Entries" : stage === "allocate" ? "Allocate Entries" : "Reconcile Entries";
  return <><PageHeader eyebrow="Accounting · Payables · Payments" title="Payment Reconciliation" sub="Match submitted payments against outstanding invoices" /><Form meta={meta} initial={document} onSave={run} submitLabel={label} /></>;
}

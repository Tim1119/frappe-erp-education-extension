import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import PurchaseInvoiceForm from "./components/PurchaseInvoiceForm";
import { createAccountingDocument, getAccountingDocument, getAccountingNewDocumentDefaults, updateAccountingDocument } from "@/services/accounting/documentService";
import { getErrorMessage } from "@/utils/errors";
import PrefillSourceBanner from "@/components/shared/PrefillSourceBanner";
import { cleanNewDocumentPrefill } from "@/utils/prefill";

export default function PurchaseInvoiceFormPage() {
  const { id } = useParams(); const edit = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const navigate = useNavigate(); const location = useLocation();
  const [doc, setDoc] = useState(null);
  // "Return / Debit Note" on the profile page hands us a fully mapped
  // draft (real make_debit_note()) via router state instead of a blank
  // new-record default -- see AccountingDocumentFormPage.jsx for the same
  // pattern used by Payment Entry's "Payment" action.
  const prefill = location.state?.prefill;

  useEffect(() => {
    if (edit) getAccountingDocument("Purchase Invoice", name).then(setDoc);
    else if (prefill) setDoc(cleanNewDocumentPrefill(prefill));
    else getAccountingNewDocumentDefaults("Purchase Invoice").then(setDoc).catch(() => setDoc({}));
  }, [edit, name]);

  async function save(data) {
    try {
      const result = edit
        ? await updateAccountingDocument("Purchase Invoice", name, data)
        : await createAccountingDocument("Purchase Invoice", data);
      toast.success(`Purchase Invoice ${edit ? "updated" : "created"}`);
      navigate(`/dashboard/purchase-invoices/${encodeURIComponent(result.name || name)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (!doc) return <div className="muted">Loading…</div>;
  return (
    <>
      <PageHeader eyebrow="Accounting · Payables · Invoicing" title={`${edit ? "Edit" : "Create"} Purchase Invoice`} />
      {!edit && <PrefillSourceBanner prefill={prefill} />}
      <PurchaseInvoiceForm initial={doc} onSave={save} submitLabel={edit ? "Update" : "Create"} />
    </>
  );
}

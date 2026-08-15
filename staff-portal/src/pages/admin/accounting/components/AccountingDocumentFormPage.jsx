import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import Form from "./AccountingDocumentForm";
import { createAccountingDocument, getAccountingDocument, getAccountingMeta, getAccountingNewDocumentDefaults, updateAccountingDocument } from "@/services/accounting/documentService";

const GROUP = { Customer: "Receivables" };

export default function AccountingDocumentFormPage({ doctype, base }) {
  const { id } = useParams(); const edit = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const navigate = useNavigate(); const location = useLocation(); const [meta, setMeta] = useState(null); const [doc, setDoc] = useState(null);
  // A profile page "Create" action (e.g. Payment against a Purchase
  // Invoice) can hand this page a fully mapped draft doc via router state
  // instead of the usual blank-new-record defaults -- mirrors real Desk's
  // open_mapped_doc, which is how these buttons produce a pre-filled draft
  // instead of an empty form the user would have to fill in by hand.
  const prefill = location.state?.prefill;
  useEffect(() => {
    getAccountingMeta(doctype).then(setMeta);
    if (edit) getAccountingDocument(doctype, name).then(setDoc);
    else if (prefill) setDoc(prefill);
    else getAccountingNewDocumentDefaults(doctype).then(setDoc).catch(() => setDoc({}));
  }, [doctype, edit, name]);
  async function save(data) { try { const result = edit ? await updateAccountingDocument(doctype, name, data) : await createAccountingDocument(doctype, data); toast.success(`${doctype} ${edit ? "updated" : "created"}`); navigate(`/dashboard/${base}/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(String(error)); } }
  if (!meta || !doc) return <div className="muted">Loading…</div>;
  return <><PageHeader eyebrow={`Accounting · ${GROUP[doctype] || "Payables"} · ${["Payment Entry", "Journal Entry"].includes(doctype) ? "Payments" : "Invoicing"}`} title={`${edit ? "Edit" : "Create"} ${doctype}`} /><Form doctype={doctype} meta={meta} initial={doc} onSave={save} /></>;
}

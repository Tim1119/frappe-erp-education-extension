import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import Form from "./AccountingDocumentForm";
import { createAccountingDocument, getAccountingDocument, getAccountingMeta, updateAccountingDocument } from "@/services/accounting/documentService";

export default function AccountingDocumentFormPage({ doctype, base }) {
  const { id } = useParams(); const edit = Boolean(id); const name = id ? decodeURIComponent(id) : ""; const navigate = useNavigate(); const [meta, setMeta] = useState(null); const [doc, setDoc] = useState(null);
  useEffect(() => { getAccountingMeta(doctype).then(setMeta); if (edit) getAccountingDocument(doctype, name).then(setDoc); }, [doctype, edit, name]);
  async function save(data) { try { const result = edit ? await updateAccountingDocument(doctype, name, data) : await createAccountingDocument(doctype, data); toast.success(`${doctype} ${edit ? "updated" : "created"}`); navigate(`/dashboard/${base}/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(String(error)); } }
  if (!meta || (edit && !doc)) return <div className="muted">Loading…</div>;
  return <><PageHeader eyebrow={`Accounting · Payables · ${["Payment Entry", "Journal Entry"].includes(doctype) ? "Payments" : "Invoicing"}`} title={`${edit ? "Edit" : "Create"} ${doctype}`} /><Form meta={meta} initial={doc || {}} onSave={save} /></>;
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import Form from "./AccountingDocumentForm";
import { createAccountingDocument, getAccountingDocument, getAccountingMeta, getAccountingNewDocumentDefaults, updateAccountingDocument } from "@/services/accounting/documentService";
import PrefillSourceBanner from "@/components/shared/PrefillSourceBanner";
import { cleanNewDocumentPrefill } from "@/utils/prefill";

const GROUP = { Customer: "Receivables", Dunning: "Receivables", "Dunning Type": "Receivables" };
const SECTION = { "Payment Entry": "Payments", "Journal Entry": "Payments", Dunning: "Dunning", "Dunning Type": "Dunning" };
const HR_DOCTYPES = new Set(["Expense Claim Type", "Purpose of Travel", "Additional Salary", "Vehicle", "Driver", "Vehicle Service Item", "Vehicle Log"]);

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
    else if (prefill) setDoc(cleanNewDocumentPrefill(prefill));
    else getAccountingNewDocumentDefaults(doctype).then(setDoc).catch(() => setDoc({}));
  }, [doctype, edit, name]);
  async function save(data) { try { const result = edit ? await updateAccountingDocument(doctype, name, data) : await createAccountingDocument(doctype, data); toast.success(`${doctype} ${edit ? "updated" : "created"}`); navigate(`/dashboard/${base}/${encodeURIComponent(result.name || name)}`); } catch (error) { toast.error(String(error)); } }
  if (!meta || !doc) return <div className="muted">Loading…</div>;
  const eyebrow = HR_DOCTYPES.has(doctype) ? "HR · Expense Claims" : `Accounting · ${GROUP[doctype] || "Payables"} · ${SECTION[doctype] || "Invoicing"}`;
  return <><PageHeader eyebrow={eyebrow} title={`${edit ? "Edit" : "Create"} ${doctype}`} />{!edit && <PrefillSourceBanner prefill={prefill} />}<Form doctype={doctype} meta={meta} initial={doc} onSave={save} /></>;
}

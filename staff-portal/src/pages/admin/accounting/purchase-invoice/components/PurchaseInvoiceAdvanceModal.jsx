import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getAccountingLinkOptions } from "@/services/accounting/documentService";

function Field({ label, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const REFERENCE_TYPES = ["Payment Entry", "Journal Entry"];
const EMPTY = { reference_type: "Payment Entry", reference_name: "", advance_amount: "", allocated_amount: "" };

// Real Desk fills this table via the "Get Advances Paid" button, which
// runs a whitelisted server search for unclaimed advance payments against
// this supplier. That search isn't replicated here -- instead the user
// picks a submitted Payment Entry / Journal Entry directly and enters the
// amounts manually, same real child-table shape either way.
export default function PurchaseInvoiceAdvanceModal({ open, onClose, onSave, row, supplier }) {
  const [local, setLocal] = useState(EMPTY);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setLocal(row ? { ...row } : { ...EMPTY }); setError(""); }
  }, [open, row]);

  useEffect(() => {
    if (!open) return;
    getAccountingLinkOptions(local.reference_type, { fieldname: "advance_reference", party: supplier }).then(setOptions).catch(() => setOptions([]));
  }, [open, local.reference_type, supplier]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  function handleSave() {
    if (!local.reference_name) return setError(`${local.reference_type} is required.`);
    if (!(Number(local.advance_amount) > 0)) return setError("Advance Amount is required.");
    onSave(local);
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Advance" : "Add Advance"} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Reference Type *"><select className="input" value={local.reference_type || ""} onChange={(e) => setLocal((x) => ({ ...x, reference_type: e.target.value, reference_name: "" }))}>{REFERENCE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label={`${local.reference_type} *`}><SearchableSelect value={local.reference_name || ""} onChange={(v) => set("reference_name", v)} options={options} disabled={!supplier} placeholder={supplier ? `Search ${local.reference_type.toLowerCase()}...` : "Select a supplier first"} /></Field>
        <Field label="Advance Amount *"><input className="input" type="number" value={local.advance_amount ?? ""} onChange={(e) => set("advance_amount", e.target.value)} /></Field>
        <Field label="Allocated Amount"><input className="input" type="number" value={local.allocated_amount ?? ""} onChange={(e) => set("allocated_amount", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

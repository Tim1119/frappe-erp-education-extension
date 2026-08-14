import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

function Field({ label, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const DISCOUNT_TYPES = ["", "Percentage", "Amount"];
const EMPTY = { due_date: "", invoice_portion: "", payment_amount: "", discount_type: "", discount: "", discount_date: "" };

export default function PurchaseInvoicePaymentScheduleModal({ open, onClose, onSave, row }) {
  const [local, setLocal] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setLocal(row ? { ...row } : { ...EMPTY }); setError(""); }
  }, [open, row]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  function handleSave() {
    if (!local.due_date) return setError("Due Date is required.");
    if (!(Number(local.payment_amount) > 0)) return setError("Payment Amount is required.");
    onSave(local);
  }

  return (
    <Modal open={open} onClose={onClose} title={row ? "Edit Payment Term" : "Add Payment Term"} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="default" onClick={handleSave}>Save</Button></>}>
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Due Date *"><input className="input" type="date" value={local.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></Field>
        <Field label="Invoice Portion (%)"><input className="input" type="number" value={local.invoice_portion ?? ""} onChange={(e) => set("invoice_portion", e.target.value)} /></Field>
        <Field label="Payment Amount *"><input className="input" type="number" value={local.payment_amount ?? ""} onChange={(e) => set("payment_amount", e.target.value)} /></Field>
        <Field label="Discount Type"><select className="input" value={local.discount_type || ""} onChange={(e) => set("discount_type", e.target.value)}>{DISCOUNT_TYPES.map((t) => <option key={t} value={t}>{t || "None"}</option>)}</select></Field>
        <Field label="Discount"><input className="input" type="number" value={local.discount ?? ""} onChange={(e) => set("discount", e.target.value)} /></Field>
        <Field label="Discount Date"><input className="input" type="date" value={local.discount_date || ""} onChange={(e) => set("discount_date", e.target.value)} /></Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/shared/SearchableSelect";

function Field({ label, children, full }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Read({ value }) {
  return (
    <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </div>
  );
}

const EMPTY = { employee_advance: "", posting_date: "", advance_account: "", advance_paid: "", unclaimed_amount: "", return_amount: "", allocated_amount: "" };

// Mirrors expense_claim.py's get_allocation_amount(): paid - (claimed + return).
function allocationAmount(advance) {
  return Number(advance?.paid_amount || 0) - Number(advance?.claimed_amount || 0) - Number(advance?.return_amount || 0);
}

export default function AdvanceRowModal({ open, onClose, onSave, row, advanceOptions, hasEmployee }) {
  const [local, setLocal] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLocal(row ? { ...row } : { ...EMPTY });
      setError("");
    }
  }, [open, row]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  function onEmployeeAdvanceChange(v) {
    const a = advanceOptions.find((x) => x.name === v);
    setLocal((x) => ({
      ...x,
      employee_advance: v,
      posting_date: a?.posting_date,
      advance_account: a?.advance_account,
      advance_paid: a?.paid_amount,
      return_amount: a?.return_amount,
      // Real Desk: unclaimed_amount = paid_amount - claimed_amount (return
      // is tracked separately, not double-subtracted here).
      unclaimed_amount: Number(a?.paid_amount || 0) - Number(a?.claimed_amount || 0),
      allocated_amount: allocationAmount(a),
    }));
  }

  function handleSave() {
    if (!local.employee_advance) return setError("Employee Advance is required.");
    // Mirrors expense_claim.py's validate_advances(): allocated_amount
    // cannot exceed unclaimed_amount - return_amount.
    const cap = Number(local.unclaimed_amount || 0) - Number(local.return_amount || 0);
    if (local.allocated_amount && Number(local.allocated_amount) > cap) {
      return setError(`Allocated amount cannot be greater than unclaimed amount (${cap}).`);
    }
    onSave(local);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={row ? "Edit Advance" : "Add Advance"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Employee Advance *" full>
          <SearchableSelect
            value={local.employee_advance || ""}
            onChange={onEmployeeAdvanceChange}
            options={advanceOptions}
            disabled={!hasEmployee}
            placeholder={hasEmployee ? "Search advance..." : "Select an employee first"}
          />
        </Field>
        <Field label="Posting Date"><Read value={local.posting_date} /></Field>
        <Field label="Advance Paid"><Read value={local.advance_paid} /></Field>
        <Field label="Unclaimed Amount"><Read value={local.unclaimed_amount} /></Field>
        <Field label="Returned Amount"><Read value={local.return_amount} /></Field>
        <Field label="Allocated Amount">
          <input className="input" type="number" value={local.allocated_amount ?? ""} onChange={(e) => set("allocated_amount", e.target.value)} />
        </Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

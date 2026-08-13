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

const EMPTY = { account_head: "", description: "", rate: "", tax_amount: "", total: "", cost_center: "", project: "" };

export default function TaxRowModal({ open, onClose, onSave, row, taxAccounts, centers, projects, totalSanctionedAmount = 0 }) {
  const [local, setLocal] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLocal(row ? { ...row } : { ...EMPTY });
      setError("");
    }
  }, [open, row]);

  // Real Desk (calculate_total_tax): total = total_sanctioned_amount +
  // tax_amount, recomputed live off the parent's Expenses total.
  useEffect(() => {
    setLocal((x) => ({ ...x, total: (Number(totalSanctionedAmount) + Number(x.tax_amount || 0)).toFixed(2) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSanctionedAmount, local.tax_amount]);

  const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));

  // Real Desk: account_head -> description = account_head split on " - "
  // with the trailing (company abbreviation) segment dropped, only when
  // description is still empty.
  function onAccountHeadChange(v) {
    setLocal((x) => {
      const next = { ...x, account_head: v };
      if (v && !x.description) next.description = v.split(" - ").slice(0, -1).join(" - ");
      return next;
    });
  }

  // Real Desk (rate trigger): tax_amount is always recomputed from the
  // parent's total_sanctioned_amount when Rate changes.
  function onRateChange(v) {
    setLocal((x) => ({ ...x, rate: v, tax_amount: v ? ((Number(totalSanctionedAmount) * Number(v)) / 100).toFixed(2) : x.tax_amount }));
  }

  function handleSave() {
    if (!local.account_head) return setError("Account Head is required.");
    if (!local.description) return setError("Description is required.");
    onSave(local);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={row ? "Edit Tax" : "Add Tax"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="grid-form" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Account Head *" full>
          <SearchableSelect value={local.account_head || ""} onChange={onAccountHeadChange} options={taxAccounts} />
        </Field>
        <Field label="Rate">
          <input className="input" type="number" value={local.rate ?? ""} onChange={(e) => onRateChange(e.target.value)} />
        </Field>
        <Field label="Amount">
          <input className="input" type="number" value={local.tax_amount ?? ""} onChange={(e) => set("tax_amount", e.target.value)} />
        </Field>
        <Field label="Total"><Read value={local.total} /></Field>
        <Field label="Cost Center">
          <SearchableSelect value={local.cost_center || ""} onChange={(v) => set("cost_center", v)} options={centers} />
        </Field>
        <Field label="Project">
          <SearchableSelect value={local.project || ""} onChange={(v) => set("project", v)} options={projects} />
        </Field>
        <Field label="Description *" full>
          <textarea className="input" value={local.description || ""} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
      {error && <div className="text-sm text-destructive" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import ExpenseRowModal from "./ExpenseRowModal";
import TaxRowModal from "./TaxRowModal";
import AdvanceRowModal from "./AdvanceRowModal";
import {
  getExpenseAccountAndCostCenter,
  getExpenseClaimAccounts,
  getExpenseClaimAdvances,
  getExpenseClaimApprovers,
  getExpenseClaimCostCenters,
  getExpenseClaimCompanyDefaults,
  getExpenseClaimDepartments,
  getExpenseClaimEmployees,
  getExpenseClaimOptions,
  getExpenseClaimTasks,
} from "@/services/hr/expenseClaimService";

const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, children, full, required = false }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</label>
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

// Mirrors the real doctype JSON's collapsible section breaks -- e.g.
// advance_payments_sb / taxes_and_charges_sb are both `"collapsible": 1`
// with `collapsible_depends_on` tied to whether the table already has
// rows, so a claim with existing advances/taxes opens expanded and an
// empty one starts collapsed.
function CollapsibleSection({ title, open, onToggle, action, children }) {
  return (
    <>
      <div className="panel-head">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          onClick={onToggle}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </div>
        {open ? action : null}
      </div>
      {open && children}
    </>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button type="button" className="btn btn-ghost" onClick={onEdit}><Pencil size={15} /></button>
      <button type="button" className="btn btn-ghost" onClick={onDelete}><Trash2 size={15} /></button>
    </div>
  );
}

export default function ExpenseClaimForm({ doc, onSave }) {
  const [f, setF] = useState({
    naming_series: "HR-EXP-.YYYY.-", employee: "", employee_name: "", department: "",
    expense_approver: "", approval_status: "Draft", is_paid: 0, posting_date: today(),
    vehicle_log: "", project: "", task: "", remark: "", company: "", mode_of_payment: "",
    clearance_date: "", payable_account: "", cost_center: "", delivery_trip: "",
    expenses: [], advances: [], taxes: [],
  });

  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [centers, setCenters] = useState([]);
  const [payables, setPayables] = useState([]);
  const [taxAccounts, setTaxAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modes, setModes] = useState([]);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [deliveryTrips, setDeliveryTrips] = useState([]);
  const [advanceOptions, setAdvanceOptions] = useState([]);
  const [advancesOpen, setAdvancesOpen] = useState(false);
  const [taxesOpen, setTaxesOpen] = useState(false);

  // Child-table modal state: null = closed, -1 = adding a new row, N = editing row index N.
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingTax, setEditingTax] = useState(null);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { table, index, label }
  const [quickCreate, setQuickCreate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getExpenseClaimEmployees(),
      getExpenseClaimOptions("Expense Claim Type"),
      getExpenseClaimOptions("Project"),
      getExpenseClaimOptions("Mode of Payment"),
      getExpenseClaimOptions("Vehicle Log"),
      getExpenseClaimOptions("Delivery Trip"),
    ]).then(([a, b, c, d, e, g]) => {
      setEmployees(a || []);
      setTypes(b || []);
      setProjects(c || []);
      setModes(d || []);
      setVehicleLogs(e || []);
      setDeliveryTrips(g || []);
    });
  }, []);

  useEffect(() => {
    if (doc) {
      setF((x) => ({ ...x, ...doc, expenses: doc.expenses || [], advances: doc.advances || [], taxes: doc.taxes || [] }));
      setAdvancesOpen((doc.advances || []).length > 0);
      setTaxesOpen((doc.taxes || []).length > 0);
    }
  }, [doc]);

  // Real Desk: frm.set_query("department", { filters: { company } }) --
  // only shows Departments belonging to the same Company as the claim.
  useEffect(() => {
    if (f.company) {
      getExpenseClaimDepartments(f.company).then((r) => setDepartments(r || []));
    } else {
      setDepartments([]);
    }
  }, [f.company]);

  useEffect(() => {
    if (f.company) {
      Promise.all([
        getExpenseClaimCostCenters(f.company),
        getExpenseClaimAccounts(f.company, "payable"),
        getExpenseClaimAccounts(f.company, "tax"),
      ]).then(([a, b, c]) => {
        setCenters(a || []);
        setPayables(b || []);
        setTaxAccounts(c || []);
      });
    } else {
      setCenters([]);
      setPayables([]);
      setTaxAccounts([]);
    }
  }, [f.company]);

  useEffect(() => {
    if (f.employee) {
      getExpenseClaimApprovers(f.employee).then(setApprovers);
      getExpenseClaimAdvances(f.employee, f.company).then(setAdvanceOptions);
    } else {
      setApprovers([]);
      setAdvanceOptions([]);
    }
  }, [f.employee, f.company]);

  // Real Desk: frm.set_query("task", { filters: { project } }) -- no
  // options at all until a Project is chosen (no unfiltered fallback).
  useEffect(() => {
    if (f.project) {
      getExpenseClaimTasks(f.project).then((rows) => setTasks(rows || []));
    } else {
      setTasks([]);
    }
  }, [f.project]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  function emp(v) {
    const e = employees.find((x) => x.name === v);
    setF((x) => ({
      ...x,
      employee: v,
      employee_name: e?.employee_name || "",
      department: e?.department || "",
      company: e?.company || "",
      expense_approver: "",
      payable_account: "",
      cost_center: "",
    }));

    // Real Desk: company: function(frm) re-derives default_account/
    // cost_center for every expense row that already has an expense_type
    // set, since a company change means the old lookup is stale.
    if (e?.company) {
      getExpenseClaimCompanyDefaults(e.company).then((defaults) => {
        setF((x) => x.employee === v ? {
          ...x,
          payable_account: defaults?.payable_account || x.payable_account,
          cost_center: defaults?.cost_center || x.cost_center,
        } : x);
      }).catch(() => {});
      f.expenses.forEach((row, i) => {
        if (!row.expense_type) return;
        getExpenseAccountAndCostCenter(row.expense_type, e.company).then((res) => {
          if (!res?.account && !res?.cost_center) return;
          setF((x) => ({
            ...x,
            expenses: x.expenses.map((r, n) => (n === i ? { ...r, default_account: res.account ?? r.default_account, cost_center: res.cost_center ?? r.cost_center } : r)),
          }));
        }).catch(() => {});
      });
    }
  }

  // Real Desk: erpnext.utils.copy_value_in_all_rows -- setting a row's Cost
  // Center on the Expenses table copies that same value onto every other
  // expense row too, not just the one being edited.
  function saveRowInto(table, editingIndex, data) {
    setF((x) => {
      let rows = [...x[table]];
      if (editingIndex === -1) rows.push(data);
      else rows[editingIndex] = data;
      if (table === "expenses" && data.cost_center) {
        rows = rows.map((r) => ({ ...r, cost_center: data.cost_center }));
      }
      return { ...x, [table]: rows };
    });
  }

  function confirmDeleteRow() {
    const { table, index } = deleteTarget;
    setF((x) => ({ ...x, [table]: x[table].filter((_, n) => n !== index) }));
    setDeleteTarget(null);
  }

  // Live preview only -- calculate_total_amount()/calculate_taxes()/
  // validate_advances() in expense_claim.py always authoritatively
  // recompute these exact totals server-side on every save, so this exists
  // purely so the user sees numbers update as they add/edit rows, not as
  // the source of truth that gets submitted.
  const totals = useMemo(() => {
    const totalClaimed = f.expenses.reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalSanctioned = f.expenses.reduce((s, r) => s + Number(r.sanctioned_amount || 0), 0);
    const totalTaxes = f.taxes.reduce((s, r) => s + Number(r.tax_amount || 0), 0);
    const totalAdvance = f.advances.reduce((s, r) => s + Number(r.allocated_amount || 0), 0);
    const grandTotal = totalSanctioned + totalTaxes - totalAdvance;
    return { totalClaimed, totalSanctioned, totalTaxes, totalAdvance, grandTotal };
  }, [f.expenses, f.taxes, f.advances]);

  function submit(event) {
    event.preventDefault();
    if (!f.naming_series) return setError("Series is required.");
    if (!f.posting_date) return setError("Posting Date is required.");
    if (!f.employee) return setError("From Employee is required.");
    if (!f.company) return setError("Company is required.");
    if (!f.expenses.length) return setError("At least one Expense row is required.");
    if (!Number(f.is_paid) && !f.payable_account) return setError("Payable Account is required when the claim is not marked as paid.");
    if (Number(f.is_paid) && !f.mode_of_payment) return setError("Mode of Payment is required when Is Paid is enabled.");
    setError("");
    onSave(f);
  }

  return (
    <form onSubmit={submit}>
      <div className="panel-head"><div className="panel-title">Expense Claim Information</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <Field label="Series" required>
          <select className="input" value={f.naming_series} onChange={(e) => set("naming_series", e.target.value)}>
            <option>HR-EXP-.YYYY.-</option>
          </select>
        </Field>
        <Field label="Posting Date" required>
          <input className="input" type="date" value={f.posting_date} onChange={(e) => set("posting_date", e.target.value)} />
        </Field>
        <Field label="From Employee" required>
          <SearchableSelect value={f.employee} onChange={emp} options={employees} displayField="employee_name" showId linkedDoctype={null} />
        </Field>
        <Field label="Employee Name"><Read value={f.employee_name} /></Field>
        <Field label="Department">
          <SearchableSelect
            value={f.department || ""}
            onChange={(v) => set("department", v)}
            options={departments}
            disabled={!f.company}
            placeholder={f.company ? "Search department..." : "Select an employee first"}
            onCreate={f.company ? () => setQuickCreate({ doctype: "Department", apply: (v) => set("department", v) }) : undefined}
            createLabel="Create new Department"
          />
        </Field>
        <Field label="Company" required><Read value={f.company} /></Field>
        <Field label="Expense Approver">
          <SearchableSelect
            value={f.expense_approver || ""}
            onChange={(v) => set("expense_approver", v)}
            options={approvers}
            displayField="full_name"
            disabled={!f.employee}
            placeholder={f.employee ? "Search approver..." : "Select an employee first"}
            linkedDoctype={null}
          />
        </Field>
        <Field label="Approval Status">
          <select className="input" value={f.approval_status} onChange={(e) => set("approval_status", e.target.value)}>
            {["Draft", "Approved", "Rejected"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Is Paid">
          <input type="checkbox" checked={!!Number(f.is_paid)} onChange={(e) => set("is_paid", e.target.checked ? 1 : 0)} />
        </Field>
      </div>

      <div className="panel-head">
        <div className="panel-title">Expenses <span className="text-destructive">*</span></div>
        <button type="button" className="btn btn-secondary" onClick={() => setEditingExpense(-1)}>
          <Plus size={14} />Add Row
        </button>
      </div>
      <div style={{ padding: 20, overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th><th>Expense Date</th><th>Expense Type</th><th>Amount</th><th>Sanctioned</th><th />
            </tr>
          </thead>
          <tbody>
            {f.expenses.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.expense_date || "—"}</td>
                <td>{r.expense_type || "—"}</td>
                <td>{r.amount ?? "—"}</td>
                <td>{r.sanctioned_amount ?? "—"}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <RowActions
                    onEdit={() => setEditingExpense(i)}
                    onDelete={() => setDeleteTarget({ table: "expenses", index: i, label: r.expense_type || `Row ${i + 1}` })}
                  />
                </td>
              </tr>
            ))}
            {!f.expenses.length && (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No expenses added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CollapsibleSection
        title="Advance Payments"
        open={advancesOpen}
        onToggle={() => setAdvancesOpen((o) => !o)}
        action={
          <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setAdvancesOpen(true); setEditingAdvance(-1); }}>
            <Plus size={14} />Add Row
          </button>
        }
      >
        <div style={{ padding: 20, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th><th>Employee Advance</th><th>Posting Date</th><th>Advance Paid</th>
                <th>Unclaimed</th><th>Allocated</th><th />
              </tr>
            </thead>
            <tbody>
              {f.advances.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.employee_advance || "—"}</td>
                  <td>{r.posting_date || "—"}</td>
                  <td>{r.advance_paid ?? "—"}</td>
                  <td>{r.unclaimed_amount ?? "—"}</td>
                  <td>{r.allocated_amount ?? "—"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      onEdit={() => setEditingAdvance(i)}
                      onDelete={() => setDeleteTarget({ table: "advances", index: i, label: r.employee_advance || `Row ${i + 1}` })}
                    />
                  </td>
                </tr>
              ))}
              {!f.advances.length && (
                <tr><td colSpan={7} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No advances added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Taxes & Charges"
        open={taxesOpen}
        onToggle={() => setTaxesOpen((o) => !o)}
        action={
          <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setTaxesOpen(true); setEditingTax(-1); }}>
            <Plus size={14} />Add Row
          </button>
        }
      >
        <div style={{ padding: 20, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th><th>Account Head</th><th>Rate</th><th>Amount</th><th>Total</th><th />
              </tr>
            </thead>
            <tbody>
              {f.taxes.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.account_head || "—"}</td>
                  <td>{r.rate ?? "—"}</td>
                  <td>{r.tax_amount ?? "—"}</td>
                  <td>{(totals.totalSanctioned + Number(r.tax_amount || 0)).toFixed(2)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      onEdit={() => setEditingTax(i)}
                      onDelete={() => setDeleteTarget({ table: "taxes", index: i, label: r.account_head || `Row ${i + 1}` })}
                    />
                  </td>
                </tr>
              ))}
              {!f.taxes.length && (
                <tr><td colSpan={6} className="text-center text-sm text-muted-foreground" style={{ padding: 16 }}>No taxes or charges added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <div className="panel-head"><div className="panel-title">Accounting Details</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <Field label="Project">
          <SearchableSelect value={f.project || ""} onChange={(v) => { set("project", v); set("task", ""); }} options={projects} onCreate={() => setQuickCreate({ doctype: "Project", apply: (v) => { set("project", v); set("task", ""); } })} createLabel="Create new Project" />
        </Field>
        <Field label="Task">
          <SearchableSelect value={f.task || ""} onChange={(v) => set("task", v)} options={tasks} disabled={!f.project} placeholder={f.project ? "Search task..." : "Select a project first"} onCreate={f.project ? () => setQuickCreate({ doctype: "Task", apply: (v) => set("task", v), defaults: { project: f.project } }) : undefined} createLabel="Create new Task" />
        </Field>
        <Field label="Payable Account" required={!Number(f.is_paid)}>
          <SearchableSelect value={f.payable_account || ""} onChange={(v) => set("payable_account", v)} options={payables} disabled={!f.company} placeholder={f.company ? "Search account..." : "Select an employee first"} linkedDoctype={null} />
        </Field>
        <Field label="Cost Center">
          <SearchableSelect value={f.cost_center || ""} onChange={(v) => set("cost_center", v)} options={centers} disabled={!f.company} placeholder={f.company ? "Search cost center..." : "Select an employee first"} onCreate={f.company ? () => setQuickCreate({ doctype: "Cost Center", apply: (v) => set("cost_center", v) }) : undefined} createLabel="Create new Cost Center" />
        </Field>
        {Number(f.is_paid) ? (
          <>
            <Field label="Mode of Payment" required>
              <SearchableSelect value={f.mode_of_payment || ""} onChange={(v) => set("mode_of_payment", v)} options={modes} onCreate={() => setQuickCreate({ doctype: "Mode of Payment", apply: (v) => set("mode_of_payment", v) })} createLabel="Create new Mode of Payment" />
            </Field>
            <Field label="Clearance Date">
              <input className="input" type="date" value={f.clearance_date || ""} onChange={(e) => set("clearance_date", e.target.value)} />
            </Field>
          </>
        ) : null}
        <Field label="Vehicle Log">
          <SearchableSelect value={f.vehicle_log || ""} onChange={(v) => set("vehicle_log", v)} options={vehicleLogs} onCreate={() => setQuickCreate({ doctype: "Vehicle Log", apply: (v) => set("vehicle_log", v) })} createLabel="Create new Vehicle Log" />
        </Field>
        <Field label="Delivery Trip">
          <SearchableSelect value={f.delivery_trip || ""} onChange={(v) => set("delivery_trip", v)} options={deliveryTrips} onCreate={() => setQuickCreate({ doctype: "Delivery Trip", apply: (v) => set("delivery_trip", v) })} createLabel="Create new Delivery Trip" />
        </Field>
        <Field label="Remark" full>
          <textarea className="input" value={f.remark || ""} onChange={(e) => set("remark", e.target.value)} />
        </Field>
      </div>

      <div className="panel-head"><div className="panel-title">Totals</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        {[
          ["Total Claimed Amount", totals.totalClaimed.toFixed(2)],
          ["Total Sanctioned Amount", totals.totalSanctioned.toFixed(2)],
          ["Total Taxes and Charges", totals.totalTaxes.toFixed(2)],
          ["Total Advance Amount", totals.totalAdvance.toFixed(2)],
          ["Grand Total", totals.grandTotal.toFixed(2)],
        ].map(([l, v]) => <Field key={l} label={l}><Read value={v} /></Field>)}
        {doc && (
          <>
            <Field label="Total Amount Reimbursed"><Read value={f.total_amount_reimbursed} /></Field>
            <Field label="Status"><Read value={f.status} /></Field>
            <Field label="Amended From"><Read value={f.amended_from} /></Field>
          </>
        )}
      </div>

      <div className="p-5 text-right">
        {error ? <div className="mb-3 text-sm text-destructive">{error}</div> : null}
        <button className="btn btn-primary">{doc ? "Update" : "Create"} Expense Claim</button>
      </div>

      <ExpenseRowModal
        open={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        onSave={(data) => { saveRowInto("expenses", editingExpense, data); setEditingExpense(null); }}
        row={editingExpense !== null && editingExpense !== -1 ? f.expenses[editingExpense] : null}
        types={types}
        centers={centers}
        projects={projects}
        company={f.company}
        defaultCostCenter={f.cost_center}
      />
      <TaxRowModal
        open={editingTax !== null}
        onClose={() => setEditingTax(null)}
        onSave={(data) => { saveRowInto("taxes", editingTax, data); setEditingTax(null); }}
        row={editingTax !== null && editingTax !== -1 ? f.taxes[editingTax] : null}
        taxAccounts={taxAccounts}
        centers={centers}
        projects={projects}
        totalSanctionedAmount={totals.totalSanctioned}
      />
      <AdvanceRowModal
        open={editingAdvance !== null}
        onClose={() => setEditingAdvance(null)}
        onSave={(data) => { saveRowInto("advances", editingAdvance, data); setEditingAdvance(null); }}
        row={editingAdvance !== null && editingAdvance !== -1 ? f.advances[editingAdvance] : null}
        advanceOptions={advanceOptions}
        hasEmployee={!!f.employee}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteRow}
        title={`Delete "${deleteTarget?.label}"?`}
        description="This row will be removed from the claim. This action cannot be undone."
        confirmLabel="Delete"
      />
      <QuickCreateModal open={Boolean(quickCreate)} onClose={() => setQuickCreate(null)} doctype={quickCreate?.doctype} defaults={{ ...(f.company ? { company: f.company } : {}), ...(quickCreate?.defaults || {}) }} onCreated={(name) => { quickCreate?.apply(name); setQuickCreate(null); }} />
    </form>
  );
}

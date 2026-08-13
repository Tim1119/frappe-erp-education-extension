import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getEmployeeAdvanceAccounts,
  getEmployeeAdvanceCompanyCurrency,
  getEmployeeAdvanceDefaultAccount,
  getEmployeeAdvanceEmployeeCurrency,
  getEmployeeAdvanceEmployees,
  getEmployeeAdvanceExchangeRate,
  getEmployeeAdvanceOptions,
} from "@/services/hr/employeeAdvanceService";

const today = () => new Date().toISOString().slice(0, 10);

function F({ l, c }) {
  return (
    <div className="field">
      <label className="label">{l}</label>
      {c}
    </div>
  );
}

function R({ v }) {
  return (
    <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
      {v === null || v === undefined || v === "" ? "—" : v}
    </div>
  );
}

// Mirrors the real doctype JSON's collapsible section breaks --
// currency_section and more_info_section are both `"collapsible": 1`.
function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <>
      <div
        className="panel-head"
        style={{ cursor: "pointer" }}
        onClick={onToggle}
      >
        <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </div>
      </div>
      {open && <div className="grid-form" style={{ padding: 20 }}>{children}</div>}
    </>
  );
}

export default function EmployeeAdvanceForm({ doc, onSave }) {
  const [f, setF] = useState({
    naming_series: "HR-EAD-.YYYY.-", employee: "", employee_name: "", posting_date: today(),
    department: "", purpose: "", advance_amount: "", company: "", advance_account: "",
    mode_of_payment: "", repay_unclaimed_amount_from_salary: 0, currency: "", exchange_rate: 1,
  });
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [modes, setModes] = useState([]);
  const [companyCurrency, setCompanyCurrency] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [accountWarning, setAccountWarning] = useState("");

  useEffect(() => {
    Promise.all([
      getEmployeeAdvanceEmployees(),
      getEmployeeAdvanceOptions("Currency"),
      getEmployeeAdvanceOptions("Mode of Payment"),
    ]).then(([a, b, c]) => {
      setEmployees(a);
      setCurrencies(b);
      setModes(c);
    });
  }, []);

  useEffect(() => {
    if (doc) {
      setF((x) => ({ ...x, ...doc }));
      setMoreInfoOpen(true);
      if (Number(doc.exchange_rate) !== 1) setCurrencyOpen(true);
      if (doc.company) checkDefaultAccount(doc.company);
    }
  }, [doc]);

  useEffect(() => {
    if (f.company) {
      getEmployeeAdvanceAccounts(f.company, f.currency).then(setAccounts);
    } else {
      setAccounts([]);
    }
  }, [f.company, f.currency]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  // Real Desk: advance_account's fetch_from has no fetch_if_empty, so it's
  // unconditionally re-populated from Company -> Default Employee Advance
  // Account on every save. Mirrored here as an auto-fill (only into a
  // currently-blank field, so it never clobbers a value the user -- or a
  // saved record being edited -- already has). If the company's configured
  // default isn't actually a Receivable account, validate_advance_account_
  // type() would reject it at save time regardless of what's shown, so
  // that case surfaces as a warning instead of a silently-wrong prefill.
  function checkDefaultAccount(company) {
    if (!company) {
      setAccountWarning("");
      return;
    }
    getEmployeeAdvanceDefaultAccount(company).then((res) => {
      if (!res?.account) {
        setAccountWarning("");
        return;
      }
      if (res.valid) {
        setAccountWarning("");
        setF((x) => ({ ...x, advance_account: x.advance_account || res.account }));
      } else {
        setAccountWarning(
          `Company's configured default advance account "${res.account}" is a ${res.account_type} account, not Receivable, so it can't be used -- pick one below, or ask an admin to fix Company → Default Employee Advance Account.`,
        );
      }
    });
  }

  // Real Desk: on employee change, currency defaults from the employee's
  // own submitted Salary Structure Assignment, falling back to the
  // Company's own default currency if there isn't one.
  function emp(v) {
    const e = employees.find((x) => x.name === v);
    setF((x) => ({
      ...x,
      employee: v,
      employee_name: e?.employee_name || "",
      company: e?.company || "",
      department: e?.department || "",
      advance_account: "",
    }));
    setAccountWarning("");
    if (e?.company) {
      getEmployeeAdvanceCompanyCurrency(e.company).then((currency) => setCompanyCurrency(currency || ""));
      getEmployeeAdvanceEmployeeCurrency(v, e.company).then((currency) => {
        setF((x) => ({ ...x, currency: currency || x.currency, exchange_rate: 1 }));
      });
      checkDefaultAccount(e.company);
    }
  }

  // Real Desk: picking a currency that matches the company's own currency
  // resets exchange_rate to 1; a genuinely different currency fetches a
  // live rate via erpnext.setup.utils.get_exchange_rate (still editable
  // afterward -- this doesn't re-fetch on every keystroke).
  function onCurrencyChange(v) {
    set("currency", v);
    if (!v || v === companyCurrency) {
      set("exchange_rate", 1);
    } else {
      getEmployeeAdvanceExchangeRate(v, companyCurrency).then((rate) => set("exchange_rate", rate || 1));
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <div className="panel-head"><div className="panel-title">Employee Advance Information</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Series" c={<select className="input" value={f.naming_series} onChange={(e) => set("naming_series", e.target.value)}><option>HR-EAD-.YYYY.-</option></select>} />
        <F l="Posting Date *" c={<input className="input" type="date" value={f.posting_date} onChange={(e) => set("posting_date", e.target.value)} />} />
        <F l="Employee *" c={<SearchableSelect value={f.employee} onChange={emp} options={employees} displayField="employee_name" showId />} />
        <F l="Employee Name" c={<R v={f.employee_name} />} />
        <F l="Department" c={<R v={f.department} />} />
        <F l="Company" c={<R v={f.company} />} />
      </div>

      <div className="panel-head"><div className="panel-title">Purpose &amp; Amount</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Purpose *" c={<textarea className="input" value={f.purpose} onChange={(e) => set("purpose", e.target.value)} />} />
        <F l="Advance Amount *" c={<input className="input" type="number" value={f.advance_amount} onChange={(e) => set("advance_amount", e.target.value)} />} />
        {doc && [
          ["Paid Amount", f.paid_amount],
          ["Claimed Amount", f.claimed_amount],
          ["Pending Amount", f.pending_amount],
        ].map(([l, v]) => <F key={l} l={l} c={<R v={v} />} />)}
      </div>

      <CollapsibleSection title="Currency" open={currencyOpen} onToggle={() => setCurrencyOpen((o) => !o)}>
        <F l="Currency *" c={<SearchableSelect value={f.currency} onChange={onCurrencyChange} options={currencies} />} />
        <F l="Exchange Rate *" c={<input className="input" type="number" value={f.exchange_rate} onChange={(e) => set("exchange_rate", e.target.value)} />} />
      </CollapsibleSection>

      <div className="panel-head"><div className="panel-title">Accounting</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Advance Account" c={<SearchableSelect value={f.advance_account} onChange={(v) => set("advance_account", v)} options={accounts} disabled={!f.company} placeholder={f.company ? "Search receivable account..." : "Select an employee first"} />} />
        <F l="Mode of Payment" c={<SearchableSelect value={f.mode_of_payment} onChange={(v) => set("mode_of_payment", v)} options={modes} />} />
        <F l="Repay Unclaimed Amount from Salary" c={<input type="checkbox" checked={!!f.repay_unclaimed_amount_from_salary} onChange={(e) => set("repay_unclaimed_amount_from_salary", e.target.checked ? 1 : 0)} />} />
        {accountWarning && (
          <div className="text-sm text-destructive" style={{ gridColumn: "1 / -1" }}>{accountWarning}</div>
        )}
      </div>

      {doc && (
        <CollapsibleSection title="More Info" open={moreInfoOpen} onToggle={() => setMoreInfoOpen((o) => !o)}>
          <F l="Returned Amount" c={<R v={f.return_amount} />} />
          <F l="Status" c={<R v={f.status} />} />
          <F l="Amended From" c={<R v={f.amended_from} />} />
        </CollapsibleSection>
      )}

      <div className="p-5 text-right">
        <button className="btn btn-primary">{doc ? "Update" : "Create"} Employee Advance</button>
      </div>
    </form>
  );
}

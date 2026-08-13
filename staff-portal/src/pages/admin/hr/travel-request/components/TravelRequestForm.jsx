import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getTravelRequestCostCenters, getTravelRequestEmployees, getTravelRequestOptions } from "@/services/hr/travelRequestService";

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

const MODE_OF_TRAVEL = ["Flight", "Train", "Taxi", "Rented Car"];
const MEAL_PREFERENCE = ["Vegetarian", "Non-Vegetarian", "Gluten Free", "Non Diary"];

// Real Travel Itinerary columns -- kept in field_order sequence so the
// table matches the doctype exactly instead of only showing a subset.
const ITINERARY_COLS = {
  travel_from: "Travel From",
  travel_to: "Travel To",
  mode_of_travel: "Mode of Travel",
  meal_preference: "Meal Preference",
  travel_advance_required: "Advance Required",
  advance_amount: "Advance Amount",
  departure_date: "Departure",
  arrival_date: "Arrival",
  lodging_required: "Lodging Required",
  preferred_area_for_lodging: "Preferred Area",
  check_in_date: "Check-in",
  check_out_date: "Check-out",
  other_details: "Other Details",
};
const COSTING_COLS = {
  expense_type: "Expense Type",
  sponsored_amount: "Sponsored",
  funded_amount: "Funded",
  total_amount: "Total",
  comments: "Comments",
};

export default function TravelRequestForm({ doc, onSave }) {
  const [f, setF] = useState({
    travel_type: "", travel_funding: "", purpose_of_travel: "", travel_proof: "",
    details_of_sponsor: "", description: "", employee: "", employee_name: "",
    cell_number: "", prefered_email: "", date_of_birth: "", personal_id_type: "",
    personal_id_number: "", passport_number: "", company: "", cost_center: "",
    itinerary: [], costings: [], name_of_organizer: "", address_of_organizer: "", other_details: "",
  });
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [ids, setIds] = useState([]);
  const [types, setTypes] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    Promise.all([
      getTravelRequestEmployees(),
      getTravelRequestOptions("Purpose of Travel"),
      getTravelRequestOptions("Identification Document Type"),
      getTravelRequestOptions("Expense Claim Type"),
    ]).then(([a, b, c, d]) => {
      setEmployees(a);
      setPurposes(b);
      setIds(c);
      setTypes(d);
    });
  }, []);

  useEffect(() => {
    if (doc) setF((x) => ({ ...x, ...doc }));
  }, [doc]);

  useEffect(() => {
    if (f.company) {
      getTravelRequestCostCenters(f.company).then((r) => setCostCenters(r || []));
    } else {
      setCostCenters([]);
    }
  }, [f.company]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  function emp(v) {
    const e = employees.find((x) => x.name === v);
    setF((x) => ({
      ...x,
      employee: v,
      employee_name: e?.employee_name || "",
      company: e?.company || "",
      date_of_birth: e?.date_of_birth || "",
      cell_number: e?.cell_number || "",
      prefered_email: e?.prefered_email || "",
      passport_number: e?.passport_number || "",
      cost_center: "",
    }));
  }

  function rr(t, i, k, v) {
    setF((x) => ({ ...x, [t]: x[t].map((r, n) => (n === i ? { ...r, [k]: v } : r)) }));
  }

  function inputFor(table, k, r, i) {
    if (k === "expense_type") {
      return <SearchableSelect value={r[k] || ""} onChange={(v) => rr(table, i, k, v)} options={types} />;
    }
    if (k === "mode_of_travel") {
      return (
        <select className="input" value={r[k] || ""} onChange={(e) => rr(table, i, k, e.target.value)}>
          <option value="">Select...</option>
          {MODE_OF_TRAVEL.map((x) => <option key={x}>{x}</option>)}
        </select>
      );
    }
    if (k === "meal_preference") {
      return (
        <select className="input" value={r[k] || ""} onChange={(e) => rr(table, i, k, e.target.value)}>
          <option value="">Select...</option>
          {MEAL_PREFERENCE.map((x) => <option key={x}>{x}</option>)}
        </select>
      );
    }
    if (k === "travel_advance_required" || k === "lodging_required") {
      return <input type="checkbox" checked={!!Number(r[k] || 0)} onChange={(e) => rr(table, i, k, e.target.checked ? 1 : 0)} />;
    }
    if (k === "departure_date" || k === "arrival_date") {
      return <input className="input" type="datetime-local" value={r[k] || ""} onChange={(e) => rr(table, i, k, e.target.value)} />;
    }
    if (k === "check_in_date" || k === "check_out_date") {
      return <input className="input" type="date" value={r[k] || ""} onChange={(e) => rr(table, i, k, e.target.value)} />;
    }
    if (k.includes("amount")) {
      return <input className="input" type="number" value={r[k] ?? ""} onChange={(e) => rr(table, i, k, e.target.value)} />;
    }
    return <input className="input" value={r[k] || ""} onChange={(e) => rr(table, i, k, e.target.value)} />;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <div className="panel-head"><div className="panel-title">Travel Information</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Travel Type *" c={
          <select className="input" value={f.travel_type} onChange={(e) => set("travel_type", e.target.value)}>
            <option value="">Select...</option><option>Domestic</option><option>International</option>
          </select>
        } />
        <F l="Purpose of Travel *" c={<SearchableSelect value={f.purpose_of_travel} onChange={(v) => set("purpose_of_travel", v)} options={purposes} />} />
        <F l="Travel Funding" c={
          <select className="input" value={f.travel_funding} onChange={(e) => set("travel_funding", e.target.value)}>
            <option value="">Select...</option>
            <option>Require Full Funding</option>
            <option>Fully Sponsored</option>
            <option>Partially Sponsored, Require Partial Funding</option>
          </select>
        } />
        <F l="Details of Sponsor" c={<input className="input" value={f.details_of_sponsor} onChange={(e) => set("details_of_sponsor", e.target.value)} />} />
        <F l="Copy of Invitation/Announcement" c={<input className="input" value={f.travel_proof} onChange={(e) => set("travel_proof", e.target.value)} placeholder="Attachment URL" />} />
        <F l="Any other details" c={<textarea className="input" value={f.description} onChange={(e) => set("description", e.target.value)} />} />
      </div>

      <div className="panel-head"><div className="panel-title">Employee Details</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Employee *" c={<SearchableSelect value={f.employee} onChange={emp} options={employees} displayField="employee_name" showId />} />
        {[
          ["Employee Name", "employee_name"],
          ["Contact Number", "cell_number"],
          ["Contact Email", "prefered_email"],
          ["Date of Birth", "date_of_birth"],
          ["Identification Document Number", "personal_id_number"],
          ["Passport Number", "passport_number"],
        ].map(([l, k]) => (
          // employee_name/date_of_birth are read_only:1 in the real JSON.
          // cell_number/prefered_email/passport_number aren't marked
          // read_only, but they DO have fetch_from with no fetch_if_empty --
          // real Desk silently overwrites any manual edit with the
          // Employee's own value on every save, so showing them as editable
          // inputs here would be misleading. personal_id_number has no
          // fetch_from at all and stays genuinely free-form.
          <F key={k} l={l} c={["employee_name", "date_of_birth", "cell_number", "prefered_email", "passport_number"].includes(k) ? <R v={f[k]} /> : <input className="input" value={f[k] || ""} onChange={(e) => set(k, e.target.value)} />} />
        ))}
        <F l="Identification Document Type" c={<SearchableSelect value={f.personal_id_type} onChange={(v) => set("personal_id_type", v)} options={ids} />} />
        <F l="Company" c={<R v={f.company} />} />
        <F l="Cost Center" c={<SearchableSelect value={f.cost_center || ""} onChange={(v) => set("cost_center", v)} options={costCenters} disabled={!f.company} placeholder={f.company ? "Search cost center..." : "Select an employee first"} />} />
      </div>

      <div className="panel-head">
        <div className="panel-title">Travel Itinerary</div>
        <button type="button" className="btn btn-secondary" onClick={() => set("itinerary", [...f.itinerary, {}])}><Plus size={14} />Add Row</button>
      </div>
      <div style={{ padding: 20, overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 1800, tableLayout: "fixed" }}>
          <thead><tr>{Object.values(ITINERARY_COLS).map((x) => <th key={x}>{x}</th>)}<th /></tr></thead>
          <tbody>
            {f.itinerary.map((r, i) => (
              <tr key={i}>
                {Object.keys(ITINERARY_COLS).map((k) => (
                  <td key={k} style={{ verticalAlign: "top", padding: 8 }}>{inputFor("itinerary", k, r, i)}</td>
                ))}
                <td style={{ verticalAlign: "top", padding: 8, width: 52 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => set("itinerary", f.itinerary.filter((_, n) => n !== i))}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-head">
        <div className="panel-title">Costing Details</div>
        <button type="button" className="btn btn-secondary" onClick={() => set("costings", [...f.costings, {}])}><Plus size={14} />Add Row</button>
      </div>
      <div style={{ padding: 20, overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 900, tableLayout: "fixed" }}>
          <thead><tr>{Object.values(COSTING_COLS).map((x) => <th key={x}>{x}</th>)}<th /></tr></thead>
          <tbody>
            {f.costings.map((r, i) => (
              <tr key={i}>
                {Object.keys(COSTING_COLS).map((k) => (
                  <td key={k} style={{ verticalAlign: "top", padding: 8 }}>{inputFor("costings", k, r, i)}</td>
                ))}
                <td style={{ verticalAlign: "top", padding: 8, width: 52 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => set("costings", f.costings.filter((_, n) => n !== i))}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-head"><div className="panel-title">Event Details</div></div>
      <div className="grid-form" style={{ padding: 20 }}>
        <F l="Name of Organizer" c={<input className="input" value={f.name_of_organizer} onChange={(e) => set("name_of_organizer", e.target.value)} />} />
        <F l="Address of Organizer" c={<input className="input" value={f.address_of_organizer} onChange={(e) => set("address_of_organizer", e.target.value)} />} />
        <F l="Other Details" c={<textarea className="input" value={f.other_details} onChange={(e) => set("other_details", e.target.value)} />} />
      </div>

      <div className="p-5 text-right">
        <button className="btn btn-primary">{doc ? "Update" : "Create"} Travel Request</button>
      </div>
    </form>
  );
}

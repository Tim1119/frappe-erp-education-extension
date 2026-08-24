import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getLeaveAllocationPeriod,
  getAllocatedLeaves,
  getLeaveApplicationSettings,
  getLeaveApprovers,
  getLeaveBalance,
  getLeaveEmployeeDetails,
  getLeaveEmployees,
  getLeaveLetterHeads,
  getLeaveSalarySlips,
  getLeaveTypes,
  getTotalLeaveDays,
} from "@/services/hr/leaves/leaveApplicationService";

const today = () => new Date().toISOString().slice(0, 10);
const missing = (value) => value === null || value === undefined || value === "";
const ReadOnlyValue = ({ value, fallback = "—" }) => (
  <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
    {missing(value) ? fallback : String(value)}
  </div>
);
const Field = ({ label, required, children, full }) => (
  <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
    <label className="label">{label}{required && <span className="ml-1 text-destructive">*</span>}</label>
    {children}
  </div>
);

export default function LeaveApplicationForm({ application, onSave }) {
  const editing = Boolean(application);
  const [form, setForm] = useState({
    naming_series: "HR-LAP-.YYYY.-", employee: "", employee_name: "", leave_type: "",
    department: "", leave_balance: null, from_date: today(), to_date: today(), half_day: 0,
    half_day_date: "", total_leave_days: null, description: "", leave_approver: "",
    leave_approver_name: "", status: "Open", posting_date: today(), company: "",
    follow_via_email: 0, salary_slip: "", letter_head: "", color: "",
  });
  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [slips, setSlips] = useState([]);
  const [heads, setHeads] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [allocatedLeaves, setAllocatedLeaves] = useState({});
  const [allocatedOpen, setAllocatedOpen] = useState(true);
  const [approverRequired, setApproverRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getLeaveEmployees(), getLeaveLetterHeads(), getLeaveApplicationSettings()])
      .then(([employeeRows, letterHeads, settings]) => {
        setEmployees(employeeRows || []);
        setHeads(letterHeads || []);
        setApproverRequired(Boolean(Number(settings?.leave_approver_mandatory)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!application) return;
    setForm((current) => ({
      ...current, ...application,
      half_day: Number(application.half_day) || 0,
      follow_via_email: Number(application.follow_via_email) || 0,
    }));
  }, [application]);

  useEffect(() => {
    let active = true;
    getLeaveTypes(form.employee || undefined, form.from_date || form.posting_date)
      .then((rows) => active && setTypes(rows || []))
      .catch(() => active && setTypes([]));
    if (form.employee) {
      getLeaveApprovers(form.employee).then((rows) => active && setApprovers(rows || [])).catch(() => active && setApprovers([]));
      getLeaveSalarySlips(form.employee).then((rows) => active && setSlips(rows || [])).catch(() => active && setSlips([]));
    } else {
      setApprovers([]);
      setSlips([]);
    }
    return () => { active = false; };
  }, [form.employee, form.from_date, form.posting_date]);

  useEffect(() => {
    if (!form.employee) {
      setAllocatedLeaves({});
      return;
    }
    let active = true;
    getAllocatedLeaves(form.employee, form.from_date || form.posting_date)
      .then((details) => {
        if (!active) return;
        setAllocatedLeaves(details?.leave_allocation || {});
        if (details?.leave_approver) {
          setForm((current) => current.employee !== form.employee || current.leave_approver
            ? current
            : { ...current, leave_approver: details.leave_approver });
        }
      })
      .catch(() => active && setAllocatedLeaves({}));
    return () => { active = false; };
  }, [form.employee, form.from_date, form.posting_date]);

  useEffect(() => {
    if (!form.employee) return;
    let active = true;
    getLeaveEmployeeDetails(form.employee).then((employee) => {
      if (!active || !employee) return;
      setForm((current) => current.employee !== form.employee ? current : ({
        ...current,
        employee_name: employee.employee_name || "",
        department: employee.department || "",
        company: employee.company || "",
      }));
    }).catch(() => {});
    return () => { active = false; };
  }, [form.employee]);

  useEffect(() => {
    if (!form.employee || !form.leave_type) {
      setForm((current) => ({ ...current, leave_balance: null }));
      return;
    }
    let active = true;
    getLeaveBalance(form.employee, form.leave_type, form.from_date || form.posting_date, form.to_date)
      .then((balance) => active && setForm((current) => ({ ...current, leave_balance: balance ?? 0 })))
      .catch(() => active && setForm((current) => ({ ...current, leave_balance: null })));
    return () => { active = false; };
  }, [form.employee, form.leave_type, form.from_date, form.to_date, form.posting_date]);

  useEffect(() => {
    if (!form.employee || !form.leave_type || !form.from_date || !form.to_date) {
      setForm((current) => ({ ...current, total_leave_days: null }));
      return;
    }
    let active = true;
    getTotalLeaveDays(
      form.employee, form.leave_type, form.from_date, form.to_date,
      form.half_day, form.half_day_date || undefined,
    ).then((days) => active && setForm((current) => ({ ...current, total_leave_days: days ?? 0 })))
      .catch(() => active && setForm((current) => ({ ...current, total_leave_days: null })));
    return () => { active = false; };
  }, [form.employee, form.leave_type, form.from_date, form.to_date, form.half_day, form.half_day_date]);

  useEffect(() => {
    if (!form.employee || !form.leave_type || !form.from_date || !form.to_date) {
      setAllocation(null);
      return;
    }
    let active = true;
    getLeaveAllocationPeriod(form.employee, form.leave_type, form.from_date, form.to_date)
      .then((result) => active && setAllocation(result || null))
      .catch(() => active && setAllocation(null));
    return () => { active = false; };
  }, [form.employee, form.leave_type, form.from_date, form.to_date]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  function selectEmployee(value) {
    const employee = employees.find((row) => row.name === value) || {};
    setAllocation(null);
    setForm((current) => ({
      ...current, employee: value, employee_name: employee.employee_name || "",
      department: employee.department || "", company: employee.company || "", leave_type: "",
      leave_balance: null, total_leave_days: null, leave_approver: "", salary_slip: "",
    }));
  }
  function toggleHalfDay(checked) {
    setForm((current) => ({
      ...current,
      half_day: checked ? 1 : 0,
      half_day_date: checked && current.from_date === current.to_date ? current.from_date : "",
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.employee || !form.leave_type || !form.from_date || !form.to_date) return toast.error("Complete all required fields");
    if (approverRequired && !form.leave_approver) return toast.error("Leave Approver is required. Configure one on the Employee or Department first.");
    if (form.from_date > form.to_date) return toast.error("To Date cannot be before From Date");
    if (allocation && !allocation.valid) return toast.error("Choose dates inside one submitted Leave Allocation period");
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  const periods = allocation?.periods || [];
  const allocatedRows = Object.entries(allocatedLeaves);
  return <form onSubmit={submit}>
    <div className="panel-head"><div className="panel-title">Leave Application Information</div></div>
    <div className="grid-form" style={{ padding: "10px 20px 26px" }}>
      <Field label="Naming Series" required><select className="input" value={form.naming_series} onChange={(event) => set("naming_series", event.target.value)}><option>HR-LAP-.YYYY.-</option></select></Field>
      <Field label="Employee" required><SearchableSelect value={form.employee} onChange={selectEmployee} options={employees} displayField="employee_name" placeholder="Search active employee..." showId /></Field>
      <Field label="Employee Name"><ReadOnlyValue value={form.employee_name} /></Field>
      <Field label="Leave Type" required><SearchableSelect value={form.leave_type} onChange={(value) => set("leave_type", value)} options={types} linkedDoctype="Leave Type" placeholder={form.employee ? "Search allocated leave type..." : "Select an employee first"} disabled={!form.employee} /></Field>
      <Field label="Department"><ReadOnlyValue value={form.department} fallback={form.employee ? "Not set on Employee" : "—"} /></Field>
      <Field label="Leave Balance"><ReadOnlyValue value={form.leave_balance} /></Field>
    </div>
    {form.employee && <section className="mx-5 mb-5 overflow-hidden rounded-md border">
      <button type="button" className="flex w-full items-center gap-2 bg-muted/50 px-4 py-3 text-left text-sm font-medium" onClick={() => setAllocatedOpen((open) => !open)}>
        {allocatedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="flex-1">Allocated Leaves</span>
        <span className="text-xs font-normal text-muted-foreground">{allocatedRows.length} leave type{allocatedRows.length === 1 ? "" : "s"}</span>
      </button>
      {allocatedOpen && <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Leave Type</th><th>Total Allocated</th><th>Expired</th><th>Taken</th><th>Pending Approval</th><th>Remaining</th></tr></thead><tbody>{allocatedRows.map(([leaveType, details]) => <tr key={leaveType}><td className="font-medium">{leaveType}</td><td>{details.total_leaves ?? 0}</td><td>{details.expired_leaves ?? 0}</td><td>{details.leaves_taken ?? 0}</td><td>{details.leaves_pending_approval ?? 0}</td><td className="font-medium">{details.remaining_leaves ?? 0}</td></tr>)}{!allocatedRows.length && <tr><td colSpan={6} className="text-sm text-muted-foreground">No submitted leave allocations cover this date.</td></tr>}</tbody></table></div>}
    </section>}
    {allocation && !allocation.valid && <div className="mx-5 mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p className="font-medium">Application dates are outside a submitted Leave Allocation.</p>
      <p className="mt-1">{periods.length ? `Valid period${periods.length === 1 ? "" : "s"}: ${periods.map((row) => `${row.from_date} to ${row.to_date}`).join(", ")}` : "No submitted allocation exists for this employee and leave type. Create and submit a Leave Allocation first."}</p>
    </div>}
    <div className="panel-head"><div className="panel-title">Dates &amp; Reason</div></div>
    <div className="grid-form" style={{ padding: "10px 20px 26px" }}>
      <Field label="From Date" required><input className="input" type="date" value={form.from_date || ""} onChange={(event) => set("from_date", event.target.value)} /></Field>
      <Field label="To Date" required><input className="input" type="date" value={form.to_date || ""} onChange={(event) => set("to_date", event.target.value)} /></Field>
      <Field label="Half Day"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.half_day)} onChange={(event) => toggleHalfDay(event.target.checked)} /> This is a half-day leave</label></Field>
      {form.half_day ? <Field label="Half Day Date" required><input className="input" type="date" min={form.from_date || undefined} max={form.to_date || undefined} value={form.half_day_date || ""} onChange={(event) => set("half_day_date", event.target.value)} /></Field> : null}
      <Field label="Total Leave Days"><ReadOnlyValue value={form.total_leave_days} /></Field>
      <Field label="Reason" full><textarea className="input" rows={4} value={form.description || ""} onChange={(event) => set("description", event.target.value)} /></Field>
    </div>
    <div className="panel-head"><div className="panel-title">Approval</div></div>
    <div className="grid-form" style={{ padding: "10px 20px 26px" }}>
      <Field label="Leave Approver" required={approverRequired}><SearchableSelect value={form.leave_approver} onChange={(value) => set("leave_approver", value)} options={approvers} displayField="full_name" disabled={!form.employee} placeholder={form.employee ? "Search configured leave approver..." : "Select an employee first"} />{form.employee && approverRequired && !approvers.length && <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">No eligible approver is configured for this employee. An arbitrary new User would not become a leave approver automatically. <Link className="font-medium underline" to={`/dashboard/employees/${encodeURIComponent(form.employee)}/edit`}>Configure the Employee’s Leave Approver</Link>{form.department ? <> or configure approvers on department <span className="font-medium">{form.department}</span>.</> : <> and assign the employee to a Department if department-level approval is required.</>}</div>}</Field>
      <Field label="Status" required><select className="input" value={form.status} onChange={(event) => set("status", event.target.value)}>{["Open", "Approved", "Rejected", "Cancelled"].map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Posting Date" required><input className="input" type="date" value={form.posting_date || ""} onChange={(event) => set("posting_date", event.target.value)} /></Field>
      <Field label="Company"><ReadOnlyValue value={form.company} /></Field>
      <Field label="Follow via Email"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.follow_via_email)} onChange={(event) => set("follow_via_email", event.target.checked ? 1 : 0)} /> Send updates by email</label></Field>
      <Field label="Salary Slip"><SearchableSelect value={form.salary_slip} onChange={(value) => set("salary_slip", value)} options={slips} disabled={!form.employee} placeholder={form.employee ? "Search employee salary slip..." : "Select an employee first"} /></Field>
      <Field label="Letter Head"><SearchableSelect value={form.letter_head} onChange={(value) => set("letter_head", value)} options={heads} /></Field>
      <Field label="Color"><input className="input" type="color" value={form.color || "#000000"} onChange={(event) => set("color", event.target.value)} /></Field>
    </div>
    <div className="flex justify-end gap-2 p-5"><button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button><button className="btn btn-primary" disabled={saving || Boolean(allocation && !allocation.valid)}>{saving ? "Saving..." : editing ? "Update Leave Application" : "Create Leave Application"}</button></div>
  </form>;
}

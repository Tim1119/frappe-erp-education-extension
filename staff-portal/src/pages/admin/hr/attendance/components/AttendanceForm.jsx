import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  getAttendanceEmployees,
  getAttendanceLeaveTypes,
  getAttendanceShiftTypes,
} from "@/services/hr/attendanceService";

const today = () => new Date().toISOString().slice(0, 10);
const Field = ({ label, required, children }) => (
  <div className="field">
    <label className="label">
      {label}
      {required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);
const ReadOnlyValue = ({ value }) => (
  <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
    {value === null || value === undefined || value === "" ? "—" : value}
  </div>
);

export default function AttendanceForm({ attendance, onSave }) {
  const [form, setForm] = useState({
    naming_series: "HR-ATT-.YYYY.-", employee: "", employee_name: "", working_hours: "",
    status: "Present", leave_type: "", leave_application: "", attendance_date: today(),
    company: "", department: "", shift: "", attendance_request: "", late_entry: 0,
    early_exit: 0, in_time: "", out_time: "", half_day_status: "",
  });
  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAttendanceEmployees(), getAttendanceLeaveTypes(), getAttendanceShiftTypes()])
      .then(([employeeRows, leaveTypes, shiftTypes]) => {
        setEmployees(employeeRows || []); setTypes(leaveTypes || []); setShifts(shiftTypes || []);
      });
  }, []);
  useEffect(() => {
    if (attendance) setForm((old) => ({ ...old, ...attendance, late_entry: Number(attendance.late_entry) || 0, early_exit: Number(attendance.early_exit) || 0 }));
  }, [attendance]);

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  function employeeChanged(value) {
    const selected = employees.find((employee) => employee.name === value);
    setForm((old) => ({ ...old, employee: value, employee_name: selected?.employee_name || "", company: selected?.company || "", department: selected?.department || "" }));
  }
  async function submit(event) {
    event.preventDefault();
    if (!form.employee || !form.status || !form.attendance_date) return toast.error("Complete all required fields");
    if (["On Leave", "Half Day"].includes(form.status) && !form.leave_type) return toast.error("Leave Type is required");
    setSaving(true); try { await onSave(form); } finally { setSaving(false); }
  }
  const requiresLeaveType = ["On Leave", "Half Day"].includes(form.status);

  return (
    <form onSubmit={submit}>
      <div className="panel-head"><div className="panel-title">Attendance Information</div></div>
      <div className="grid-form" style={{ padding: "10px 20px 26px" }}>
        <Field label="Series" required><select className="input" value={form.naming_series} onChange={(e) => set("naming_series", e.target.value)}><option>HR-ATT-.YYYY.-</option></select></Field>
        <Field label="Attendance Date" required><input className="input" type="date" value={form.attendance_date || ""} onChange={(e) => set("attendance_date", e.target.value)} /></Field>
        <Field label="Employee" required><SearchableSelect value={form.employee} onChange={employeeChanged} options={employees} displayField="employee_name" placeholder="Search active employee..." showId /></Field>
        <Field label="Employee Name"><ReadOnlyValue value={form.employee_name} /></Field>
        <Field label="Status" required><select className="input" value={form.status || ""} onChange={(e) => { set("status", e.target.value); if (!["On Leave", "Half Day"].includes(e.target.value)) set("leave_type", ""); }}>{["Present", "Absent", "On Leave", "Half Day", "Work From Home"].map((value) => <option key={value}>{value}</option>)}</select></Field>
        {requiresLeaveType && <Field label="Leave Type" required><SearchableSelect value={form.leave_type || ""} onChange={(value) => set("leave_type", value)} options={types} linkedDoctype="Leave Type" /></Field>}
        {form.status === "Half Day" && <Field label="Status for Other Half"><select className="input" value={form.half_day_status || ""} onChange={(e) => set("half_day_status", e.target.value)}><option value="">Select...</option><option>Present</option><option>Absent</option></select></Field>}
        <Field label="Company"><ReadOnlyValue value={form.company} /></Field>
        <Field label="Department"><ReadOnlyValue value={form.department} /></Field>
        <Field label="Shift"><SearchableSelect value={form.shift || ""} onChange={(value) => set("shift", value)} options={shifts} linkedDoctype="Shift Type" /></Field>
        <Field label="Late Entry"><label className="flex items-center gap-2"><input type="checkbox" checked={!!form.late_entry} onChange={(e) => set("late_entry", e.target.checked ? 1 : 0)} /> Employee arrived late</label></Field>
        <Field label="Early Exit"><label className="flex items-center gap-2"><input type="checkbox" checked={!!form.early_exit} onChange={(e) => set("early_exit", e.target.checked ? 1 : 0)} /> Employee left early</label></Field>
      </div>

      {attendance && (
        <>
          <div className="panel-head"><div className="panel-title">System Details</div></div>
          <div className="grid-form" style={{ padding: "10px 20px 26px" }}>
            <Field label="Working Hours"><ReadOnlyValue value={form.working_hours} /></Field>
            <Field label="Leave Application"><ReadOnlyValue value={form.leave_application} /></Field>
            <Field label="Attendance Request"><ReadOnlyValue value={form.attendance_request} /></Field>
            <Field label="In Time"><ReadOnlyValue value={form.in_time} /></Field>
            <Field label="Out Time"><ReadOnlyValue value={form.out_time} /></Field>
            <Field label="Amended From"><ReadOnlyValue value={form.amended_from} /></Field>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 p-5">
        <button type="button" className="btn btn-secondary" onClick={() => history.back()}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : attendance ? "Update Attendance" : "Create Attendance"}</button>
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { getHRSettingsEmailTemplates, getHRSettingsOutgoingEmailAccounts, getHRSettingsRoles, getHRSettingsSenderEmail, getHRSettingsWebForms } from "@/services/hr/hrSettingsService";

export const HR_SETTINGS_SECTIONS = [
  { title: "Employee Settings", fields: [
    ["retirement_age", "Retirement Age (In Years)", "text"], ["emp_created_by", "Employee Naming By", "select", ["Naming Series", "Employee Number", "Full Name"]],
    ["expense_approver_mandatory_in_expense_claim", "Expense Approver Mandatory In Expense Claim", "check"], ["leave_approver_mandatory_in_leave_application", "Leave Approver Mandatory In Leave Application", "check"],
    ["show_leaves_of_all_department_members_in_calendar", "Show Leaves Of All Department Members In Calendar", "check"], ["auto_leave_encashment", "Auto Leave Encashment", "check"],
    ["restrict_backdated_leave_application", "Restrict Backdated Leave Application", "check"], ["role_allowed_to_create_backdated_leave_application", "Role Allowed to Create Backdated Leave Application", "role", null, "restrict_backdated_leave_application"],
    ["send_leave_notification", "Send Leave Notification", "check"], ["leave_approval_notification_template", "Leave Approval Notification Template", "template", null, "send_leave_notification"],
    ["leave_status_notification_template", "Leave Status Notification Template", "template", null, "send_leave_notification"], ["standard_working_hours", "Standard Working Hours", "number"],
  ]},
  { title: "Leave and Expense Claim Settings", fields: [["prevent_self_leave_approval", "Prevent self approval for leaves even if user has permissions", "check"], ["prevent_self_expense_approval", "Prevent self approval for expense claims even if user has permissions", "check"]]},
  { title: "Reminders", fields: [
    ["send_holiday_reminders", "Holidays", "check"], ["frequency", "Set the frequency for holiday reminders", "select", ["Weekly", "Monthly"], "send_holiday_reminders"], ["send_work_anniversary_reminders", "Work Anniversaries", "check"], ["send_birthday_reminders", "Birthdays", "check"],
    ["send_interview_reminder", "Send Interview Reminder", "check"], ["remind_before", "Remind Before", "time", null, "send_interview_reminder"], ["interview_reminder_template", "Interview Reminder Notification Template", "template", null, "send_interview_reminder"],
    ["send_interview_feedback_reminder", "Send Interview Feedback Reminder", "check"], ["feedback_reminder_notification_template", "Feedback Reminder Notification Template", "template", null, "send_interview_feedback_reminder"],
  ]},
  { title: "Hiring Settings", fields: [["check_vacancies", "Check Vacancies On Job Offer Creation", "check"], ["hiring_sender", "Sender", "email_account"], ["hiring_sender_email", "Sender Email", "readonly"]]},
  { title: "Employee Exit Settings", fields: [["exit_questionnaire_web_form", "Exit Questionnaire Web Form", "webform"], ["exit_questionnaire_notification_template", "Exit Questionnaire Notification Template", "template"], ["sender", "Sender", "email_account"], ["sender_email", "Sender Email", "readonly"]]},
  { title: "Shift Settings", fields: [["allow_multiple_shift_assignments", "Allow Multiple Shift Assignments for Same Date", "check"]]},
  { title: "Attendance Settings", fields: [["allow_employee_checkin_from_mobile_app", "Allow Employee Checkin from Mobile App", "check"], ["allow_geolocation_tracking", "Allow Geolocation Tracking", "check"]]},
  { title: "Unlink Payment", fields: [["unlink_payment_on_cancellation_of_employee_advance", "Unlink Payment on Cancellation of Employee Advance", "check"]]},
];

const FieldWrap = ({ label, children }) => <div className="field"><label className="label">{label}</label>{children}</div>;
export default function HRSettingsForm({ settings, onSave }) {
  const [form, setForm] = useState(settings || {}); const [roles, setRoles] = useState([]); const [templates, setTemplates] = useState([]); const [webforms, setWebforms] = useState([]); const [accounts, setAccounts] = useState([]); const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(settings || {}); }, [settings]);
  useEffect(() => { Promise.all([getHRSettingsRoles(), getHRSettingsEmailTemplates(), getHRSettingsWebForms(), getHRSettingsOutgoingEmailAccounts()]).then(([a,b,c,d]) => { setRoles(a || []); setTemplates(b || []); setWebforms(c || []); setAccounts(d || []); }); }, []);
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function senderChanged(field, value) { set(field, value); const emailField = field === "sender" ? "sender_email" : "hiring_sender_email"; try { set(emailField, value ? await getHRSettingsSenderEmail(value) : ""); } catch { set(emailField, ""); } }
  function render([name,label,type,choices,dependency]) { const disabled = dependency && !Number(form[dependency]); const note = disabled ? <p className="text-xs text-muted-foreground">Enable the related setting first.</p> : null; if (type === "check") return <FieldWrap key={name} label={label}><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!Number(form[name])} onChange={e => set(name,e.target.checked?1:0)} /> Enabled</label></FieldWrap>; if (type === "readonly") return <FieldWrap key={name} label={label}><div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{form[name] || "—"}</div></FieldWrap>; if (["role","template","webform","email_account"].includes(type)) { const opts = type === "role" ? roles : type === "template" ? templates : type === "webform" ? webforms : accounts; return <FieldWrap key={name} label={label}><SearchableSelect value={form[name] || ""} onChange={v => type === "email_account" ? senderChanged(name,v) : set(name,v)} options={opts} displayField={type === "webform" ? "title" : type === "email_account" ? "email_id" : undefined} disabled={disabled} placeholder={disabled ? "Enable the related setting first" : `Search ${label.toLowerCase()}...`} />{note}</FieldWrap>; } if(type === "select") return <FieldWrap key={name} label={label}><select className="input" value={form[name] || ""} disabled={disabled} onChange={e=>set(name,e.target.value)}><option value="">Select...</option>{choices.map(x=><option key={x}>{x}</option>)}</select>{note}</FieldWrap>; return <FieldWrap key={name} label={label}><input className="input" type={type === "number" ? "number" : type === "time" ? "time" : "text"} step={type === "number" ? "any" : undefined} value={form[name] ?? ""} disabled={disabled} onChange={e=>set(name,e.target.value)} />{note}</FieldWrap>; }
  async function submit(e) { e.preventDefault(); setSaving(true); try { await onSave(form); } finally { setSaving(false); } }
  return <form onSubmit={submit}>{HR_SETTINGS_SECTIONS.map(section => <section key={section.title}><div className="panel-head"><div className="panel-title">{section.title}</div></div><div className="grid-form" style={{padding:"10px 20px 26px"}}>{section.fields.map(render)}</div></section>)}<div className="flex justify-end gap-2 p-5"><button type="button" className="btn btn-secondary" onClick={()=>history.back()}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?"Saving...":"Update HR Settings"}</button></div></form>;
}

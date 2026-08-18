const QUICK_CREATE_DOCTYPES = new Set([
  "Employment Type",
  "Location",
  "Branch",
  "Designation",
  "Department",
  "Company",
  "Job Opening",
  "Staffing Plan",
  "Job Requisition",
  "Interview Type",
  "Interview Round",
  "Training Program",
  "Grievance Type",
  "Appointment Letter Template",
  "Shift Type",
  "Shift Location",
  "Activity Type",
]);

const REQUIRED_FIELDS = {
  "staffing-plan": ["company", "from_date", "to_date"],
  "job-requisition": ["designation", "no_of_positions", "expected_compensation", "status", "company", "requested_by", "posting_date", "description"],
  "job-opening": ["job_title", "company", "designation"],
  "job-applicants": ["applicant_name", "email_id", "designation", "status"],
  "job-offers": ["job_applicant", "applicant_name", "offer_date", "designation", "company"],
  "employee-referrals": ["first_name", "last_name", "date", "status", "for_designation", "email", "referrer"],
  "interview-types": [],
  "interview-rounds": ["round_name"],
  interviews: ["job_applicant", "interview_round", "status", "scheduled_on", "from_time", "to_time"],
  "interview-feedback": ["interview", "interview_round", "interviewer", "result"],
  "appointment-letter-templates": ["template_name", "introduction"],
  "appointment-letters": ["applicant_name", "appointment_date", "appointment_letter_template", "introduction", "job_applicant", "company"],
};

const REQUIRED_TABLES = {
  "staffing-plan": ["staffing_details"],
  "interview-rounds": ["expected_skill_set"],
  "interview-feedback": ["skill_assessment"],
  "appointment-letter-templates": ["terms"],
  "appointment-letters": ["terms"],
  "shift-schedules": ["repeat_on_days"],
  timesheets: ["time_logs"],
};

export function linkedDoctypeFor(field) {
  return QUICK_CREATE_DOCTYPES.has(field.doctype) ? field.doctype : null;
}

export function requiredFieldNames(base) {
  return new Set(REQUIRED_FIELDS[base] || []);
}

export function requiredTableNames(base) {
  return new Set(REQUIRED_TABLES[base] || []);
}

export function formatListValue(config, fieldname, value) {
  if (value === undefined || value === null || value === "") return "—";
  const field = config.fields.find((item) => item.name === fieldname);
  if (field?.type === "currency") {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amount)
      : value;
  }
  const looksLikeDate = field?.type === "date" || field?.type === "datetime" || fieldname === "modified";
  if (looksLikeDate) {
    const normalized = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : String(value).replace(" ", "T");
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(field?.type === "datetime" || fieldname === "modified" ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(date);
    }
  }
  return value;
}

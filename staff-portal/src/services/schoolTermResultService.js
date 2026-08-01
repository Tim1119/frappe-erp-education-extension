import api from "./api";

const METHOD = "education_extension.staff_portal_api.school_term_result_api";

export function getSchoolTermResults(params) {
  return api(`${METHOD}.get_school_term_results`, params);
}
export function getSchoolTermResult(name) {
  return api(`${METHOD}.get_school_term_result`, { name });
}
export function createSchoolTermResult(data) {
  return api(`${METHOD}.create_school_term_result`, { data });
}
export function updateSchoolTermResult(name, data) {
  return api(`${METHOD}.update_school_term_result`, { name, data });
}
export function deleteSchoolTermResult(name) {
  return api(`${METHOD}.delete_school_term_result`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}
export function getAssessmentGroups() {
  return api(`${METHOD}.get_assessment_groups`);
}
export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}
export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}
export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}
export function getCourses() {
  return api(`${METHOD}.get_courses`);
}
export function getAssessmentCriteria() {
  return api(`${METHOD}.get_assessment_criteria`);
}

export function getSchoolPrintFormat() {
  return api(`${METHOD}.get_school_print_format`);
}

// Real, ACTIVE mechanism confirmed from this app's own two Vue frontends
// (student_portal/src/pages/Report.vue, frontend/src/pages/ward/WardReport.vue)
// -- both print School Term Result the SAME way: a plain GET, no CSRF
// token needed, window.open() straight to Frappe's own generic print
// PREVIEW page (/printview -- an HTML page, not the raw PDF-bytes
// download endpoint). This is genuinely DIFFERENT from Student Report
// Generation Tool's printReportCard(), which posts a hidden form to a
// bespoke preview_report_card endpoint -- that shape exists only because
// Student Report Generation Tool is a Single Tool with no persisted
// document to reference by name, so it has to POST the whole in-memory
// doc as JSON. School Term Result is a normal persisted doctype with a
// real docname, so the plain doctype+name+format query-string GET (what
// Frappe's own Desk "Print" button itself does for any ordinary
// document, and what both real Vue apps in this app already do
// specifically for School Term Result) is the correct one to mirror,
// not the hidden-form-POST shape.
const SECONDARY_PROGRAM_KEYWORDS = ["jss", "ss", "secondary", "high school", "senior", "junior secondary"];

function isSecondaryProgram(program) {
  if (!program) return false;
  const p = program.toLowerCase();
  return SECONDARY_PROGRAM_KEYWORDS.some((k) => p.includes(k));
}

export async function printSchoolTermResult(name, program) {
  const formats = await getSchoolPrintFormat();
  const format = isSecondaryProgram(program)
    ? (formats?.secondary_print_format || "Standard")
    : (formats?.primary_print_format || "Standard");
  const url = `/printview?doctype=${encodeURIComponent("School Term Result")}&name=${encodeURIComponent(name)}&format=${encodeURIComponent(format)}&no_letterhead=1`;
  const w = window.open(url, "_blank");
  if (!w) {
    throw new Error("Please allow pop-ups to view/print this result.");
  }
}

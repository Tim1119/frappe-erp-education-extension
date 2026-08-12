import api from "../api";

const METHOD = "education_extension.staff_portal_api.education.student_monthly_attendance_sheet_api";

export function getYears() {
  return api(`${METHOD}.get_years`);
}

export function getStudentGroups() {
  return api(`${METHOD}.get_student_groups`);
}

import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_guardian_contacts_api";

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getStudentBatches() {
  return api(`${METHOD}.get_student_batches`);
}

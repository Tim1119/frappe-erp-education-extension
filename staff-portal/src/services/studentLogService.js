import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_log_api";

export function getStudentLogs(params) {
  return api(`${METHOD}.get_student_logs`, params);
}

export function getStudentLog(name) {
  return api(`${METHOD}.get_student_log`, { name });
}

export function createStudentLog(data) {
  return api(`${METHOD}.create_student_log`, { data });
}

export function updateStudentLog(name, data) {
  return api(`${METHOD}.update_student_log`, { name, data });
}

export function deleteStudentLog(name) {
  return api(`${METHOD}.delete_student_log`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getStudentBatches() {
  return api(`${METHOD}.get_student_batches`);
}

import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.class_enrollment_api";

export function getClassEnrollments(params) {
  return api(`${METHOD}.get_class_enrollments`, params);
}

export function getClassEnrollment(name) {
  return api(`${METHOD}.get_class_enrollment`, { name });
}

export function createClassEnrollment(data) {
  return api(`${METHOD}.create_class_enrollment`, { data });
}

export function updateClassEnrollment(name, data) {
  return api(`${METHOD}.update_class_enrollment`, { name, data });
}

export function deleteClassEnrollment(name) {
  return api(`${METHOD}.delete_class_enrollment`, { name });
}

export function submitClassEnrollment(name) {
  return api(`${METHOD}.submit_class_enrollment`, { name });
}

export function cancelClassEnrollment(name) {
  return api(`${METHOD}.cancel_class_enrollment`, { name });
}

export function getConnections(class_enrollment) {
  return api(`${METHOD}.get_connections`, { class_enrollment });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getStudentCategories() {
  return api(`${METHOD}.get_student_categories`);
}

export function getStudentBatches() {
  return api(`${METHOD}.get_student_batches`);
}

export function getSchoolHouses() {
  return api(`${METHOD}.get_school_houses`);
}

export function getFeeSchedules() {
  return api(`${METHOD}.get_fee_schedules`);
}

export function getCoursesForProgram(program) {
  return api(`${METHOD}.get_courses_for_program`, { program });
}

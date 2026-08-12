import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.subject_enrollment_api";

export function getSubjectEnrollments(params) {
  return api(`${METHOD}.get_subject_enrollments`, params);
}

export function getSubjectEnrollment(name) {
  return api(`${METHOD}.get_subject_enrollment`, { name });
}

export function createSubjectEnrollment(data) {
  return api(`${METHOD}.create_subject_enrollment`, { data });
}

export function updateSubjectEnrollment(name, data) {
  return api(`${METHOD}.update_subject_enrollment`, { name, data });
}

export function deleteSubjectEnrollment(name) {
  return api(`${METHOD}.delete_subject_enrollment`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

export function getProgramEnrollments() {
  return api(`${METHOD}.get_program_enrollments`);
}

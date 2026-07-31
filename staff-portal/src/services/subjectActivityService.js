import api from "./api";

const METHOD = "education_extension.staff_portal_api.subject_activity_api";

export function getSubjectActivities(params) {
  return api(`${METHOD}.get_subject_activities`, params);
}

export function getSubjectActivity(name) {
  return api(`${METHOD}.get_subject_activity`, { name });
}

export function deleteSubjectActivity(name) {
  return api(`${METHOD}.delete_subject_activity`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

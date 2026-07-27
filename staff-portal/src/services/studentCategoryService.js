import api from "./api";

const METHOD = "education_extension.staff_portal_api.student_category_api";

export function getStudentCategories(params) {
  return api(`${METHOD}.get_student_categories`, params);
}

export function getStudentCategory(name) {
  return api(`${METHOD}.get_student_category`, { name });
}

export function createStudentCategory(data) {
  return api(`${METHOD}.create_student_category`, { data });
}

export function updateStudentCategory(name, data) {
  return api(`${METHOD}.update_student_category`, { name, data });
}

export function deleteStudentCategory(name) {
  return api(`${METHOD}.delete_student_category`, { name });
}

export function getConnections(student_category) {
  return api(`${METHOD}.get_connections`, { student_category });
}

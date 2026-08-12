import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.student_batch_name_api";

export function getStudentBatchNames(params) {
  return api(`${METHOD}.get_student_batch_names`, params);
}

export function getStudentBatchName(name) {
  return api(`${METHOD}.get_student_batch_name`, { name });
}

export function createStudentBatchName(data) {
  return api(`${METHOD}.create_student_batch_name`, { data });
}

export function updateStudentBatchName(name, data) {
  return api(`${METHOD}.update_student_batch_name`, { name, data });
}

export function deleteStudentBatchName(name) {
  return api(`${METHOD}.delete_student_batch_name`, { name });
}

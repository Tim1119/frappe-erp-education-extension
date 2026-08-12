// services/studentAdmissionService.js
import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.education";

export function getStudentAdmissions(params = {}) {
  return callMethod(`${NS}.student_admission_api.get_student_admissions`, params);
}

export function getStudentAdmission(name) {
  return callMethod(`${NS}.student_admission_api.get_student_admission`, { name });
}

export function createStudentAdmission(data) {
  return callMethod(`${NS}.student_admission_api.create_student_admission`, { data });
}

export function updateStudentAdmission(name, data) {
  return callMethod(`${NS}.student_admission_api.update_student_admission`, { name, data });
}

export function deleteStudentAdmission(name) {
  return callMethod(`${NS}.student_admission_api.delete_student_admission`, { name });
}

export function getPrograms() {
  return callMethod(`${NS}.student_admission_api.get_programs`, {});
}

export function getAcademicYears() {
  return callMethod(`${NS}.student_admission_api.get_academic_years`, {});
}

export function createAcademicYear(data) {
  return callMethod(`${NS}.student_admission_api.create_academic_year`, { data });
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.student_admission_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
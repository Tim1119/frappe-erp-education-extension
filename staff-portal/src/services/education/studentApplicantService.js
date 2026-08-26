// services/studentApplicantService.js
import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.education";

export function getStudentApplicants(params = {}) {
  return callMethod(`${NS}.student_applicant_api.get_student_applicants`, params);
}

export function getStudentApplicant(name) {
  return callMethod(`${NS}.student_applicant_api.get_student_applicant`, { name });
}

export function createStudentApplicant(data) {
  return callMethod(`${NS}.student_applicant_api.create_student_applicant`, { data });
}

export function updateStudentApplicant(name, data) {
  return callMethod(`${NS}.student_applicant_api.update_student_applicant`, { name, data });
}

export function deleteStudentApplicant(name) {
  return callMethod(`${NS}.student_applicant_api.delete_student_applicant`, { name });
}

export function getStudentGroupsForProgram(program, academic_year) {
  return callMethod(`${NS}.student_applicant_api.get_student_groups_for_enrollment`, {
    program,
    academic_year,
  });
}

export function enrollStudentWithClassArm(student_applicant, student_group) {
  return callMethod(`${NS}.student_applicant_api.enroll_student_with_class_arm`, {
    student_applicant,
    student_group: student_group || undefined,
  });
}

export function getPrograms() {
  return callMethod(`${NS}.student_applicant_api.get_programs`, {});
}

export function getAcademicYears() {
  return callMethod(`${NS}.student_applicant_api.get_academic_years`, {});
}

export function getAcademicTerms(academic_year) {
  return callMethod(`${NS}.student_applicant_api.get_academic_terms`, { academic_year });
}

export function getGenders() {
  return callMethod(`${NS}.student_applicant_api.get_genders`, {});
}

export function getStudentCategories() {
  return callMethod(`${NS}.student_applicant_api.get_student_categories`, {});
}

export function getGuardians() {
  return callMethod(`${NS}.student_applicant_api.get_guardians`, {});
}

export function createGuardian(data) {
  return callMethod(`${NS}.student_applicant_api.create_guardian`, { data });
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.student_applicant_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}

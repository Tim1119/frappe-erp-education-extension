import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.fees_api";

export function getFees(params) {
  return api(`${METHOD}.get_fees`, params);
}

export function getFee(name) {
  return api(`${METHOD}.get_fee`, { name });
}

export function createFee(data) {
  return api(`${METHOD}.create_fee`, { data });
}

export function updateFee(name, data) {
  return api(`${METHOD}.update_fee`, { name, data });
}

export function deleteFee(name) {
  return api(`${METHOD}.delete_fee`, { name });
}

export function submitFee(name) {
  return api(`${METHOD}.submit_fee`, { name });
}

export function cancelFee(name) {
  return api(`${METHOD}.cancel_fee`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getProgramEnrollments() {
  return api(`${METHOD}.get_program_enrollments`);
}

export function getFeeStructures() {
  return api(`${METHOD}.get_fee_structures`);
}

export function getFeeCategories() {
  return api(`${METHOD}.get_fee_categories`);
}

export function getStudentCategories() {
  return api(`${METHOD}.get_student_categories`);
}

export function getStudentBatches() {
  return api(`${METHOD}.get_student_batches`);
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`);
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, { academic_year });
}

export function getCompanies() {
  return api(`${METHOD}.get_companies`);
}

export function getReceivableAccounts(company) {
  return api(`${METHOD}.get_receivable_accounts`, { company });
}

export function getIncomeAccounts(company) {
  return api(`${METHOD}.get_income_accounts`, { company });
}

export function getCostCenters(company) {
  return api(`${METHOD}.get_cost_centers`, { company });
}

export function getLetterHeads() {
  return api(`${METHOD}.get_letter_heads`);
}

export function getPrintHeadings() {
  return api(`${METHOD}.get_print_headings`);
}

// services/feeStructureService.js
import api from "./api";

const METHOD = "education_extension.staff_portal_api.fee_structure_api";

export function getFeeStructures({
  page = 1,
  search = "",
  program = "",
  academic_year = "",
  pageSize = 20,
} = {}) {
  return api(`${METHOD}.get_fee_structures`, {
    page,
    page_size: pageSize,
    search: search || undefined,
    program: program || undefined,
    academic_year: academic_year || undefined,
  });
}

export function getFeeStructure(name) {
  return api(`${METHOD}.get_fee_structure`, {
    name,
  });
}

export function createFeeStructure(data) {
  return api(`${METHOD}.create_fee_structure`, {
    data,
  });
}

export function updateFeeStructure(name, data) {
  return api(`${METHOD}.update_fee_structure`, {
    name,
    data,
  });
}

export function deleteFeeStructure(name) {
  return api(`${METHOD}.delete_fee_structure`, {
    name,
  });
}

export function submitFeeStructure(name) {
  return api(`${METHOD}.submit_fee_structure`, {
    name,
  });
}

export function cancelFeeStructure(name) {
  return api(`${METHOD}.cancel_fee_structure`, {
    name,
  });
}

export function getPrograms() {
  return api(`${METHOD}.get_programs`, {});
}

export function getAcademicYears() {
  return api(`${METHOD}.get_academic_years`, {});
}

export function getAcademicTerms(academic_year) {
  return api(`${METHOD}.get_academic_terms`, {
    academic_year,
  });
}

export function getStudentCategories() {
  return api(`${METHOD}.get_student_categories`, {});
}

export function getFeeCategories() {
  return api(`${METHOD}.get_fee_categories`, {});
}

export function getCompanies() {
  return api(`${METHOD}.get_companies`, {});
}

export function getReceivableAccounts(company) {
  return api(`${METHOD}.get_receivable_accounts`, {
    company,
  });
}

export function getCostCenters(company) {
  return api(`${METHOD}.get_cost_centers`, {
    company,
  });
}
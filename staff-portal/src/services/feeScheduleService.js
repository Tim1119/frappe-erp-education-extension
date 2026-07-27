// services/feeScheduleService.js
import api from "./api";

const METHOD = "education_extension.staff_portal_api.fee_schedule_api";

export function getFeeSchedules({
  page = 1,
  search = "",
  fee_structure = "",
  program = "",
  status = "",
  academic_year = "",
  academic_term = "",
  student_category = "",
  pageSize = 20,
} = {}) {
  return api(`${METHOD}.get_fee_schedules`, {
    page,
    page_size: pageSize,
    search: search || undefined,
    fee_structure: fee_structure || undefined,
    program: program || undefined,
    status: status || undefined,
    academic_year: academic_year || undefined,
    academic_term: academic_term || undefined,
    student_category: student_category || undefined,
  });
}

export function getFeeSchedule(name) {
  return api(`${METHOD}.get_fee_schedule`, {
    name,
  });
}

export function createFeeSchedule(data) {
  return api(`${METHOD}.create_fee_schedule`, {
    data,
  });
}

export function updateFeeSchedule(name, data) {
  return api(`${METHOD}.update_fee_schedule`, {
    name,
    data,
  });
}

export function deleteFeeSchedule(name) {
  return api(`${METHOD}.delete_fee_schedule`, {
    name,
  });
}

export function submitFeeSchedule(name) {
  return api(`${METHOD}.submit_fee_schedule`, {
    name,
  });
}

export function cancelFeeSchedule(name) {
  return api(`${METHOD}.cancel_fee_schedule`, {
    name,
  });
}

export function generateFees(name) {
  return api(`${METHOD}.generate_fees`, {
    name,
  });
}

export function getFeeStructures() {
  return api(`${METHOD}.get_fee_structures`, {});
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

export function getStudentGroups({
  program,
  academic_year,
  academic_term,
} = {}) {
  return api(`${METHOD}.get_student_groups`, {
    program: program || undefined,
    academic_year: academic_year || undefined,
    academic_term: academic_term || undefined,
  });
}

export function getTotalStudents(student_group, academic_year, academic_term) {
  return api(`${METHOD}.get_total_students`, {
    student_group,
    academic_year,
    academic_term: academic_term || undefined,
  });
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
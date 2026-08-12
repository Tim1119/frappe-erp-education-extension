// services/feeCategoryService.js
import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.fee_category_api";

export function getFeeCategories({
  page = 1,
  search = "",
  pageSize = 20,
} = {}) {
  return api(`${METHOD}.get_fee_categories`, {
    page,
    page_size: pageSize,
    search: search || undefined,
  });
}

export function getFeeCategory(name) {
  return api(`${METHOD}.get_fee_category`, {
    name,
  });
}

export function createFeeCategory(data) {
  return api(`${METHOD}.create_fee_category`, {
    data,
  });
}

export function updateFeeCategory(name, data) {
  return api(`${METHOD}.update_fee_category`, {
    name,
    data,
  });
}

export function deleteFeeCategory(name) {
  return api(`${METHOD}.delete_fee_category`, {
    name,
  });
}

export function getCompanies() {
  return api(`${METHOD}.get_companies`, {});
}

export function getAccounts(company) {
  return api(`${METHOD}.get_accounts`, {
    company,
  });
}

export function getCostCenters(company) {
  return api(`${METHOD}.get_cost_centers`, {
    company,
  });
}
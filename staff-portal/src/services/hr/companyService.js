import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api.hr";

export function getCompanies(params = {}) {
  return callMethod(`${NS}.company_api.get_companies`, params);
}

export function getCompany(name) {
  return callMethod(`${NS}.company_api.get_company`, { name });
}

export function createCompany(data) {
  return callMethod(`${NS}.company_api.create_company`, { data });
}

export function updateCompany(name, data) {
  return callMethod(`${NS}.company_api.update_company`, { name, data });
}

export function deleteCompany(name) {
  return callMethod(`${NS}.company_api.delete_company`, { name });
}

export function getCompanyConnections(company) {
  return callMethod(`${NS}.company_api.get_connections`, { company });
}

export function getCurrencies() {
  return callMethod(`${NS}.company_api.get_currencies`);
}

export function getCountries() {
  return callMethod(`${NS}.company_api.get_countries`);
}

export function getParentCompanies() {
  return callMethod(`${NS}.company_api.get_parent_companies`);
}

export function getDomains() {
  return callMethod(`${NS}.company_api.get_domains`);
}

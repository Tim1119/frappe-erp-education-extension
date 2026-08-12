import api from "./api";

const METHOD = "education_extension.staff_portal_api.education.school_settings_api";

export function getSchoolSettings() {
  return api(`${METHOD}.get_school_settings`);
}

export function updateSchoolSettings(data) {
  return api(`${METHOD}.update_school_settings`, { data });
}

export function getCompanies() {
  return api(`${METHOD}.get_companies`);
}

export function getPrintFormats() {
  return api(`${METHOD}.get_print_formats`);
}

// services/guardianService.js
import api from "./api";

const METHOD = "education_extension.staff_portal_api.guardian_api";

export function getGuardians({
  page = 1,
  search = "",
  pageSize = 20,
} = {}) {
  return api(`${METHOD}.get_guardians`, {
    page,
    page_size: pageSize,
    search: search || undefined,
  });
}

export function getGuardian(name) {
  return api(`${METHOD}.get_guardian`, {
    name,
  });
}

export function createGuardian(data) {
  return api(`${METHOD}.create_guardian`, {
    data,
  });
}

export function updateGuardian(name, data) {
  return api(`${METHOD}.update_guardian`, {
    name,
    data,
  });
}

export function deleteGuardian(name) {
  return api(`${METHOD}.delete_guardian`, {
    name,
  });
}

export function getStudents() {
  return api(`${METHOD}.get_students`, {});
}
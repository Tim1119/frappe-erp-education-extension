// services/classroomService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api";

export function getClassrooms(params = {}) {
  return callMethod(`${NS}.classroom_api.get_classrooms`, params);
}

export function getClassroom(name) {
  return callMethod(`${NS}.classroom_api.get_classroom`, { name });
}

export function createClassroom(data) {
  return callMethod(`${NS}.classroom_api.create_classroom`, { data });
}

export function updateClassroom(name, data) {
  return callMethod(`${NS}.classroom_api.update_classroom`, { name, data });
}

export function deleteClassroom(name) {
  return callMethod(`${NS}.classroom_api.delete_classroom`, { name });
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.classroom_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
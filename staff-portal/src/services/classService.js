// services/classService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api";

export function getClasses(params = {}) {
  return callMethod(`${NS}.class_api.get_classes`, params);
}

export function getClass(name) {
  return callMethod(`${NS}.class_api.get_class`, { name });
}

export function getClassConnections(program) {
  return callMethod(`${NS}.class_api.get_class_connections`, { program });
}

export function createClass(data) {
  return callMethod(`${NS}.class_api.create_class`, { data });
}

export function updateClass(name, data) {
  return callMethod(`${NS}.class_api.update_class`, { name, data });
}

export function deleteClass(name) {
  return callMethod(`${NS}.class_api.delete_class`, { name });
}

export function getDepartments() {
  return callMethod(`${NS}.class_api.get_departments`, {});
}

export function getCourses() {
  return callMethod(`${NS}.class_api.get_courses`, {});
}

export function getPrograms() {
  return callMethod(`${NS}.class_api.get_programs`, {});
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.class_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
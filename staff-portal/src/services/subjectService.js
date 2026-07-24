// services/subjectService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api";

export function getSubjects(params = {}) {
  return callMethod(`${NS}.subject_api.get_subjects`, params);
}

export function getSubject(name) {
  return callMethod(`${NS}.subject_api.get_subject`, { name });
}

export function getSubjectConnections(course) {
  return callMethod(`${NS}.subject_api.get_subject_connections`, { course });
}

export function createSubject(data) {
  return callMethod(`${NS}.subject_api.create_subject`, { data });
}

export function updateSubject(name, data) {
  return callMethod(`${NS}.subject_api.update_subject`, { name, data });
}

export function deleteSubject(name) {
  return callMethod(`${NS}.subject_api.delete_subject`, { name });
}

export function createTopic(data) {
  return callMethod(`${NS}.subject_api.create_topic`, { data });
}

export function createAssessmentCriteria(data) {
  return callMethod(`${NS}.subject_api.create_assessment_criteria`, { data });
}

export function getDepartments() {
  return callMethod(`${NS}.subject_api.get_departments`, {});
}

export function getTopics() {
  return callMethod(`${NS}.subject_api.get_topics`, {});
}

export function getGradingScales() {
  return callMethod(`${NS}.subject_api.get_grading_scales`, {});
}

export function getAssessmentCriteria() {
  return callMethod(`${NS}.subject_api.get_assessment_criteria`, {});
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.subject_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
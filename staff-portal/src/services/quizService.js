// services/quizService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api";

// Quiz endpoints
export function getQuizzes(params = {}) {
  return callMethod(`${NS}.quiz_api.get_quizzes`, params);
}

export function getQuiz(name) {
  return callMethod(`${NS}.quiz_api.get_quiz`, { name });
}

export function createQuiz(data) {
  return callMethod(`${NS}.quiz_api.create_quiz`, { data });
}

export function updateQuiz(name, data) {
  return callMethod(`${NS}.quiz_api.update_quiz`, { name, data });
}

export function deleteQuiz(name) {
  return callMethod(`${NS}.quiz_api.delete_quiz`, { name });
}

// Question endpoints (for dropdowns)
export function getQuestions() {
  return callMethod(`${NS}.quiz_api.get_questions`, {});
}

export function createQuestion(data) {
  return callMethod(`${NS}.quiz_api.create_question`, { data });
}

export function updateQuestion(name, data) {
  return callMethod(`${NS}.quiz_api.update_question`, { name, data });
}

export function deleteQuestion(name) {
  return callMethod(`${NS}.quiz_api.delete_question`, { name });
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.quiz_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
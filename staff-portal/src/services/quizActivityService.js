import api from "./api";

const METHOD = "education_extension.staff_portal_api.quiz_activity_api";

export function getQuizActivities(params) {
  return api(`${METHOD}.get_quiz_activities`, params);
}

export function getQuizActivity(name) {
  return api(`${METHOD}.get_quiz_activity`, { name });
}

export function deleteQuizActivity(name) {
  return api(`${METHOD}.delete_quiz_activity`, { name });
}

export function getStudents() {
  return api(`${METHOD}.get_students`);
}

export function getCourses() {
  return api(`${METHOD}.get_courses`);
}

export function getQuizzes() {
  return api(`${METHOD}.get_quizzes`);
}

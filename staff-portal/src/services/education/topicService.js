// services/topicService.js
import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.education";

export function getTopics(params = {}) {
  return callMethod(`${NS}.topic_api.get_topics`, params);
}

export function getTopic(name) {
  return callMethod(`${NS}.topic_api.get_topic`, { name });
}

export function createTopic(data) {
  return callMethod(`${NS}.topic_api.create_topic`, { data });
}

export function updateTopic(name, data) {
  return callMethod(`${NS}.topic_api.update_topic`, { name, data });
}

export function deleteTopic(name) {
  return callMethod(`${NS}.topic_api.delete_topic`, { name });
}

export function getSubjectsWithoutTopic(topic) {
  return callMethod(`${NS}.topic_api.get_courses_without_topic`, { topic });
}

export function addTopicToSubjects(topic, subjects) {
  return callMethod(`${NS}.topic_api.add_topic_to_courses`, { 
    topic, 
    courses: JSON.stringify(subjects) 
  });
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.topic_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
// services/articleService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api";

export function getArticles(params = {}) {
  return callMethod(`${NS}.article_api.get_articles`, params);
}

export function getArticle(name) {
  return callMethod(`${NS}.article_api.get_article`, { name });
}

export function createArticle(data) {
  return callMethod(`${NS}.article_api.create_article`, { data });
}

export function updateArticle(name, data) {
  return callMethod(`${NS}.article_api.update_article`, { name, data });
}

export function deleteArticle(name) {
  return callMethod(`${NS}.article_api.delete_article`, { name });
}

export function getTopics() {
  return callMethod(`${NS}.article_api.get_topics`, {});
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.article_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
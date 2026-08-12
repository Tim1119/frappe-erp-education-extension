// services/videoService.js
import { callMethod } from "./frappeClient";

const NS = "education_extension.staff_portal_api.education";

export function getVideos(params = {}) {
  return callMethod(`${NS}.video_api.get_videos`, params);
}

export function getVideo(name) {
  return callMethod(`${NS}.video_api.get_video`, { name });
}

export function createVideo(data) {
  return callMethod(`${NS}.video_api.create_video`, { data });
}

export function updateVideo(name, data) {
  return callMethod(`${NS}.video_api.update_video`, { name, data });
}

export function deleteVideo(name) {
  return callMethod(`${NS}.video_api.delete_video`, { name });
}

export function getVideoProviders() {
  return callMethod(`${NS}.video_api.get_video_providers`, {});
}

export function getDoctypeCount(doctype, filters) {
  return callMethod(`${NS}.video_api.get_doctype_count`, {
    doctype,
    filters: filters || {},
  });
}
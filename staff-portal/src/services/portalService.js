import api from "./api";

const METHOD = "education_extension.staff_portal_api.portal_api";
// const METHOD = "education_extension.education_extension.staff_portal_api.portal_api";

/**
 * Returns the logged-in user's portal context:
 *   { role, instructor, school_name, school_abbreviation, school_logo }
 */
export function getPortalContext() {
  return api(`${METHOD}.get_portal_context`);
}

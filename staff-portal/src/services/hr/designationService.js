import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.designation_api";

export const getDesignations = (params = {}) => callMethod(`${NS}.get_designations`, params);
export const getDesignation = (name) => callMethod(`${NS}.get_designation`, { name });
export const createDesignation = (data) => callMethod(`${NS}.create_designation`, { data });
export const updateDesignation = (name, data) => callMethod(`${NS}.update_designation`, { name, data });
export const deleteDesignation = (name) => callMethod(`${NS}.delete_designation`, { name });
export const getDesignationConnections = (designation) => callMethod(`${NS}.get_connections`, { designation });
export const getAppraisalTemplates = () => callMethod(`${NS}.get_appraisal_templates`);
export const getSkills = () => callMethod(`${NS}.get_skills`);

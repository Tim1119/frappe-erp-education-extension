import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.department_api";

export const getDepartments = (params = {}) => callMethod(`${NS}.get_departments`, params);
export const getDepartment = (name) => callMethod(`${NS}.get_department`, { name });
export const createDepartment = (data) => callMethod(`${NS}.create_department`, { data });
export const updateDepartment = (name, data) => callMethod(`${NS}.update_department`, { name, data });
export const deleteDepartment = (name) => callMethod(`${NS}.delete_department`, { name });
export const getDepartmentConnections = (department) => callMethod(`${NS}.get_connections`, { department });
export const getCompanies = () => callMethod(`${NS}.get_companies`);
export const getParentDepartments = () => callMethod(`${NS}.get_parent_departments`);

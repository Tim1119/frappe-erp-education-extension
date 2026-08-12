import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.employee_group_api";
export const getEmployeeGroups = (params = {}) => callMethod(`${NS}.get_employee_groups`, params);
export const getEmployeeGroup = (name) => callMethod(`${NS}.get_employee_group`, { name });
export const createEmployeeGroup = (data) => callMethod(`${NS}.create_employee_group`, { data });
export const updateEmployeeGroup = (name, data) => callMethod(`${NS}.update_employee_group`, { name, data });
export const deleteEmployeeGroup = (name) => callMethod(`${NS}.delete_employee_group`, { name });
export const getEmployeeGroupEmployees = () => callMethod(`${NS}.get_employees`);

import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.employee_api";
export const getEmployees = (params = {}) => callMethod(`${NS}.get_employees`, params);
export const getEmployee = (name) => callMethod(`${NS}.get_employee`, { name });
export const getEmployeeMeta = () => callMethod(`${NS}.get_employee_meta`);
export const createEmployee = (data) => callMethod(`${NS}.create_employee`, { data });
export const updateEmployee = (name, data) => callMethod(`${NS}.update_employee`, { name, data });
export const deleteEmployee = (name) => callMethod(`${NS}.delete_employee`, { name });
export const getEmployeeLinkOptions = (doctype) => callMethod(`${NS}.get_link_options`, { doctype });
export const getEmployeeDepartments = (company) => callMethod(`${NS}.get_departments`, { company });
export const getReportsTo = (employee) => callMethod(`${NS}.get_reports_to`, { employee });
export const getEmployeeUsers = () => callMethod(`${NS}.get_users`);
export const getPayrollCostCenters = (company) => callMethod(`${NS}.get_payroll_cost_centers`, { company });
export const getEmployeeConnections = (employee) => callMethod(`${NS}.get_connections`, { employee });

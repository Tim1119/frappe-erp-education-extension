import { callMethod } from "../frappeClient";

const N = "education_extension.staff_portal_api.hr.employee_advance_api";

export const getEmployeeAdvances = (params = {}) => callMethod(`${N}.get_employee_advances`, params);
export const getEmployeeAdvance = (name) => callMethod(`${N}.get_employee_advance`, { name });
export const createEmployeeAdvance = (data) => callMethod(`${N}.create_employee_advance`, { data });
export const updateEmployeeAdvance = (name, data) => callMethod(`${N}.update_employee_advance`, { name, data });
export const deleteEmployeeAdvance = (name) => callMethod(`${N}.delete_employee_advance`, { name });
export const submitEmployeeAdvance = (name) => callMethod(`${N}.submit_employee_advance`, { name });
export const cancelEmployeeAdvance = (name) => callMethod(`${N}.cancel_employee_advance`, { name });

export const getEmployeeAdvanceEmployees = () => callMethod(`${N}.get_employees`);
export const getEmployeeAdvanceOptions = (doctype) => callMethod(`${N}.get_options`, { doctype });
export const getEmployeeAdvanceAccounts = (company, currency) => callMethod(`${N}.get_advance_accounts`, { company, currency });
export const getEmployeeAdvanceDefaultAccount = (company) => callMethod(`${N}.get_default_advance_account`, { company });
export const getEmployeeAdvanceCompanyCurrency = (company) => callMethod(`${N}.get_company_currency`, { company });
export const getEmployeeAdvanceEmployeeCurrency = (employee, company) => callMethod(`${N}.get_employee_currency`, { employee, company });
export const getEmployeeAdvanceExchangeRate = (from_currency, to_currency) => callMethod(`${N}.get_advance_exchange_rate`, { from_currency, to_currency });

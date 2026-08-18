import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.employee_lifecycle.daily_work_summary_api";

export const getDailyWorkSummaries = (params = {}) => callMethod(`${NS}.get_list`, params);
export const getDailyWorkSummary = (name) => callMethod(`${NS}.get_single`, { name });
export const getDailyWorkSummaryGroups = () => callMethod(`${NS}.get_groups`);

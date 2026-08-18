import { callMethod } from "../frappeClient";
const NS="education_extension.staff_portal_api.shift_attendance.shift_assignment_tool_api";
export const getEmployees=params=>callMethod(`${NS}.get_employees`,params);export const bulkAssign=data=>callMethod(`${NS}.bulk_assign`,{data});export const getShiftRequests=params=>callMethod(`${NS}.get_shift_requests`,params);export const processRequests=(names,status)=>callMethod(`${NS}.process_requests`,{names,status});

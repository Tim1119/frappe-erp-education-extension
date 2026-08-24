import { callMethod } from "../../frappeClient";
const NS = "education_extension.staff_portal_api.hr.leaves.leave_type_api";
export const getLeaveTypes = (params={}) => callMethod(`${NS}.get_leave_types`, params);
export const getLeaveType = name => callMethod(`${NS}.get_leave_type`, {name});
export const createLeaveType = data => callMethod(`${NS}.create_leave_type`, {data});
export const updateLeaveType = (name,data) => callMethod(`${NS}.update_leave_type`, {name,data});
export const deleteLeaveType = name => callMethod(`${NS}.delete_leave_type`, {name});
export const getLeaveTypeOptions = () => callMethod(`${NS}.get_options`);
export const getLeaveTypeConnections = name => callMethod(`${NS}.get_connections`, {name});

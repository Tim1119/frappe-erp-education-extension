import { callMethod } from "../../frappeClient";
const NS = "education_extension.staff_portal_api.hr.leaves.leave_block_list_api";
export const getLeaveBlockLists = (params={}) => callMethod(`${NS}.get_leave_block_lists`, params);
export const getLeaveBlockList = name => callMethod(`${NS}.get_leave_block_list`, {name});
export const createLeaveBlockList = data => callMethod(`${NS}.create_leave_block_list`, {data});
export const updateLeaveBlockList = (name,data) => callMethod(`${NS}.update_leave_block_list`, {name,data});
export const deleteLeaveBlockList = name => callMethod(`${NS}.delete_leave_block_list`, {name});
export const getLeaveBlockListOptions = () => callMethod(`${NS}.get_options`);
export const getLeaveBlockListConnections = name => callMethod(`${NS}.get_connections`, {name});

import { callMethod } from "../frappeClient";

const NS = "education_extension.staff_portal_api.hr.branch_api";

export const getBranches = (params = {}) => callMethod(`${NS}.get_branches`, params);
export const getBranch = (name) => callMethod(`${NS}.get_branch`, { name });
export const createBranch = (data) => callMethod(`${NS}.create_branch`, { data });
export const deleteBranch = (name) => callMethod(`${NS}.delete_branch`, { name });
export const getBranchConnections = (branch) => callMethod(`${NS}.get_connections`, { branch });

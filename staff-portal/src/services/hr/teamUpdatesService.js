import { callMethod } from "../frappeClient";
const NS = "education_extension.staff_portal_api.hr.team_updates_api";
export const getTeamUpdates = (params = {}) => callMethod(`${NS}.get_team_updates`, params);
export const getTeamUpdateSenders = () => callMethod(`${NS}.get_senders`);

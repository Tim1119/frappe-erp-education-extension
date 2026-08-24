import { callMethod } from "../../frappeClient";
const NS="education_extension.staff_portal_api.hr.performance.energy_point_log_api";
export const getEnergyPointLogs=params=>callMethod(`${NS}.get_energy_point_logs`,params||{});
export const getEnergyPointLog=name=>callMethod(`${NS}.get_energy_point_log`,{name});
export const getEnergyPointLogConnections=name=>callMethod(`${NS}.get_connections`,{name});

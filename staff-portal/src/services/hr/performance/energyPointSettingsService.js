import { callMethod } from "../../frappeClient";
const NS="education_extension.staff_portal_api.hr.performance.energy_point_settings_api";
export const getEnergyPointSettings=()=>callMethod(`${NS}.get_energy_point_settings`);
export const updateEnergyPointSettings=data=>callMethod(`${NS}.update_energy_point_settings`,{data});
export const getEnergyPointSettingsOptions=()=>callMethod(`${NS}.get_options`);
export const giveReviewPoints=(user,points)=>callMethod(`${NS}.give_review_points`,{user,points});

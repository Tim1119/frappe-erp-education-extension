import { callMethod } from "../../frappeClient";
const NS="education_extension.staff_portal_api.hr.performance.kra_api";
export const getKRAs=params=>callMethod(`${NS}.get_kras`,params||{});
export const getKRA=name=>callMethod(`${NS}.get_kra`,{name});
export const createKRA=data=>callMethod(`${NS}.create_kra`,{data});
export const updateKRA=(name,data)=>callMethod(`${NS}.update_kra`,{name,data});
export const deleteKRA=name=>callMethod(`${NS}.delete_kra`,{name});
export const getKRAOptions=()=>callMethod(`${NS}.get_options`);
export const getKRAConnections=name=>callMethod(`${NS}.get_connections`,{name});

import { callMethod } from "../frappeClient";
const NS="education_extension.staff_portal_api.buying.buying_settings_api";
export const get=()=>callMethod(`${NS}.get`);
export const update=data=>callMethod(`${NS}.update`,{data});

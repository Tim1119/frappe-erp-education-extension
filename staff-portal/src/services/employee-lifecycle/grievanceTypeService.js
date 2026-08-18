import { callMethod } from "../frappeClient";
const NS="education_extension.staff_portal_api.employee_lifecycle.grievance_type_api";
export const getList=(params={})=>callMethod(`${NS}.get_list`,params); export const getSingle=name=>callMethod(`${NS}.get_single`,{name}); export const create=data=>callMethod(`${NS}.create`,{data}); export const update=(name,data)=>callMethod(`${NS}.update`,{name,data}); export const remove=name=>callMethod(`${NS}.delete`,{name}); export const getConnections=name=>callMethod(`${NS}.get_connections`,{name});

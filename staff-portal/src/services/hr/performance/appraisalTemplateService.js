import { callMethod } from "../../frappeClient";
const NS="education_extension.staff_portal_api.hr.performance.appraisal_template_api";
export const getAppraisalTemplates=params=>callMethod(`${NS}.get_appraisal_templates`,params||{});
export const getAppraisalTemplate=name=>callMethod(`${NS}.get_appraisal_template`,{name});
export const createAppraisalTemplate=data=>callMethod(`${NS}.create_appraisal_template`,{data});
export const updateAppraisalTemplate=(name,data)=>callMethod(`${NS}.update_appraisal_template`,{name,data});
export const deleteAppraisalTemplate=name=>callMethod(`${NS}.delete_appraisal_template`,{name});
export const getAppraisalTemplateOptions=()=>callMethod(`${NS}.get_options`);
export const getAppraisalTemplateConnections=name=>callMethod(`${NS}.get_connections`,{name});

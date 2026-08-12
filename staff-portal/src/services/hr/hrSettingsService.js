import { callMethod } from "../frappeClient";
const NS = "education_extension.staff_portal_api.hr.hr_settings_api";
export const getHRSettings = () => callMethod(`${NS}.get_hr_settings`);
export const updateHRSettings = (data) => callMethod(`${NS}.update_hr_settings`, { data });
export const getHRSettingsRoles = () => callMethod(`${NS}.get_roles`);
export const getHRSettingsEmailTemplates = () => callMethod(`${NS}.get_email_templates`);
export const getHRSettingsWebForms = () => callMethod(`${NS}.get_web_forms`);
export const getHRSettingsOutgoingEmailAccounts = () => callMethod(`${NS}.get_outgoing_email_accounts`);
export const getHRSettingsSenderEmail = (email_account) => callMethod(`${NS}.get_sender_email`, { email_account });

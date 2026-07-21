import { callMethod } from './frappeClient';

const NS = 'education_extension.staff_portal_api';

export function getClassArms(params = {}) {
  return callMethod(`${NS}.class_arms_api.get_class_arms`, params);
}

export function getClassArm(name) {
  return callMethod(`${NS}.class_arms_api.get_class_arm`, { name });
}

export function createClassArm(data) {
  return callMethod(`${NS}.class_arms_api.create_class_arm`, { data });
}

export function updateClassArm(name, data) {
  return callMethod(`${NS}.class_arms_api.update_class_arm`, { name, data });
}

export function getStudentGroupOptions() {
  return callMethod(`${NS}.class_arms_api.get_class_arm_options`);
}

export function deleteClassArm(name) {
  return callMethod(`${NS}.class_arms_api.delete_class_arm`, {
    name
  });
}
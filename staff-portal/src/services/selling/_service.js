import { callMethod } from "../frappeClient";

export function makeService(apiName) {
  const ns = `education_extension.staff_portal_api.selling.${apiName}`;
  return {
    getList: (params = {}) => callMethod(`${ns}.get_list`, params),
    getSingle: (name) => callMethod(`${ns}.get_single`, { name }),
    create: (data) => callMethod(`${ns}.create`, { data }),
    update: (name, data) => callMethod(`${ns}.update`, { name, data }),
    remove: (name) => callMethod(`${ns}.delete`, { name }),
    getConnections: (name) => callMethod(`${ns}.get_connections`, { name }),
    submit: (name) => callMethod(`${ns}.submit`, { name }),
    cancel: (name) => callMethod(`${ns}.cancel`, { name }),
    getLookupOptions: (doctype, filters = {}) => callMethod(`${ns}.get_lookup_options`, { doctype, filters }),
    getEmployeeDetails: (employee) => callMethod(`${ns}.get_employee_details`, { employee }),
    getLinkedDetails: (linked_doctype, name, fields) => callMethod(`${ns}.get_linked_details`, { linked_doctype, name, fields }),
    getDefaultCompany: () => callMethod(`${ns}.get_default_company`),
    getWarehouses: (company) => callMethod(`${ns}.get_warehouses`, { company }),
  };
}

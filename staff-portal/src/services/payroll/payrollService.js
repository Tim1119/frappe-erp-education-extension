import { callMethod } from "../frappeClient";

export function payrollService(api) {
  const namespace = `education_extension.staff_portal_api.payroll.${api}_api`;
  return {
    getList: (params = {}) => callMethod(`${namespace}.get_list`, params),
    getSingle: (name) => callMethod(`${namespace}.get_single`, { name }),
    create: (data) => callMethod(`${namespace}.create`, { data }),
    update: (name, data) => callMethod(`${namespace}.update`, { name, data }),
    remove: (name) => callMethod(`${namespace}.delete`, { name }),
    submit: (name) => callMethod(`${namespace}.submit`, { name }),
    cancel: (name) => callMethod(`${namespace}.cancel`, { name }),
    getConnections: (name) => callMethod(`${namespace}.get_connections`, { name }),
    getLookupOptions: (doctype, filters) => callMethod(`${namespace}.get_lookup_options`, { doctype, filters }),
    getEmployeeDetails: (employee) => callMethod(`${namespace}.get_employee_details`, { employee }),
    getLinkedDetails: (linked_doctype, name, fields) => callMethod(`${namespace}.get_linked_details`, { linked_doctype, name, fields }),
  };
}

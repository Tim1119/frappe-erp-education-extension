import { callMethod } from "../frappeClient";
import { makeService } from "./_service";
export const { getList, getSingle, create, update, remove, getConnections, submit, cancel, getLookupOptions, getEmployeeDetails, getLinkedDetails, getDefaultCompany, getWarehouses } = makeService("sales_order_api");
export const setStatus = (name, status) => callMethod("education_extension.staff_portal_api.selling.sales_order_api.set_status", { name, status });

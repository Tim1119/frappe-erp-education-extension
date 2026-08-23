import { makeService } from "./_service";
export const { getList, getSingle, create, update, remove, getConnections, submit, cancel, getLookupOptions, getEmployeeDetails, getLinkedDetails, getDefaultCompany, getWarehouses } = makeService("blanket_order_api");

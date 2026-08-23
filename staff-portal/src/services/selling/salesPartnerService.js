import { makeService } from "./_service";
export const { getList, getSingle, create, update, remove, getConnections, getLookupOptions, getEmployeeDetails, getLinkedDetails, getDefaultCompany, getWarehouses } = makeService("sales_partner_api");

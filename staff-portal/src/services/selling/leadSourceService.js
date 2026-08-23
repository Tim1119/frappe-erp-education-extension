import { makeService } from "./_service";
export const { getList, getSingle, create, update, remove, getConnections, getLookupOptions, getEmployeeDetails, getLinkedDetails, getDefaultCompany, getWarehouses } = makeService("lead_source_api");

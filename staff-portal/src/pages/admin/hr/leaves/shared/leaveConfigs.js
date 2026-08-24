import * as leaveType from "@/services/hr/leaves/leaveTypeService";
import * as leavePeriod from "@/services/hr/leaves/leavePeriodService";
import * as leavePolicy from "@/services/hr/leaves/leavePolicyService";
import * as leaveAllocation from "@/services/hr/leaves/leaveAllocationService";
import * as leavePolicyAssignment from "@/services/hr/leaves/leavePolicyAssignmentService";
import * as leaveEncashment from "@/services/hr/leaves/leaveEncashmentService";
import * as leaveBlockList from "@/services/hr/leaves/leaveBlockListService";
import * as holidayList from "@/services/hr/leaves/holidayListService";

const employeeFields = [
  {name:"employee", label:"Employee", type:"link", options:"employees", displayField:"employee_name", showId:true, required:true},
  {name:"employee_name", label:"Employee Name", readOnly:true},
  {name:"department", label:"Department", readOnly:true},
  {name:"company", label:"Company", readOnly:true},
];
const docstatus = {name:"docstatus", label:"Status", format:value=>Number(value)===1?"Submitted":Number(value)===2?"Cancelled":"Draft"};

export const leaveConfigs = {
  leaveType: {
    key:"leaveType", singular:"Leave Type", plural:"Leave Types", path:"leave-types", service:{list:leaveType.getLeaveTypes,get:leaveType.getLeaveType,create:leaveType.createLeaveType,update:leaveType.updateLeaveType,delete:leaveType.deleteLeaveType,options:leaveType.getLeaveTypeOptions,connections:leaveType.getLeaveTypeConnections},
    fields:[
      {name:"leave_type_name",label:"Leave Type Name",required:true}, {name:"max_leaves_allowed",label:"Maximum Leaves Allowed",type:"number"},
      {name:"applicable_after",label:"Applicable After (Working Days)",type:"number"}, {name:"max_continuous_days_allowed",label:"Maximum Continuous Days",type:"number"},
      {name:"is_carry_forward",label:"Allow Carry Forward",type:"check"}, {name:"is_lwp",label:"Leave Without Pay",type:"check"},
      {name:"is_compensatory",label:"Compensatory Leave",type:"check"}, {name:"include_holiday",label:"Include Holidays",type:"check"},
      {name:"allow_encashment",label:"Allow Encashment",type:"check"}, {name:"max_encashable_leaves",label:"Maximum Encashable Leaves",type:"number",show:d=>d.allow_encashment},
      {name:"non_encashable_leaves",label:"Non-encashable Leaves",type:"number",show:d=>d.allow_encashment}, {name:"earning_component",label:"Earning Component",type:"link",options:"earning_components",linkedDoctype:"Salary Component",show:d=>d.allow_encashment},
      {name:"is_earned_leave",label:"Earned Leave",type:"check"}, {name:"earned_leave_frequency",label:"Earned Leave Frequency",type:"select",values:["Monthly","Quarterly","Half-Yearly","Yearly"],show:d=>d.is_earned_leave},
      {name:"rounding",label:"Rounding",type:"select",values:["0.25","0.5","1.0"],show:d=>d.is_earned_leave}, {name:"is_optional_leave",label:"Optional Leave",type:"check"},
    ],
    columns:[{name:"name",label:"Leave Type"},{name:"max_leaves_allowed",label:"Max Leaves"},{name:"is_carry_forward",label:"Carry Forward",format:v=>v?"Yes":"No"},{name:"allow_encashment",label:"Encashment",format:v=>v?"Yes":"No"}],
    connections:[{key:"leave_allocations",label:"Leave Allocations",path:"leave-allocations",query:"leave_type"},{key:"leave_applications",label:"Leave Applications",path:"leave-applications",query:"leave_type"},{key:"leave_encashments",label:"Leave Encashments",path:"leave-encashments",query:"leave_type"}],
  },
  leavePeriod: {
    key:"leavePeriod", singular:"Leave Period", plural:"Leave Periods", path:"leave-periods", service:{list:leavePeriod.getLeavePeriods,get:leavePeriod.getLeavePeriod,create:leavePeriod.createLeavePeriod,update:leavePeriod.updateLeavePeriod,delete:leavePeriod.deleteLeavePeriod,options:leavePeriod.getLeavePeriodOptions,connections:leavePeriod.getLeavePeriodConnections,grant:leavePeriod.grantLeaves},
    fields:[{name:"company",label:"Company",type:"link",options:"companies",linkedDoctype:"Company",required:true},{name:"from_date",label:"From Date",type:"date",required:true},{name:"to_date",label:"To Date",type:"date",required:true},{name:"is_active",label:"Active",type:"check"},{name:"optional_holiday_list",label:"Optional Holiday List",type:"link",options:"holiday_lists",displayField:"holiday_list_name",linkedDoctype:"Holiday List"}],
    columns:[{name:"name",label:"Leave Period"},{name:"company",label:"Company"},{name:"from_date",label:"From Date"},{name:"to_date",label:"To Date"},{name:"is_active",label:"Active",format:v=>v?"Yes":"No"}],
    connections:[{key:"policy_assignments",label:"Policy Assignments",path:"leave-policy-assignments",query:"leave_period"},{key:"encashments",label:"Leave Encashments",path:"leave-encashments",query:"leave_period"}], profileAction:"grant",
  },
  leavePolicy: {
    key:"leavePolicy", singular:"Leave Policy", plural:"Leave Policies", path:"leave-policies", submittable:true, service:{list:leavePolicy.getLeavePolicies,get:leavePolicy.getLeavePolicy,create:leavePolicy.createLeavePolicy,update:leavePolicy.updateLeavePolicy,delete:leavePolicy.deleteLeavePolicy,submit:leavePolicy.submitLeavePolicy,cancel:leavePolicy.cancelLeavePolicy,options:leavePolicy.getLeavePolicyOptions,connections:leavePolicy.getLeavePolicyConnections},
    fields:[{name:"title",label:"Policy Title",required:true}], columns:[{name:"title",label:"Policy"},docstatus],
    tables:[{name:"leave_policy_details",label:"Leave Policy Details",required:true,fields:[{name:"leave_type",label:"Leave Type",type:"link",options:"leave_types",linkedDoctype:"Leave Type",required:true},{name:"annual_allocation",label:"Annual Allocation",type:"number",required:true}]}],
    connections:[{key:"policy_assignments",label:"Policy Assignments",path:"leave-policy-assignments",query:"leave_policy"}],
  },
  leaveAllocation: {
    key:"leaveAllocation", singular:"Leave Allocation", plural:"Leave Allocations", path:"leave-allocations", submittable:true, service:{list:leaveAllocation.getLeaveAllocations,get:leaveAllocation.getLeaveAllocation,create:leaveAllocation.createLeaveAllocation,update:leaveAllocation.updateLeaveAllocation,delete:leaveAllocation.deleteLeaveAllocation,submit:leaveAllocation.submitLeaveAllocation,cancel:leaveAllocation.cancelLeaveAllocation,options:leaveAllocation.getLeaveAllocationOptions,connections:leaveAllocation.getLeaveAllocationConnections,balance:leaveAllocation.getCurrentLeaveBalance},
    fields:[...employeeFields,{name:"leave_type",label:"Leave Type",type:"link",options:"leave_types",linkedDoctype:"Leave Type",required:true},{name:"from_date",label:"From Date",type:"date",required:true},{name:"to_date",label:"To Date",type:"date",required:true},{name:"current_balance",label:"Current Balance",readOnly:true,virtual:true},{name:"new_leaves_allocated",label:"New Leaves Allocated",type:"number",required:true},{name:"carry_forward",label:"Carry Forward",type:"check"},{name:"carry_forwarded_leaves",label:"Carry Forwarded Leaves",type:"number",readOnly:true},{name:"total_leaves_allocated",label:"Total Leaves Allocated",type:"number",readOnly:true},{name:"description",label:"Description",type:"textarea",full:true}],
    columns:[{name:"employee_name",label:"Employee"},{name:"leave_type",label:"Leave Type"},{name:"from_date",label:"From Date"},{name:"to_date",label:"To Date"},{name:"total_leaves_allocated",label:"Total"},docstatus],
    connections:[{key:"leave_applications",label:"Leave Applications",path:"leave-applications",query:"leave_allocation"}], status:r=>new Date(r.to_date)<new Date()&&Number(r.docstatus)===1?{text:"Expired",className:"badge-gray"}:null,
  },
  leavePolicyAssignment: {
    key:"leavePolicyAssignment", singular:"Leave Policy Assignment", plural:"Leave Policy Assignments", path:"leave-policy-assignments", submittable:true, service:{list:leavePolicyAssignment.getLeavePolicyAssignments,get:leavePolicyAssignment.getLeavePolicyAssignment,create:leavePolicyAssignment.createLeavePolicyAssignment,update:leavePolicyAssignment.updateLeavePolicyAssignment,delete:leavePolicyAssignment.deleteLeavePolicyAssignment,submit:leavePolicyAssignment.submitLeavePolicyAssignment,cancel:leavePolicyAssignment.cancelLeavePolicyAssignment,options:leavePolicyAssignment.getLeavePolicyAssignmentOptions,connections:leavePolicyAssignment.getLeavePolicyAssignmentConnections},
    fields:[...employeeFields,{name:"leave_policy",label:"Leave Policy",type:"link",options:"leave_policies",displayField:"title",linkedDoctype:"Leave Policy",required:true},{name:"assignment_based_on",label:"Assignment Based On",type:"select",values:["Leave Period","Joining Date"],required:true},{name:"leave_period",label:"Leave Period",type:"link",options:"leave_periods",displayField:"label",showId:true,linkedDoctype:"Leave Period",show:d=>d.assignment_based_on==="Leave Period",required:true},{name:"effective_from",label:"Effective From",type:"date",required:true,readOnly:true},{name:"effective_to",label:"Effective To",type:"date",required:true,readOnly:d=>d.assignment_based_on==="Leave Period"},{name:"carry_forward",label:"Carry Forward",type:"check"}],
    columns:[{name:"employee_name",label:"Employee"},{name:"leave_policy",label:"Policy"},{name:"effective_from",label:"Effective From"},{name:"effective_to",label:"Effective To"},docstatus], connections:[{key:"leave_allocations",label:"Leave Allocations",path:"leave-allocations",query:"leave_policy_assignment"}],
  },
  leaveEncashment: {
    key:"leaveEncashment", singular:"Leave Encashment", plural:"Leave Encashments", path:"leave-encashments", submittable:true, service:{list:leaveEncashment.getLeaveEncashments,get:leaveEncashment.getLeaveEncashment,create:leaveEncashment.createLeaveEncashment,update:leaveEncashment.updateLeaveEncashment,delete:leaveEncashment.deleteLeaveEncashment,submit:leaveEncashment.submitLeaveEncashment,cancel:leaveEncashment.cancelLeaveEncashment,options:leaveEncashment.getLeaveEncashmentOptions,connections:leaveEncashment.getLeaveEncashmentConnections,details:leaveEncashment.getEncashmentDetails},
    fields:[...employeeFields,{name:"leave_period",label:"Leave Period",type:"link",options:"leave_periods",displayField:"label",showId:true,linkedDoctype:"Leave Period",required:true},{name:"leave_type",label:"Leave Type",type:"link",options:"leave_types",linkedDoctype:"Leave Type",required:true},{name:"encashment_date",label:"Encashment Date",type:"date",required:true},{name:"leave_allocation",label:"Leave Allocation",readOnly:true},{name:"leave_balance",label:"Leave Balance",type:"number",readOnly:true},{name:"actual_encashable_days",label:"Actual Encashable Days",type:"number",readOnly:true},{name:"encashment_days",label:"Encashment Days",type:"number",required:true},{name:"encashment_amount",label:"Encashment Amount",type:"number",readOnly:true},{name:"currency",label:"Currency",readOnly:true},{name:"pay_via_payment_entry",label:"Pay via Payment Entry",type:"check"},{name:"expense_account",label:"Expense Account"},{name:"payable_account",label:"Payable Account"}],
    columns:[{name:"employee_name",label:"Employee"},{name:"leave_type",label:"Leave Type"},{name:"encashment_date",label:"Date"},{name:"encashment_days",label:"Days"},{name:"encashment_amount",label:"Amount"},docstatus],
  },
  leaveBlockList: {
    key:"leaveBlockList", singular:"Leave Block List", plural:"Leave Block Lists", path:"leave-block-lists", service:{list:leaveBlockList.getLeaveBlockLists,get:leaveBlockList.getLeaveBlockList,create:leaveBlockList.createLeaveBlockList,update:leaveBlockList.updateLeaveBlockList,delete:leaveBlockList.deleteLeaveBlockList,options:leaveBlockList.getLeaveBlockListOptions,connections:leaveBlockList.getLeaveBlockListConnections},
    fields:[{name:"leave_block_list_name",label:"Leave Block List Name",required:true},{name:"company",label:"Company",type:"link",options:"companies",linkedDoctype:"Company",required:true},{name:"applies_to_all_departments",label:"Applies to All Departments",type:"check"},{name:"leave_type",label:"Leave Type",type:"link",options:"leave_types",linkedDoctype:"Leave Type"}], columns:[{name:"leave_block_list_name",label:"Block List"},{name:"company",label:"Company"},{name:"leave_type",label:"Leave Type"}],
    tables:[{name:"leave_block_list_dates",label:"Blocked Dates",required:true,fields:[{name:"block_date",label:"Block Date",type:"date",required:true},{name:"reason",label:"Reason",required:true}]},{name:"leave_block_list_allowed",label:"Allowed Users",fields:[{name:"allow_user",label:"User",type:"link",options:"users",displayField:"full_name",linkedDoctype:"User",required:true}]}],
  },
  holidayList: {
    key:"holidayList", singular:"Holiday List", plural:"Holiday Lists", path:"holiday-lists", service:{list:holidayList.getHolidayLists,get:holidayList.getHolidayList,create:holidayList.createHolidayList,update:holidayList.updateHolidayList,delete:holidayList.deleteHolidayList,options:holidayList.getHolidayListOptions,connections:holidayList.getHolidayListConnections,weekly:holidayList.getWeeklyOffDates},
    fields:[{name:"holiday_list_name",label:"Holiday List Name",required:true},{name:"from_date",label:"From Date",type:"date",required:true},{name:"to_date",label:"To Date",type:"date",required:true},{name:"weekly_off",label:"Weekly Off",type:"select",values:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},{name:"country",label:"Country"},{name:"subdivision",label:"Subdivision"}], columns:[{name:"holiday_list_name",label:"Holiday List"},{name:"from_date",label:"From Date"},{name:"to_date",label:"To Date"},{name:"total_holidays",label:"Holidays"}],
    tables:[{name:"holidays",label:"Holidays",fields:[{name:"holiday_date",label:"Holiday Date",type:"date",required:true},{name:"description",label:"Description",required:true},{name:"weekly_off",label:"Weekly Off",type:"check"}]}], connections:[{key:"employees",label:"Employees",path:"employees",query:"holiday_list"},{key:"companies",label:"Companies",path:"companies",query:"default_holiday_list"},{key:"leave_periods",label:"Leave Periods",path:"leave-periods",query:"optional_holiday_list"}], formAction:"weekly",
  },
};

export const getLeaveConfig = key => leaveConfigs[key];

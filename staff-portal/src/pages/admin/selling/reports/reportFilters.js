const trend = [
  { name:"period",label:"Period",type:"select",options:["Monthly","Quarterly","Half-Yearly","Yearly"],default:"Monthly" },
  { name:"based_on",label:"Based On",type:"select",options:["Item","Item Group","Customer","Customer Group","Territory","Project"],default:"Item" },
  { name:"group_by",label:"Group By",type:"select",options:["Item","Customer"],default:"" },
  { name:"fiscal_year",label:"Fiscal Year",doctype:"Fiscal Year",default:"currentFiscalYear" },
  { name:"company",label:"Company",doctype:"Company",defaultFirst:true },
];
export const trendFilters=(includeClosed=false)=>includeClosed?[...trend,{name:"include_closed_orders",label:"Include Closed Orders",type:"check",default:0}]:trend;
export const analyticsFilters=[
  {name:"tree_type",label:"Tree Type",type:"select",options:["Customer Group","Customer","Item Group","Item","Territory","Order Type","Project"],default:"Customer",required:true},
  {name:"doc_type",label:"Based On",type:"select",options:["Sales Order","Delivery Note","Sales Invoice"],default:"Sales Invoice",required:true},
  {name:"value_quantity",label:"Value or Quantity",type:"select",options:["Value","Quantity"],default:"Value",required:true},
  {name:"from_date",label:"From Date",type:"date",default:"yearStart",required:true},{name:"to_date",label:"To Date",type:"date",default:"yearEnd",required:true},
  {name:"company",label:"Company",doctype:"Company",required:true},{name:"range",label:"Range",type:"select",options:["Weekly","Monthly","Quarterly","Yearly"],default:"Monthly",required:true},
  {name:"curves",label:"Curves",type:"select",options:[{value:"all",label:"All"},{value:"non-zeros",label:"Non-Zeros"},{value:"total",label:"Total Only"}],default:"all",required:true},
  {name:"show_aggregate_value_from_subsidiary_companies",label:"Show Aggregate Value from Subsidiary Companies",type:"check",default:0},
];

import { Link2 } from "lucide-react";

const SOURCES=[
  ["material_request","Material Request","material-requests"],
  ["supplier_quotation","Supplier Quotation","supplier-quotations"],
  ["purchase_order","Purchase Order","purchase-orders"],
  ["request_for_quotation","Request for Quotation","request-for-quotation"],
];

export default function PrefillSourceBanner({prefill}){
  const source=SOURCES.find(([field])=>prefill?.[field]);
  if(!source)return null;
  const[field,label,path]=source,value=prefill[field];
  return <div className="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
    <Link2 className="h-4 w-4 shrink-0"/>
    <span>Creating from{" "}<a href={`/dashboard/${path}/${encodeURIComponent(value)}`} className="font-medium underline">{label} {value}</a></span>
  </div>;
}

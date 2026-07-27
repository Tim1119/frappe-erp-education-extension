import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  // Enabled/Disabled
  ACTIVE: "success",
  INACTIVE: "secondary",
  // Workflow
  DRAFT: "secondary",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUBMITTED: "default",
  CANCELLED: "destructive",
  // Fee
  PAID: "success",
  UNPAID: "warning",
  OVERDUE: "destructive",
  "PARTIALLY PAID": "warning",
  // Attendance
  PRESENT: "success",
  ABSENT: "destructive",
  // Applicant
  APPLIED: "secondary",
  ADMITTED: "success",
  // Generic
  "1": "success",
  "0": "secondary",
};

export default function StatusBadge({ status, className }) {
  const key = String(status).toUpperCase();
  const variant = STATUS_MAP[key] || "outline";

  // Friendly label
  let label = status;
  if (status === 1 || status === "1") label = "Active";
  else if (status === 0 || status === "0") label = "Inactive";

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {String(label).toLowerCase()}
    </Badge>
  );
}

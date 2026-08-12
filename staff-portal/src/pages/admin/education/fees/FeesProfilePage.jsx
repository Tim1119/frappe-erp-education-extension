import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, CheckCircle2, Ban, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  getFee,
  deleteFee,
  submitFee,
  cancelFee,
} from "@/services/education/feesService";
import { getErrorMessage } from "@/utils/errors";
import { fmtDate } from "@/utils/format";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

// Fees has no stored status field -- fees.py's set_indicator() is a
// Desk-dashboard-only method, not a DocType field, and only ever computes
// Paid vs Unpaid from outstanding_amount. Mirrored exactly; "Overdue" is
// not part of the real controller logic and is not invented here.
function PaymentStatusBadge({ outstandingAmount }) {
  const unpaid = Number(outstandingAmount || 0) > 0;
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={
        unpaid
          ? { backgroundColor: "var(--warning-soft)", color: "var(--warning-ink)" }
          : { backgroundColor: "var(--success-soft)", color: "var(--success-ink)" }
      }
    >
      {unpaid ? "Unpaid" : "Paid"}
    </span>
  );
}

function DocStatusBadge({ docstatus }) {
  if (docstatus === 1) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--info-soft)", color: "var(--info)" }}
      >
        Submitted
      </span>
    );
  }
  if (docstatus === 2) return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function FeesProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(id);

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  function load() {
    getFee(name)
      .then(setFee)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function handleDelete() {
    try {
      await deleteFee(name);
      toast.success("Fees record deleted successfully");
      setDeleteModalOpen(false);
      navigate("/dashboard/fees");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit() {
    try {
      await submitFee(name);
      toast.success("Fees record submitted");
      setSubmitModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel() {
    try {
      await cancelFee(name);
      toast.success("Fees record cancelled");
      setCancelModalOpen(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!fee) {
    return <p className="text-muted-foreground">Fees record not found.</p>;
  }

  const isDraft = fee.docstatus === 0;
  const isSubmitted = fee.docstatus === 1;
  const isCancelled = fee.docstatus === 2;

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title={fee.student_name || fee.name}
        button={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button onClick={() => setSubmitModalOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Submit
              </Button>
            )}
            {isSubmitted && (
              <Button variant="outline" onClick={() => setCancelModalOpen(true)}>
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            {(isDraft || isCancelled) && (
              <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Student" value={fee.student_name || fee.student} />
              <Field label="Class Enrollment" value={fee.program_enrollment} />
              <Field label="Class" value={fee.program} />
              <Field label="Fee Structure" value={fee.fee_structure} />
              <Field label="Fee Schedule" value={fee.fee_schedule} />
              <Field label="Academic Year" value={fee.academic_year} />
              <Field label="Academic Term" value={fee.academic_term} />
              <Field label="Student Batch" value={fee.student_batch} />
              <Field label="Student Category" value={fee.student_category} />
              <Field label="Posting Date" value={fmtDate(fee.posting_date)} />
              <Field label="Due Date" value={fmtDate(fee.due_date)} />
              <Field label="Grand Total" value={fee.grand_total ? `₦${Number(fee.grand_total).toLocaleString()}` : "—"} />
              <Field label="Grand Total in Words" value={fee.grand_total_in_words} />
              <Field label="Outstanding Amount" value={fee.outstanding_amount ? `₦${Number(fee.outstanding_amount).toLocaleString()}` : "—"} />
              <Field label="Currency" value={fee.currency} />
              <div>
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <div className="mt-1"><PaymentStatusBadge outstandingAmount={fee.outstanding_amount} /></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1"><DocStatusBadge docstatus={fee.docstatus} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fee Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Category</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(fee.components || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.fees_category}</TableCell>
                    <TableCell className="text-muted-foreground">{row.item || "—"}</TableCell>
                    <TableCell>{row.amount ? `₦${Number(row.amount).toLocaleString()}` : "—"}</TableCell>
                    <TableCell>{row.discount || 0}%</TableCell>
                    <TableCell>{row.total ? `₦${Number(row.total).toLocaleString()}` : "—"}</TableCell>
                  </TableRow>
                ))}
                {(!fee.components || fee.components.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No components recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accounting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Institution" value={fee.company} />
              <Field label="Receivable Account" value={fee.receivable_account} />
              <Field label="Income Account" value={fee.income_account} />
              <Field label="Cost Center" value={fee.cost_center} />
              <Field label="Send Payment Request" value={fee.send_payment_request ? "Yes" : "No"} />
              <Field label="Contact Email" value={fee.contact_email} />
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete fees record for ${fee.student_name || fee.name}?`}
        description="This action cannot be undone."
      />

      <ConfirmDialog
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        title={`Submit fees record for ${fee.student_name || fee.name}?`}
        description="This creates the accounting ledger entries and may send a payment request. Most fields can no longer be edited afterward."
        confirmLabel="Submit"
        variant="default"
      />

      <ConfirmDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel fees record for ${fee.student_name || fee.name}?`}
        description="This reverses the accounting ledger entries created on submit."
        confirmLabel="Cancel Document"
        variant="destructive"
      />
    </>
  );
}

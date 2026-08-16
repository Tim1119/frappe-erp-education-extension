// Status label + color per doctype, mirroring each doctype's own Desk
// get_indicator()/status logic (see supplier_list.js, journal_entry_list.js,
// and Payment Entry's own `status` field options) so the portal's badges
// match what staff would see in the source system.
export function getDocumentStatus(doctype, row) {
  if (doctype === "Supplier" || doctype === "Customer") {
    return row.disabled ? { label: "Disabled", tone: "gray" } : { label: "Active", tone: "success" };
  }
  if (doctype === "Purchase Invoice") {
    const label = row.on_hold && Number(row.outstanding_amount) > 0 && row.docstatus === 1
      ? (row.release_date && new Date(row.release_date) > new Date() ? "Temporarily on Hold" : "On Hold")
      : (row.status || "Draft");
    const tones = {
      Paid: "success", Unpaid: "warning", Overdue: "danger", "Partly Paid": "warning",
      Return: "gray", "Debit Note Issued": "gray", "Internal Transfer": "gray",
      "On Hold": "gray", "Temporarily on Hold": "gray",
    };
    return { label, tone: tones[label] || "gray" };
  }
  if (doctype === "Payment Entry") {
    const label = row.status || (row.docstatus === 2 ? "Cancelled" : row.docstatus === 1 ? "Submitted" : "Draft");
    const tones = { Draft: "gray", Submitted: "success", Cancelled: "gray" };
    return { label, tone: tones[label] || "gray" };
  }
  if (doctype === "Journal Entry") {
    if (row.docstatus === 2) return { label: "Cancelled", tone: "gray" };
    if (row.docstatus === 1) return { label: row.voucher_type || "Submitted", tone: "info" };
    return { label: "Draft", tone: "gray" };
  }
  if (doctype === "Dunning") {
    // Mirrors dunning_list.js's get_indicator() literally -- it only ever
    // distinguishes Resolved (green) from everything else, which it always
    // labels "Unresolved" regardless of the row's actual status value.
    return row.status === "Resolved" ? { label: "Resolved", tone: "success" } : { label: "Unresolved", tone: "danger" };
  }
  return { label: row.status || "Draft", tone: "gray" };
}

export function DocumentStatusBadge({ doctype, row }) {
  const { label, tone } = getDocumentStatus(doctype, row);
  const style = tone === "gray"
    ? { backgroundColor: "var(--surface-3)", color: "var(--ink-3)" }
    : { backgroundColor: `var(--${tone}-soft)`, color: `var(--${tone}-ink)` };
  return <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold" style={style}>{label}</span>;
}

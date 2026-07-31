// Opens the standalone report print view (ReportPrintPage) in a genuinely
// new browser tab -- same mechanism Frappe Desk's own report print uses:
// a separate document with no app chrome, never constrained by the
// on-screen report table's fixed-width/overflow-x container, so wide
// tables (e.g. one column per day of the month) render at their real
// natural width instead of being scroll-clipped.
//
// Data is handed off via sessionStorage rather than a server refetch or
// URL params: window.open(url, "_blank") without noopener, same-origin,
// gives the new tab a COPY of the opener's sessionStorage at creation
// time (per the HTML living standard) -- so writing the payload here
// immediately before opening reliably reaches the new tab, with no
// second network round-trip and no risk of the data having changed
// between the two calls.
export function openReportPrintView({ title, filters = [], columns, rows }) {
  const key = `report-print:${Date.now()}:${Math.random().toString(36).slice(2)}`;

  try {
    sessionStorage.setItem(key, JSON.stringify({ title, filters, columns, rows }));
  } catch (e) {
    // sessionStorage unavailable/full -- fall back to printing the live
    // page rather than silently doing nothing.
    window.print();
    return;
  }

  const win = window.open(`/print/report?key=${encodeURIComponent(key)}`, "_blank");
  if (!win) {
    // Popup blocked -- same fallback.
    sessionStorage.removeItem(key);
    window.print();
  }
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReportPrintTable from "@/components/shared/ReportPrintTable";

// Standalone print view -- rendered as a top-level route with no
// Sidebar/Navbar/PageBreadcrumbs/AppShell around it (see App.jsx: this
// route sits outside the /dashboard AppShell tree), matching Desk's own
// separate print document. Reads its payload from sessionStorage (see
// utils/reportPrintView.js's openReportPrintView) rather than refetching
// from the server, so it shows exactly what the report page had on
// screen at the moment Print was clicked.
//
// Deliberately does NOT call window.print() automatically -- the user
// sees the full, un-clipped table first and presses Ctrl+P/Cmd+P
// themselves, same as Frappe's real print view behaves.
export default function ReportPrintPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [data, setData] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    if (!key) {
      setData(null);
      return;
    }
    const raw = sessionStorage.getItem(key);
    // TEMPORARY -- remove once the StrictMode double-invoke fix is confirmed.
    console.log("[ReportPrintPage] key:", key, "raw found:", Boolean(raw));
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch (e) {
        setData(null);
      }
    } else {
      setData(null);
    }
    // Deliberately NOT removing the key here. StrictMode double-invokes
    // effects with no cleanup function in dev (mount -> simulate-unmount
    // -> mount again, same tick, same key) -- a destructive read-then-
    // delete meant the second invocation always found nothing and
    // clobbered the correct state set by the first with null. sessionStorage
    // doesn't need manual cleanup here anyway: it's scoped to the opener
    // tab and disappears when that tab closes, so leaving a few small,
    // uniquely-keyed report payloads in it for the life of the session is
    // harmless.
  }, [key]);

  if (data === undefined) return null;

  if (!data) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        No report data found for this print view -- go back to the report page and click Print again.
      </div>
    );
  }

  const summary = (data.filters || [])
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`)
    .join(" · ");

  return (
    <div className="p-6">
      {/* Scoped to this document only -- this route never renders
          alongside any other page, so this @page rule can't leak into
          any other report's print job. size: landscape (no fixed paper
          size) is the right general default for a mechanism any report
          can use; the user's own print dialog still lets them pick a
          larger physical sheet (e.g. A3) if a specific report's real
          column count needs it. */}
      <style>{`
        @page {
          size: landscape;
          margin: 10mm;
        }
      `}</style>

      <h1 className="mb-1 text-lg font-semibold">{data.title}</h1>
      {summary && <p className="mb-4 text-sm text-muted-foreground">{summary}</p>}

      <ReportPrintTable columns={data.columns || []} rows={data.rows || []} />
    </div>
  );
}

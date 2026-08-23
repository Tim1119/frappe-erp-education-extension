import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageBreadcrumbs from "./PageBreadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden below lg */}
      <div className="no-print hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="no-print w-[260px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="no-print">
          <Navbar onMobileMenuToggle={() => setMobileOpen(true)} />
        </div>

        {/* A Radix ScrollArea viewport inserts an intrinsic-width table-like
            wrapper around its children. Wide report tables then make the
            entire page wider before their own horizontal scroller can take
            over. Keep page scrolling vertical/native; report tables manage
            their horizontal overflow locally. */}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <main className="mx-auto min-w-0 w-full max-w-7xl p-4 sm:p-6">
            <div className="no-print">
              <PageBreadcrumbs />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

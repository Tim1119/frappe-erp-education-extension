import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageBreadcrumbs from "./PageBreadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden below lg */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMobileMenuToggle={() => setMobileOpen(true)} />

        <ScrollArea className="flex-1">
          <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
            <PageBreadcrumbs />
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}

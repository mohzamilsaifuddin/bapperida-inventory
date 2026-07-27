"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export function DashboardLayoutClient({
  children,
  role,
  nama,
}: {
  children: React.ReactNode;
  role: string;
  nama: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out flex-shrink-0 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <Sidebar
          role={role}
          nama={nama}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden w-full">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-150 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile only */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center justify-center md:hidden"
              title="Buka Menu"
            >
              <Menu size={22} />
            </button>
            <span className="text-sm font-semibold text-slate-700 md:font-medium md:text-slate-500">
              Sistem Inventaris BAPPERIDA
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}



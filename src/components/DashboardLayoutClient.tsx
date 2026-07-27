"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar wrapper with animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } relative flex-shrink-0`}
      >
        <Sidebar role={role} nama={nama} isCollapsed={isCollapsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar with Toggle Button */}
        <header className="bg-white border-b border-slate-150 h-16 flex items-center px-6 sticky top-0 z-10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center justify-center"
            title={isCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

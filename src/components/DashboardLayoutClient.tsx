"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

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
        <Sidebar
          role={role}
          nama={nama}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar (without Toggle Button, clean header) */}
        <header className="bg-white border-b border-slate-150 h-16 flex items-center px-6 sticky top-0 z-10">
          <span className="text-sm font-medium text-slate-500">Sistem Inventaris BAPPERIDA</span>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}


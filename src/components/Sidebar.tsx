"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  LineChart, 
  FileText, 
  DoorOpen,
  FolderOpen
} from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar({ 
  role, 
  nama, 
  isCollapsed = false 
}: { 
  role: string; 
  nama: string; 
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PETUGAS", "PIMPINAN"] },
    { name: "Kategori", href: "/dashboard/kategori", icon: FolderOpen, roles: ["ADMIN"] },
    { name: "Master Barang", href: "/dashboard/barang", icon: Package, roles: ["ADMIN"] },
    { name: "Barang Masuk", href: "/dashboard/barang-masuk", icon: ArrowRightLeft, roles: ["ADMIN", "PETUGAS"] },
    { name: "Barang Keluar", href: "/dashboard/barang-keluar", icon: ArrowRightLeft, roles: ["ADMIN", "PETUGAS"] },
    { name: "Prediksi Stok", href: "/dashboard/prediksi", icon: LineChart, roles: ["ADMIN", "PETUGAS", "PIMPINAN"] },
    { name: "Laporan", href: "/dashboard/laporan", icon: FileText, roles: ["ADMIN", "PETUGAS", "PIMPINAN"] },
  ];

  const allowedMenus = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className={`p-6 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-2">
          <Package className="text-blue-500 flex-shrink-0" size={24} />
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">Inventaris</h2>
              <p className="text-[10px] text-slate-500 mt-1">BAPPERIDA Bandar Lampung</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className={`px-4 pb-4 border-b border-slate-800 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center bg-slate-800 p-2.5 rounded-xl ${isCollapsed ? "w-10 h-10 justify-center p-0" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
            {nama.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-300">
              <p className="text-xs font-semibold text-white truncate">{nama}</p>
              <p className="text-[10px] text-blue-400 font-medium">{role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {allowedMenus.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg transition-all ${
                isCollapsed ? "justify-center p-2.5" : "gap-3 px-4 py-3"
              } ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
              {!isCollapsed && <span className="font-medium text-sm transition-opacity duration-300">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all rounded-lg ${
            isCollapsed ? "justify-center p-2.5 w-10 h-10 mx-auto" : "gap-3 px-4 py-3 w-full"
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <DoorOpen size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}


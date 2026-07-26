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

export function Sidebar({ role, nama }: { role: string; nama: string }) {
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
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="text-blue-500" />
          <span>Inventaris</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">BAPPERIDA Bandar Lampung</p>
      </div>

      <div className="px-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {nama.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{nama}</p>
            <p className="text-xs text-blue-400">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {allowedMenus.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <DoorOpen size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

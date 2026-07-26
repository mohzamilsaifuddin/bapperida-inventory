"use client";

import { Printer, Download } from "lucide-react";

export default function ClientPrintButton() {
  return (
    <>
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
      >
        <Printer size={18} />
        Cetak PDF
      </button>
      <button 
        onClick={() => {
          alert('Fitur Export Excel belum diimplementasikan di versi MVP ini. Anda dapat mencetak PDF.');
        }}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
      >
        <Download size={18} />
        Export Excel
      </button>
    </>
  );
}

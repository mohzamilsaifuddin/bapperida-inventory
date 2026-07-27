import { prisma } from "@/lib/prisma";
import { FileText, Printer, Download } from "lucide-react";
import ClientPrintButton from "./ClientPrintButton";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const filterBulan = resolvedSearchParams.bulan ? parseInt(resolvedSearchParams.bulan) : currentMonth;
  const filterTahun = resolvedSearchParams.tahun ? parseInt(resolvedSearchParams.tahun) : currentYear;

  // Set date range based on filter
  const startDate = new Date(filterTahun, filterBulan - 1, 1);
  const endDate = new Date(filterTahun, filterBulan, 0, 23, 59, 59);

  // Fetch data
  const [barangMasuk, barangKeluar] = await Promise.all([
    prisma.barangMasuk.findMany({
      where: { tanggal: { gte: startDate, lte: endDate } },
      include: { barang: true }
    }),
    prisma.barangKeluar.findMany({
      where: { tanggal: { gte: startDate, lte: endDate } },
      include: { barang: true }
    })
  ]);

  // Combine and sort
  const combinedHistory = [
    ...barangMasuk.map(bm => ({ ...bm, type: 'MASUK' })),
    ...barangKeluar.map(bk => ({ ...bk, type: 'KELUAR' }))
  ].sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

  return (
    <div className="space-y-6 print-container">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="text-blue-500" /> Laporan Transaksi
        </h1>
        <div className="flex gap-2">
          <ClientPrintButton />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
        <form className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
            <select name="bulan" defaultValue={filterBulan} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white">
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1} className="text-slate-900">{new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
            <select name="tahun" defaultValue={filterTahun} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white">
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y} className="text-slate-900">{y}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900">
            Filter Data
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden printable-area">
        <div className="p-6 border-b border-slate-100 text-center">
          <h2 className="text-2xl font-bold text-slate-800 uppercase">Laporan Inventaris BAPPERIDA</h2>
          <p className="text-slate-500">Periode: {startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-y border-slate-200">
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">No. Transaksi</th>
                <th className="px-6 py-4 font-medium">Jenis</th>
                <th className="px-6 py-4 font-medium">Barang</th>
                <th className="px-6 py-4 font-medium text-right">Jumlah</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedHistory.length > 0 ? (
                combinedHistory.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 text-sm">
                    <td className="px-6 py-4 text-slate-600">{trx.tanggal.toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{trx.nomor_transaksi}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trx.type === 'MASUK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{trx.barang.nama_barang}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {trx.type === 'MASUK' ? '+' : '-'}{trx.jumlah}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                      {trx.type === 'MASUK' ? (trx as any).supplier : (trx as any).tujuan}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add a global style tag for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

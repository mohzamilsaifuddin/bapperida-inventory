import { prisma } from "@/lib/prisma";
import { LineChart, Calculator, AlertCircle, Info, ArrowRight, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import Link from "next/link";

export default async function PrediksiPage({
  searchParams,
}: {
  searchParams: Promise<{ barang_id?: string; periode?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const barangList = await prisma.barang.findMany({
    include: { kategori: true },
    orderBy: { nama_barang: 'asc' }
  });

  const selectedBarangId = resolvedSearchParams.barang_id;
  const selectedPeriode = parseInt(resolvedSearchParams.periode || "3"); // Default 3 bulan

  // Calculate Date Limit
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - selectedPeriode);
  dateLimit.setDate(1); // Start of that month
  dateLimit.setHours(0, 0, 0, 0);

  // Fetch all transactions for bulk calculation
  const allHistoryKeluar = await prisma.barangKeluar.findMany({
    where: {
      tanggal: { gte: dateLimit }
    }
  });

  // Calculate prediction for all items
  const allPredictions = barangList.map(barang => {
    const itemHistory = allHistoryKeluar.filter(h => h.barang_id === barang.id);
    const totalDemand = itemHistory.reduce((sum, h) => sum + h.jumlah, 0);
    const maValue = totalDemand / selectedPeriode;
    const rekomendasi = Math.ceil(maValue);
    
    // Status Determination
    let status = "Aman";
    let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let statusIcon = <CheckCircle2 size={16} className="text-emerald-600" />;
    
    if (barang.stok === 0) {
      status = "Kritis (Habis)";
      statusColor = "text-red-700 bg-red-50 border-red-200";
      statusIcon = <AlertCircle size={16} className="text-red-600" />;
    } else if (barang.stok <= rekomendasi) {
      status = "Perlu Restock";
      statusColor = "text-amber-700 bg-amber-50 border-amber-200";
      statusIcon = <AlertTriangle size={16} className="text-amber-600" />;
    }

    return {
      id: barang.id,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori.nama_kategori,
      stok: barang.stok,
      satuan: barang.satuan,
      totalDemand,
      hasilMA: maValue,
      rekomendasi,
      status,
      statusColor,
      statusIcon
    };
  });

  // Detailed Analysis for single item if selected
  let detailedData: any = null;
  let chartData = { labels: [] as string[], data: [] as number[] };
  let historisData: { month: string; value: number }[] = [];

  if (selectedBarangId) {
    const selectedBarang = barangList.find(b => b.id === selectedBarangId);
    
    if (selectedBarang) {
      const historyKeluar = allHistoryKeluar.filter(h => h.barang_id === selectedBarangId);
      
      // Group by Month-Year
      const groupedData = historyKeluar.reduce((acc, curr) => {
        const monthYear = curr.tanggal.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        acc[monthYear] = (acc[monthYear] || 0) + curr.jumlah;
        return acc;
      }, {} as Record<string, number>);

      // Fill periods
      const periods = [];
      let currentTotal = 0;
      
      for (let i = selectedPeriode - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mY = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        const val = groupedData[mY] || 0;
        periods.push({ month: mY, value: val });
        currentTotal += val;
        
        chartData.labels.push(mY);
        chartData.data.push(val);
      }

      const maValue = currentTotal / selectedPeriode;
      const roundedPrediction = Math.ceil(maValue);
      
      historisData = periods;
      detailedData = {
        barang: selectedBarang,
        totalDemand: currentTotal,
        periode: selectedPeriode,
        hasilMA: maValue,
        rekomendasi: roundedPrediction
      };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LineChart className="text-blue-500" /> Prediksi Kebutuhan Stok
          </h1>
          <p className="text-slate-500 mt-1">Estimasi pengadaan barang menggunakan metode Moving Average (MA)</p>
        </div>
      </div>

      {/* Filter and Config Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Fokus Analisis Detail (Opsional)</label>
            <select
              name="barang_id"
              defaultValue={selectedBarangId || ""}
              className="w-full px-4 py-2 border border-slate-350 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 transition-all"
            >
              <option value="">-- Tampilkan Semua Barang --</option>
              {barangList.map(b => (
                <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-slate-700 mb-1">Periode Moving Average (n)</label>
            <select
              name="periode"
              defaultValue={selectedPeriode}
              className="w-full px-4 py-2 border border-slate-350 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 transition-all"
            >
              <option value="3">3 Bulan Terakhir</option>
              <option value="6">6 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Calculator size={18} />
            Kalkulasi Prediksi
          </button>
        </form>
      </div>

      {/* Render detailed view if specific item is selected, else show summary table */}
      {selectedBarangId && detailedData ? (
        <div className="space-y-6">
          <div className="flex">
            <Link 
              href={`/dashboard/prediksi?periode=${selectedPeriode}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              &larr; Kembali Lihat Semua Barang
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
                Hasil Analisis: {detailedData.barang.nama_barang}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Grafik Penggunaan Historis</h3>
                <div className="h-64">
                  <DashboardCharts data={chartData} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Historis ({detailedData.periode} Bulan)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm">
                        <th className="px-4 py-3 font-medium rounded-l-lg">Bulan</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total Permintaan (Keluar)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historisData.map((d, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-slate-800 font-medium">{d.month}</td>
                          <td className="px-4 py-3 text-right font-bold text-amber-600">{d.value} {detailedData.barang.satuan}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="px-4 py-3 text-slate-800 font-bold">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">{detailedData.totalDemand} {detailedData.barang.satuan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 <LineChart size={120} />
               </div>
               <div className="relative z-10">
                 <h3 className="text-blue-100 font-medium mb-1">Rekomendasi Pengadaan</h3>
                 <p className="text-sm text-blue-200 mb-6">Untuk bulan berikutnya</p>
                 
                 <div className="text-6xl font-black mb-2">
                   {detailedData.rekomendasi} <span className="text-2xl font-medium text-blue-200">{detailedData.barang.satuan}</span>
                 </div>
                 
                 <div className="mt-8 space-y-4">
                   <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                     <div className="text-xs text-blue-200 uppercase font-semibold mb-1">Rumus Moving Average</div>
                     <div className="font-mono text-sm">MA = Total Demand / {detailedData.periode}</div>
                     <div className="font-mono text-sm">MA = {detailedData.totalDemand} / {detailedData.periode} = {detailedData.hasilMA.toFixed(2)}</div>
                   </div>
                   
                   <div className="bg-blue-900/50 p-4 rounded-xl border border-blue-500/30 flex items-start gap-3">
                     <Info className="text-blue-300 mt-0.5" size={18} />
                     <p className="text-sm text-blue-100 leading-relaxed">
                       Berdasarkan pola historis, disarankan untuk menyediakan <strong className="text-white">{detailedData.rekomendasi} {detailedData.barang.satuan}</strong> {detailedData.barang.nama_barang} pada periode mendatang untuk menghindari kekurangan stok.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Tabel Ringkasan Prediksi (Semua Barang)</h3>
            <p className="text-sm text-slate-500 mt-1">Menggunakan basis data transaksi {selectedPeriode} bulan terakhir</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Kode</th>
                  <th className="px-6 py-4 font-semibold">Nama Barang</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold text-right">Stok Sekarang</th>
                  <th className="px-6 py-4 font-semibold text-right">Keluar ({selectedPeriode} bln)</th>
                  <th className="px-6 py-4 font-semibold text-right">Prediksi Kebutuhan</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {allPredictions.length > 0 ? (
                  allPredictions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600">{item.kode_barang}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.nama_barang}</td>
                      <td className="px-6 py-4 text-slate-500">{item.kategori}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">{item.stok} {item.satuan}</td>
                      <td className="px-6 py-4 text-right text-slate-600 font-medium">{item.totalDemand} {item.satuan}</td>
                      <td className="px-6 py-4 text-right text-blue-600 font-bold bg-blue-50/50">
                        {item.rekomendasi} {item.satuan}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${item.statusColor}`}>
                            {item.statusIcon}
                            <span>{item.status}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Link 
                            href={`/dashboard/prediksi?barang_id=${item.id}&periode=${selectedPeriode}`}
                            className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
                          >
                            Analisis &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada barang di dalam database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

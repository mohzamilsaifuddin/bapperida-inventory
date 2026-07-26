import { prisma } from "@/lib/prisma";
import { LineChart, Calculator, AlertCircle, Info } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";

export default async function PrediksiPage({
  searchParams,
}: {
  searchParams: { barang_id?: string; periode?: string };
}) {
  const barangList = await prisma.barang.findMany({
    orderBy: { nama_barang: 'asc' }
  });

  const selectedBarangId = searchParams.barang_id;
  const selectedPeriode = parseInt(searchParams.periode || "3"); // Default 3 bulan

  let predictionData: any = null;
  let chartData = { labels: [] as string[], data: [] as number[] };
  let historisData: { month: string; value: number }[] = [];

  if (selectedBarangId) {
    // Get historical data for the selected period
    // We get month-by-month aggregated data for Barang Keluar
    const selectedBarang = await prisma.barang.findUnique({ where: { id: selectedBarangId }});
    
    // In SQLite, grouping by month is tricky directly via Prisma, so we fetch all and group in JS
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - selectedPeriode);
    dateLimit.setDate(1); // Start of that month
    dateLimit.setHours(0,0,0,0);

    const historyKeluar = await prisma.barangKeluar.findMany({
      where: {
        barang_id: selectedBarangId,
        tanggal: { gte: dateLimit }
      },
      orderBy: { tanggal: 'asc' }
    });

    // Group by Month-Year
    const groupedData = historyKeluar.reduce((acc, curr) => {
      const monthYear = curr.tanggal.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + curr.jumlah;
      return acc;
    }, {} as Record<string, number>);

    // To ensure we have exactly N periods even if there's no transaction
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
    
    // Save to DB to keep history of predictions
    // Only save if it's a new prediction request
    if (selectedBarang) {
       // We can skip saving for every render in a real app or use a button to explicitly "Simpan Prediksi"
       // For this MVP, we just calculate on the fly.
    }

    historisData = periods;
    predictionData = {
      barang: selectedBarang,
      totalDemand: currentTotal,
      periode: selectedPeriode,
      hasilMA: maValue,
      rekomendasi: roundedPrediction
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="text-blue-500" /> Prediksi Stok
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Barang</label>
            <select
              name="barang_id"
              defaultValue={selectedBarangId}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Pilih barang untuk diprediksi...</option>
              {barangList.map(b => (
                <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Periode Moving Average</label>
            <select
              name="periode"
              defaultValue={selectedPeriode}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="3">3 Bulan Terakhir</option>
              <option value="6">6 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Calculator size={18} />
            Hitung Prediksi
          </button>
        </form>
      </div>

      {predictionData && predictionData.barang ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
              Hasil Analisis: {predictionData.barang.nama_barang}
            </h2>
            
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Grafik Penggunaan Historis</h3>
              <div className="h-64">
                <DashboardCharts data={chartData} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Historis ({predictionData.periode} Bulan)</h3>
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
                        <td className="px-4 py-3 text-right font-bold text-amber-600">{d.value} {predictionData.barang.satuan}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 text-slate-800 font-bold">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{predictionData.totalDemand} {predictionData.barang.satuan}</td>
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
                 {predictionData.rekomendasi} <span className="text-2xl font-medium text-blue-200">{predictionData.barang.satuan}</span>
               </div>
               
               <div className="mt-8 space-y-4">
                 <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                   <div className="text-xs text-blue-200 uppercase font-semibold mb-1">Rumus Moving Average</div>
                   <div className="font-mono text-sm">MA = Total Demand / {predictionData.periode}</div>
                   <div className="font-mono text-sm">MA = {predictionData.totalDemand} / {predictionData.periode} = {predictionData.hasilMA.toFixed(2)}</div>
                 </div>
                 
                 <div className="bg-blue-900/50 p-4 rounded-xl border border-blue-500/30 flex items-start gap-3">
                   <Info className="text-blue-300 mt-0.5" size={18} />
                   <p className="text-sm text-blue-100 leading-relaxed">
                     Berdasarkan pola historis, disarankan untuk menyediakan <strong className="text-white">{predictionData.rekomendasi} {predictionData.barang.satuan}</strong> {predictionData.barang.nama_barang} pada periode mendatang untuk menghindari kekurangan stok.
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Analisis</h3>
          <p className="text-slate-500 max-w-md">
            Silakan pilih barang dan periode waktu di atas, lalu klik tombol "Hitung Prediksi" untuk melihat hasil analisis Moving Average.
          </p>
        </div>
      )}
    </div>
  );
}

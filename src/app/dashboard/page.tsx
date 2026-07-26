import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Package, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle,
  XCircle
} from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [
    totalBarang,
    totalBarangMasuk,
    totalBarangKeluar,
    hampirHabis,
    habis
  ] = await Promise.all([
    prisma.barang.count(),
    prisma.barangMasuk.aggregate({ _sum: { jumlah: true } }),
    prisma.barangKeluar.aggregate({ _sum: { jumlah: true } }),
    prisma.barang.count({ where: { stok: { lte: 5, gt: 0 } } }), // using 5 as threshold for "hampir habis" if no stok_minimum used here, but let's use stok_minimum
    prisma.barang.count({ where: { stok: 0 } }),
  ]);

  // For charts
  const barangKeluarBulanIni = await prisma.barangKeluar.groupBy({
    by: ['tanggal'],
    _sum: { jumlah: true },
    orderBy: { tanggal: 'asc' },
    take: 30
  });

  const chartData = {
    labels: barangKeluarBulanIni.map(b => b.tanggal.toLocaleDateString('id-ID')),
    data: barangKeluarBulanIni.map(b => b._sum.jumlah || 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Selamat datang kembali, {session?.user?.nama}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Barang" 
          value={totalBarang} 
          icon={<Package size={24} className="text-blue-500" />} 
          trend="+2%" 
        />
        <StatCard 
          title="Barang Masuk" 
          value={totalBarangMasuk._sum.jumlah || 0} 
          icon={<ArrowDownRight size={24} className="text-emerald-500" />} 
          trend="Bulan ini" 
        />
        <StatCard 
          title="Barang Keluar" 
          value={totalBarangKeluar._sum.jumlah || 0} 
          icon={<ArrowUpRight size={24} className="text-amber-500" />} 
          trend="Bulan ini" 
        />
        <StatCard 
          title="Stok Kritis" 
          value={hampirHabis + habis} 
          icon={<AlertTriangle size={24} className="text-red-500" />} 
          trend={`${habis} Habis, ${hampirHabis} Menipis`}
          trendColor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Barang Keluar</h3>
          <DashboardCharts data={chartData} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex justify-center items-center mb-4">
             <LineChartIcon className="text-blue-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Prediksi Kebutuhan Bulan Depan</h3>
          <p className="text-slate-500 text-sm max-w-xs mb-6">
            Buka menu Prediksi Stok untuk melihat hasil kalkulasi menggunakan metode Moving Average berdasarkan data historis.
          </p>
          <a href="/dashboard/prediksi" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Lihat Prediksi
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendColor = "text-slate-500" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        <p className={`text-xs mt-2 font-medium ${trendColor}`}>{trend}</p>
      </div>
    </div>
  );
}

function LineChartIcon({ className, size }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  );
}

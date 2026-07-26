import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function addBarangKeluar(formData: FormData) {
  "use server";
  
  const nomor_transaksi = formData.get("nomor_transaksi") as string;
  const tanggal = new Date(formData.get("tanggal") as string);
  const barang_id = formData.get("barang_id") as string;
  const jumlah = parseInt(formData.get("jumlah") as string);
  const tujuan = formData.get("tujuan") as string;
  const keterangan = formData.get("keterangan") as string;

  if (nomor_transaksi && barang_id && jumlah > 0) {
    // Check stock first
    const barang = await prisma.barang.findUnique({ where: { id: barang_id } });
    if (!barang || barang.stok < jumlah) {
      // Idealnya return error dan show di UI
      console.error("Stok tidak mencukupi!");
      return; 
    }

    // Gunakan transaksi agar penambahan log dan pengurangan stok atomik
    await prisma.$transaction([
      prisma.barangKeluar.create({
        data: {
          nomor_transaksi,
          tanggal,
          barang_id,
          jumlah,
          tujuan,
          keterangan
        }
      }),
      prisma.barang.update({
        where: { id: barang_id },
        data: { stok: { decrement: jumlah } }
      })
    ]);
    
    revalidatePath("/dashboard/barang-keluar");
    revalidatePath("/dashboard/barang");
  }
}

export default async function BarangKeluarPage() {
  const barangList = await prisma.barang.findMany({
    orderBy: { nama_barang: 'asc' },
    where: { stok: { gt: 0 } } // Hanya tampilkan barang yang ada stoknya
  });
  
  const transaksiList = await prisma.barangKeluar.findMany({
    include: { barang: true },
    orderBy: { tanggal: 'desc' }
  });

  // Generate nomor transaksi otomatis (BK-YYYYMMDD-Random)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const defaultTrx = `BK-${dateStr}-${randomStr}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Barang Keluar</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Input Barang Keluar</h2>
          <form action={addBarangKeluar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Transaksi</label>
              <input
                type="text"
                name="nomor_transaksi"
                defaultValue={defaultTrx}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                name="tanggal"
                defaultValue={today.toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Barang</label>
              <select
                name="barang_id"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                required
              >
                <option value="">Pilih Barang...</option>
                {barangList.map(b => (
                  <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang} (Stok: {b.stok})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
              <input
                type="number"
                name="jumlah"
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan Penggunaan</label>
              <input
                type="text"
                name="tujuan"
                placeholder="Misal: Divisi IT"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (Opsional)</label>
              <textarea
                name="keterangan"
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-lg shadow-amber-200 transition-all"
            >
              Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Tabel Data */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Barang Keluar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">No. Trx</th>
                  <th className="px-6 py-4 font-medium">Barang</th>
                  <th className="px-6 py-4 font-medium">Jumlah</th>
                  <th className="px-6 py-4 font-medium">Tujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiList.length > 0 ? (
                  transaksiList.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="px-6 py-4 text-slate-600">{trx.tanggal.toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{trx.nomor_transaksi}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{trx.barang.nama_barang}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">-{trx.jumlah}</td>
                      <td className="px-6 py-4 text-slate-600">{trx.tujuan}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Belum ada transaksi barang keluar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

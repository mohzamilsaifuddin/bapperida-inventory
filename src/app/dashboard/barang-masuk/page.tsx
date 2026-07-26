import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function addBarangMasuk(formData: FormData) {
  "use server";
  
  const nomor_transaksi = formData.get("nomor_transaksi") as string;
  const tanggal = new Date(formData.get("tanggal") as string);
  const barang_id = formData.get("barang_id") as string;
  const jumlah = parseInt(formData.get("jumlah") as string);
  const supplier = formData.get("supplier") as string;
  const keterangan = formData.get("keterangan") as string;

  if (nomor_transaksi && barang_id && jumlah > 0) {
    // Gunakan transaksi agar penambahan log dan stok atomik
    await prisma.$transaction([
      prisma.barangMasuk.create({
        data: {
          nomor_transaksi,
          tanggal,
          barang_id,
          jumlah,
          supplier,
          keterangan
        }
      }),
      prisma.barang.update({
        where: { id: barang_id },
        data: { stok: { increment: jumlah } }
      })
    ]);
    
    revalidatePath("/dashboard/barang-masuk");
    revalidatePath("/dashboard/barang");
  }
}

export default async function BarangMasukPage() {
  const barangList = await prisma.barang.findMany({
    orderBy: { nama_barang: 'asc' }
  });
  
  const transaksiList = await prisma.barangMasuk.findMany({
    include: { barang: true },
    orderBy: { tanggal: 'desc' }
  });

  // Generate nomor transaksi otomatis (BM-YYYYMMDD-Random)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const defaultTrx = `BM-${dateStr}-${randomStr}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Barang Masuk</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Input Barang Masuk</h2>
          <form action={addBarangMasuk} className="space-y-4">
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
                  <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang}</option>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier (Opsional)</label>
              <input
                type="text"
                name="supplier"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
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
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all"
            >
              Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Tabel Data */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Barang Masuk</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">No. Trx</th>
                  <th className="px-6 py-4 font-medium">Barang</th>
                  <th className="px-6 py-4 font-medium">Jumlah</th>
                  <th className="px-6 py-4 font-medium">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiList.length > 0 ? (
                  transaksiList.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="px-6 py-4 text-slate-600">{trx.tanggal.toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{trx.nomor_transaksi}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{trx.barang.nama_barang}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">+{trx.jumlah}</td>
                      <td className="px-6 py-4 text-slate-600">{trx.supplier || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Belum ada transaksi barang masuk
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

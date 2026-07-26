import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function updateBarang(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const nama_barang = formData.get("nama_barang") as string;
  const kategori_id = formData.get("kategori_id") as string;
  const satuan = formData.get("satuan") as string;
  const stok_minimum = parseInt(formData.get("stok_minimum") as string) || 0;
  const lokasi = formData.get("lokasi") as string;
  const keterangan = formData.get("keterangan") as string;

  await prisma.barang.update({
    where: { id },
    data: {
      nama_barang,
      kategori_id,
      satuan,
      stok_minimum,
      lokasi: lokasi || null,
      keterangan: keterangan || null,
    },
  });

  redirect("/dashboard/barang");
}

export default async function EditBarangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [barang, kategoriList] = await Promise.all([
    prisma.barang.findUnique({ where: { id }, include: { kategori: true } }),
    prisma.kategori.findMany(),
  ]);

  if (!barang) notFound();

  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/barang"
          className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Barang</h1>
          <p className="text-slate-500 text-sm mt-1">Kode: {barang.kode_barang}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form action={updateBarang} className="space-y-6">
          <input type="hidden" name="id" value={barang.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kode Barang</label>
              <input
                type="text"
                value={barang.kode_barang}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Kode barang tidak dapat diubah</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Barang</label>
              <input
                type="text"
                name="nama_barang"
                defaultValue={barang.nama_barang}
                className={inputClass}
                placeholder="Nama inventaris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                name="kategori_id"
                defaultValue={barang.kategori_id}
                className={inputClass}
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Satuan</label>
              <input
                type="text"
                name="satuan"
                defaultValue={barang.satuan}
                className={inputClass}
                placeholder="Misal: Pcs, Unit, Rim"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stok Saat Ini</label>
              <input
                type="number"
                value={barang.stok}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Ubah stok melalui menu Barang Masuk / Keluar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stok Minimum</label>
              <input
                type="number"
                name="stok_minimum"
                min="0"
                defaultValue={barang.stok_minimum}
                className={inputClass}
                placeholder="0"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Batas alert ketika stok hampir habis</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi (Opsional)</label>
              <input
                type="text"
                name="lokasi"
                defaultValue={barang.lokasi ?? ""}
                className={inputClass}
                placeholder="Misal: Gudang A"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              name="keterangan"
              rows={3}
              defaultValue={barang.keterangan ?? ""}
              className={inputClass}
              placeholder="Keterangan tambahan..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/barang"
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

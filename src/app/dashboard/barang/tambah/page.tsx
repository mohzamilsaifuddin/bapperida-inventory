import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function addBarang(formData: FormData) {
  "use server";
  
  const kode_barang = formData.get("kode_barang") as string;
  const nama_barang = formData.get("nama_barang") as string;
  const kategori_id = formData.get("kategori_id") as string;
  const satuan = formData.get("satuan") as string;
  const stok_minimum = parseInt(formData.get("stok_minimum") as string) || 0;
  const lokasi = formData.get("lokasi") as string;
  const keterangan = formData.get("keterangan") as string;

  await prisma.barang.create({
    data: {
      kode_barang,
      nama_barang,
      kategori_id,
      satuan,
      stok: 0,
      stok_minimum,
      lokasi,
      keterangan
    }
  });

  redirect("/dashboard/barang");
}

export default async function TambahBarangPage() {
  const kategoriList = await prisma.kategori.findMany();

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/barang" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tambah Barang Baru</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form action={addBarang} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kode Barang</label>
              <input
                type="text"
                name="kode_barang"
                className={inputClass}
                placeholder="Misal: BRG-001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Barang</label>
              <input
                type="text"
                name="nama_barang"
                className={inputClass}
                placeholder="Nama inventaris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                name="kategori_id"
                className={inputClass}
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map(kat => (
                  <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Satuan</label>
              <input
                type="text"
                name="satuan"
                className={inputClass}
                placeholder="Misal: Pcs, Unit, Rim"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stok Minimum</label>
              <input
                type="number"
                name="stok_minimum"
                min="0"
                className={inputClass}
                placeholder="0"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Batas alert ketika stok hampir habis</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi (Opsional)</label>
              <input
                type="text"
                name="lokasi"
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
              className={inputClass}
              placeholder="Keterangan tambahan..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


async function addBarang(formData: FormData) {
  "use server";
  
  const kode_barang = formData.get("kode_barang") as string;
  const nama_barang = formData.get("nama_barang") as string;
  const kategori_id = formData.get("kategori_id") as string;
  const satuan = formData.get("satuan") as string;
  const stok_minimum = parseInt(formData.get("stok_minimum") as string) || 0;
  const lokasi = formData.get("lokasi") as string;
  const keterangan = formData.get("keterangan") as string;

  await prisma.barang.create({
    data: {
      kode_barang,
      nama_barang,
      kategori_id,
      satuan,
      stok: 0, // stok awal selalu 0, ditambah via transaksi
      stok_minimum,
      lokasi,
      keterangan
    }
  });

  redirect("/dashboard/barang");
}

export default async function TambahBarangPage() {
  const kategoriList = await prisma.kategori.findMany();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/barang" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tambah Barang Baru</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form action={addBarang} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kode Barang</label>
              <input
                type="text"
                name="kode_barang"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Misal: BRG-001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Barang</label>
              <input
                type="text"
                name="nama_barang"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nama inventaris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                name="kategori_id"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map(kat => (
                  <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Satuan</label>
              <input
                type="text"
                name="satuan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Misal: Pcs, Unit, Rim"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stok Minimum</label>
              <input
                type="number"
                name="stok_minimum"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="0"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Batas alert ketika stok hampir habis</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi (Opsional)</label>
              <input
                type="text"
                name="lokasi"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Misal: Gudang A"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              name="keterangan"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Keterangan tambahan..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

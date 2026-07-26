import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Trash2, Edit } from "lucide-react";
import { revalidatePath } from "next/cache";

async function deleteBarang(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await prisma.barang.delete({ where: { id } });
    revalidatePath("/dashboard/barang");
  }
}

export default async function BarangPage() {
  const barangList = await prisma.barang.findMany({
    include: { kategori: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Master Barang</h1>
          <p className="text-slate-500 mt-1">Kelola data inventaris barang</p>
        </div>
        <Link 
          href="/dashboard/barang/tambah" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all hover:scale-105"
        >
          <Plus size={20} />
          Tambah Barang
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Kode</th>
                <th className="px-6 py-4 font-medium">Nama Barang</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Stok</th>
                <th className="px-6 py-4 font-medium">Satuan</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {barangList.length > 0 ? (
                barangList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{item.kode_barang}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nama_barang}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {item.kategori.nama_kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${item.stok <= item.stok_minimum ? 'text-red-500' : 'text-emerald-500'}`}>
                        {item.stok}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.satuan}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/barang/${item.id}/edit`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <form action={deleteBarang}>
                          <input type="hidden" name="id" value={item.id} />
                          <button 
                            type="submit" 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data barang. Silakan tambah barang baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

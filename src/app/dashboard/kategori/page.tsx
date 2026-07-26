import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function addKategori(formData: FormData) {
  "use server";
  const nama_kategori = formData.get("nama_kategori") as string;

  if (nama_kategori) {
    await prisma.kategori.create({
      data: { nama_kategori }
    });
    revalidatePath("/dashboard/kategori");
  }
}

async function deleteKategori(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;

  if (id) {
    await prisma.kategori.delete({
      where: { id }
    });
    revalidatePath("/dashboard/kategori");
  }
}

export default async function KategoriPage() {
  const kategoriList = await prisma.kategori.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kategori Barang</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Kategori</h2>
          <form action={addKategori} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label>
              <input
                type="text"
                name="nama_kategori"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
                placeholder="Misal: Elektronik"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all"
            >
              Simpan
            </button>
          </form>
        </div>

        {/* Tabel Data */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Data Kategori</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Nama Kategori</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kategoriList.length > 0 ? (
                  kategoriList.map((kat) => (
                    <tr key={kat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{kat.nama_kategori}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteKategori}>
                          <input type="hidden" name="id" value={kat.id} />
                          <button
                            type="submit"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-all text-sm font-medium"
                          >
                            Hapus
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data kategori
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

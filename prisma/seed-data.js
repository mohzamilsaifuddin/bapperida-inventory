const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai mengisi data...');

  // ────────── USERS ──────────
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordPetugas = await bcrypt.hash('petugas123', 10);
  const passwordPimpinan = await bcrypt.hash('pimpinan123', 10);

  await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { username: 'admin', nama: 'Administrator', password: passwordAdmin, role: 'ADMIN' } });
  await prisma.user.upsert({ where: { username: 'petugas' }, update: {}, create: { username: 'petugas', nama: 'Petugas Inventaris', password: passwordPetugas, role: 'PETUGAS' } });
  await prisma.user.upsert({ where: { username: 'pimpinan' }, update: {}, create: { username: 'pimpinan', nama: 'Bapak Pimpinan', password: passwordPimpinan, role: 'PIMPINAN' } });
  console.log('✅ Users selesai');

  // ────────── KATEGORI ──────────
  const kategoriData = [
    { nama_kategori: 'Alat Tulis Kantor (ATK)' },
    { nama_kategori: 'Peralatan Komputer & IT' },
    { nama_kategori: 'Peralatan Rumah Tangga Kantor' },
    { nama_kategori: 'Perlengkapan Kebersihan' },
    { nama_kategori: 'Peralatan Rapat & Presentasi' },
    { nama_kategori: 'Alat Cetak & Fotokopi' },
  ];

  const kategoris = [];
  for (const k of kategoriData) {
    const existing = await prisma.kategori.findFirst({ where: { nama_kategori: k.nama_kategori } });
    if (existing) {
      kategoris.push(existing);
    } else {
      const created = await prisma.kategori.create({ data: k });
      kategoris.push(created);
    }
  }
  const [katATK, katIT, katRumahTangga, katKebersihan, katRapat, katCetak] = kategoris;
  console.log('✅ Kategori selesai');

  // ────────── BARANG ──────────
  const barangData = [
    { kode_barang: 'ATK-001', nama_barang: 'Kertas HVS A4 80gr', kategori_id: katATK.id, satuan: 'Rim', stok: 45, stok_minimum: 10, lokasi: 'Gudang Lt. 1', keterangan: 'Untuk kebutuhan cetak dokumen harian' },
    { kode_barang: 'ATK-002', nama_barang: 'Pulpen Ballpoint Hitam', kategori_id: katATK.id, satuan: 'Lusin', stok: 8, stok_minimum: 5, lokasi: 'Lemari ATK', keterangan: 'Merk Pilot' },
    { kode_barang: 'ATK-003', nama_barang: 'Staples Kecil No. 10', kategori_id: katATK.id, satuan: 'Kotak', stok: 12, stok_minimum: 3, lokasi: 'Lemari ATK', keterangan: null },
    { kode_barang: 'ATK-004', nama_barang: 'Tinta Stempel Biru', kategori_id: katATK.id, satuan: 'Botol', stok: 6, stok_minimum: 2, lokasi: 'Lemari ATK', keterangan: null },
    { kode_barang: 'ATK-005', nama_barang: 'Map Plastik Transparan', kategori_id: katATK.id, satuan: 'Lusin', stok: 3, stok_minimum: 5, lokasi: 'Lemari ATK', keterangan: 'Stok menipis, perlu reorder' },
    { kode_barang: 'ATK-006', nama_barang: 'Buku Agenda Hard Cover', kategori_id: katATK.id, satuan: 'Buah', stok: 20, stok_minimum: 5, lokasi: 'Lemari ATK', keterangan: 'Untuk agenda harian pegawai' },
    { kode_barang: 'ATK-007', nama_barang: 'Sticky Note / Post-it', kategori_id: katATK.id, satuan: 'Pak', stok: 0, stok_minimum: 5, lokasi: 'Lemari ATK', keterangan: 'HABIS - perlu pengadaan segera' },
    { kode_barang: 'IT-001', nama_barang: 'Tinta Printer Canon Hitam', kategori_id: katIT.id, satuan: 'Botol', stok: 10, stok_minimum: 3, lokasi: 'Gudang IT', keterangan: 'Untuk printer Canon di ruang Kabid' },
    { kode_barang: 'IT-002', nama_barang: 'Tinta Printer Warna (CMYK)', kategori_id: katIT.id, satuan: 'Set', stok: 4, stok_minimum: 2, lokasi: 'Gudang IT', keterangan: 'Set isi 4 warna' },
    { kode_barang: 'IT-003', nama_barang: 'Mouse Wireless Logitech', kategori_id: katIT.id, satuan: 'Buah', stok: 5, stok_minimum: 2, lokasi: 'Gudang IT', keterangan: null },
    { kode_barang: 'IT-004', nama_barang: 'Keyboard USB Standard', kategori_id: katIT.id, satuan: 'Buah', stok: 3, stok_minimum: 2, lokasi: 'Gudang IT', keterangan: null },
    { kode_barang: 'IT-005', nama_barang: 'Flashdisk 32GB', kategori_id: katIT.id, satuan: 'Buah', stok: 15, stok_minimum: 5, lokasi: 'Gudang IT', keterangan: 'Untuk distribusi file dokumen' },
    { kode_barang: 'IT-006', nama_barang: 'Kabel HDMI 2 Meter', kategori_id: katIT.id, satuan: 'Buah', stok: 7, stok_minimum: 3, lokasi: 'Gudang IT', keterangan: null },
    { kode_barang: 'RT-001', nama_barang: 'Galon Air Minum (Isi Ulang)', kategori_id: katRumahTangga.id, satuan: 'Galon', stok: 20, stok_minimum: 5, lokasi: 'Dapur Kantor', keterangan: 'Order rutin setiap 2 minggu' },
    { kode_barang: 'RT-002', nama_barang: 'Gelas Kertas Sekali Pakai', kategori_id: katRumahTangga.id, satuan: 'Pak', stok: 8, stok_minimum: 3, lokasi: 'Dapur Kantor', keterangan: 'Isi 50 gelas per pak' },
    { kode_barang: 'RT-003', nama_barang: 'Teh Celup Kotak', kategori_id: katRumahTangga.id, satuan: 'Kotak', stok: 6, stok_minimum: 2, lokasi: 'Dapur Kantor', keterangan: null },
    { kode_barang: 'RT-004', nama_barang: 'Gula Pasir', kategori_id: katRumahTangga.id, satuan: 'Kg', stok: 5, stok_minimum: 2, lokasi: 'Dapur Kantor', keterangan: null },
    { kode_barang: 'KB-001', nama_barang: 'Sabun Cair Cuci Tangan', kategori_id: katKebersihan.id, satuan: 'Liter', stok: 10, stok_minimum: 3, lokasi: 'Gudang Kebersihan', keterangan: null },
    { kode_barang: 'KB-002', nama_barang: 'Tisu Gulung Toilet', kategori_id: katKebersihan.id, satuan: 'Pak', stok: 15, stok_minimum: 5, lokasi: 'Gudang Kebersihan', keterangan: 'Isi 12 gulung per pak' },
    { kode_barang: 'KB-003', nama_barang: 'Pembersih Lantai (Karbol)', kategori_id: katKebersihan.id, satuan: 'Liter', stok: 4, stok_minimum: 2, lokasi: 'Gudang Kebersihan', keterangan: null },
    { kode_barang: 'KB-004', nama_barang: 'Kantong Sampah Hitam Besar', kategori_id: katKebersihan.id, satuan: 'Rol', stok: 2, stok_minimum: 5, lokasi: 'Gudang Kebersihan', keterangan: 'Stok kritis!' },
    { kode_barang: 'RP-001', nama_barang: 'Spidol Whiteboard Hitam', kategori_id: katRapat.id, satuan: 'Buah', stok: 12, stok_minimum: 4, lokasi: 'Ruang Rapat Utama', keterangan: null },
    { kode_barang: 'RP-002', nama_barang: 'Spidol Whiteboard Merah', kategori_id: katRapat.id, satuan: 'Buah', stok: 6, stok_minimum: 2, lokasi: 'Ruang Rapat Utama', keterangan: null },
    { kode_barang: 'RP-003', nama_barang: 'Penghapus Whiteboard', kategori_id: katRapat.id, satuan: 'Buah', stok: 5, stok_minimum: 2, lokasi: 'Ruang Rapat Utama', keterangan: null },
    { kode_barang: 'CT-001', nama_barang: 'Kertas HVS F4 70gr', kategori_id: katCetak.id, satuan: 'Rim', stok: 30, stok_minimum: 10, lokasi: 'Ruang Fotokopi', keterangan: 'Untuk dokumen format Folio' },
    { kode_barang: 'CT-002', nama_barang: 'Toner Mesin Fotokopi', kategori_id: katCetak.id, satuan: 'Buah', stok: 2, stok_minimum: 1, lokasi: 'Ruang Fotokopi', keterangan: 'Compatible untuk Xerox 5090' },
  ];

  const barangs = {};
  for (const b of barangData) {
    const existing = await prisma.barang.findUnique({ where: { kode_barang: b.kode_barang } });
    if (!existing) {
      const created = await prisma.barang.create({ data: b });
      barangs[b.kode_barang] = created;
    } else {
      barangs[b.kode_barang] = existing;
    }
  }
  console.log('✅ Barang selesai');

  // ────────── BARANG MASUK ──────────
  const suppliers = ['CV. Maju Jaya Stationery', 'PT. Sinar Abadi Sejahtera', 'Toko Berkah Mandiri', 'UD. Prima Niaga', 'CV. Karya Bersama'];
  const barangMasukData = [
    { nomor_transaksi: 'BM-2025-001', tanggal: new Date('2025-01-06'), barang_id: barangs['ATK-001'].id, jumlah: 20, supplier: suppliers[0], keterangan: 'Pengadaan awal tahun' },
    { nomor_transaksi: 'BM-2025-002', tanggal: new Date('2025-01-06'), barang_id: barangs['ATK-002'].id, jumlah: 10, supplier: suppliers[0], keterangan: 'Pengadaan awal tahun' },
    { nomor_transaksi: 'BM-2025-003', tanggal: new Date('2025-01-08'), barang_id: barangs['IT-001'].id, jumlah: 6, supplier: suppliers[1], keterangan: null },
    { nomor_transaksi: 'BM-2025-004', tanggal: new Date('2025-01-10'), barang_id: barangs['KB-001'].id, jumlah: 10, supplier: suppliers[2], keterangan: null },
    { nomor_transaksi: 'BM-2025-005', tanggal: new Date('2025-01-10'), barang_id: barangs['KB-002'].id, jumlah: 10, supplier: suppliers[2], keterangan: null },
    { nomor_transaksi: 'BM-2025-006', tanggal: new Date('2025-02-03'), barang_id: barangs['ATK-001'].id, jumlah: 15, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-007', tanggal: new Date('2025-02-05'), barang_id: barangs['RT-001'].id, jumlah: 10, supplier: suppliers[3], keterangan: 'Pengisian galon rutin' },
    { nomor_transaksi: 'BM-2025-008', tanggal: new Date('2025-02-10'), barang_id: barangs['ATK-005'].id, jumlah: 8, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-009', tanggal: new Date('2025-02-14'), barang_id: barangs['IT-005'].id, jumlah: 10, supplier: suppliers[1], keterangan: 'Pengadaan flashdisk untuk distribusi data' },
    { nomor_transaksi: 'BM-2025-010', tanggal: new Date('2025-03-03'), barang_id: barangs['ATK-001'].id, jumlah: 25, supplier: suppliers[0], keterangan: 'Persiapan kegiatan musrenbang' },
    { nomor_transaksi: 'BM-2025-011', tanggal: new Date('2025-03-03'), barang_id: barangs['CT-001'].id, jumlah: 30, supplier: suppliers[0], keterangan: 'Persiapan kegiatan musrenbang' },
    { nomor_transaksi: 'BM-2025-012', tanggal: new Date('2025-03-05'), barang_id: barangs['RP-001'].id, jumlah: 12, supplier: suppliers[4], keterangan: 'Spidol untuk ruang rapat' },
    { nomor_transaksi: 'BM-2025-013', tanggal: new Date('2025-03-12'), barang_id: barangs['KB-004'].id, jumlah: 10, supplier: suppliers[2], keterangan: null },
    { nomor_transaksi: 'BM-2025-014', tanggal: new Date('2025-03-15'), barang_id: barangs['ATK-006'].id, jumlah: 20, supplier: suppliers[0], keterangan: 'Agenda untuk pegawai baru' },
    { nomor_transaksi: 'BM-2025-015', tanggal: new Date('2025-04-02'), barang_id: barangs['RT-001'].id, jumlah: 10, supplier: suppliers[3], keterangan: 'Pengisian galon rutin' },
    { nomor_transaksi: 'BM-2025-016', tanggal: new Date('2025-04-07'), barang_id: barangs['IT-002'].id, jumlah: 4, supplier: suppliers[1], keterangan: null },
    { nomor_transaksi: 'BM-2025-017', tanggal: new Date('2025-04-14'), barang_id: barangs['ATK-001'].id, jumlah: 10, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-018', tanggal: new Date('2025-04-21'), barang_id: barangs['ATK-007'].id, jumlah: 10, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-019', tanggal: new Date('2025-05-05'), barang_id: barangs['CT-002'].id, jumlah: 2, supplier: suppliers[1], keterangan: 'Penggantian toner habis' },
    { nomor_transaksi: 'BM-2025-020', tanggal: new Date('2025-05-08'), barang_id: barangs['ATK-001'].id, jumlah: 20, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-021', tanggal: new Date('2025-05-12'), barang_id: barangs['KB-003'].id, jumlah: 10, supplier: suppliers[2], keterangan: null },
    { nomor_transaksi: 'BM-2025-022', tanggal: new Date('2025-06-02'), barang_id: barangs['ATK-001'].id, jumlah: 15, supplier: suppliers[0], keterangan: null },
    { nomor_transaksi: 'BM-2025-023', tanggal: new Date('2025-06-09'), barang_id: barangs['IT-003'].id, jumlah: 5, supplier: suppliers[1], keterangan: null },
    { nomor_transaksi: 'BM-2025-024', tanggal: new Date('2025-06-16'), barang_id: barangs['RT-002'].id, jumlah: 10, supplier: suppliers[3], keterangan: 'Persiapan rapat koordinasi semester I' },
  ];

  for (const bm of barangMasukData) {
    const existing = await prisma.barangMasuk.findUnique({ where: { nomor_transaksi: bm.nomor_transaksi } });
    if (!existing) await prisma.barangMasuk.create({ data: bm });
  }
  console.log('✅ Barang Masuk selesai');

  // ────────── BARANG KELUAR ──────────
  const tujuanList = ['Bidang Penelitian & Pengembangan', 'Bidang Perencanaan Pembangunan', 'Subbagian Umum & Kepegawaian', 'Ruang Kepala Badan', 'Bidang Monitoring & Evaluasi', 'Ruang Rapat Utama'];
  const barangKeluarData = [
    { nomor_transaksi: 'BK-2025-001', tanggal: new Date('2025-01-08'), barang_id: barangs['ATK-001'].id, jumlah: 3, tujuan: tujuanList[0], keterangan: 'Kebutuhan cetak laporan' },
    { nomor_transaksi: 'BK-2025-002', tanggal: new Date('2025-01-08'), barang_id: barangs['ATK-002'].id, jumlah: 2, tujuan: tujuanList[2], keterangan: null },
    { nomor_transaksi: 'BK-2025-003', tanggal: new Date('2025-01-13'), barang_id: barangs['KB-002'].id, jumlah: 2, tujuan: tujuanList[2], keterangan: 'Toilet lantai 1 dan 2' },
    { nomor_transaksi: 'BK-2025-004', tanggal: new Date('2025-01-15'), barang_id: barangs['ATK-001'].id, jumlah: 5, tujuan: tujuanList[1], keterangan: null },
    { nomor_transaksi: 'BK-2025-005', tanggal: new Date('2025-01-20'), barang_id: barangs['IT-001'].id, jumlah: 2, tujuan: tujuanList[3], keterangan: 'Printer Kepala Badan' },
    { nomor_transaksi: 'BK-2025-006', tanggal: new Date('2025-02-06'), barang_id: barangs['ATK-001'].id, jumlah: 4, tujuan: tujuanList[4], keterangan: null },
    { nomor_transaksi: 'BK-2025-007', tanggal: new Date('2025-02-10'), barang_id: barangs['RT-001'].id, jumlah: 5, tujuan: tujuanList[2], keterangan: 'Konsumsi pegawai harian' },
    { nomor_transaksi: 'BK-2025-008', tanggal: new Date('2025-02-17'), barang_id: barangs['ATK-005'].id, jumlah: 3, tujuan: tujuanList[0], keterangan: 'Pengarsipan dokumen' },
    { nomor_transaksi: 'BK-2025-009', tanggal: new Date('2025-02-20'), barang_id: barangs['KB-001'].id, jumlah: 2, tujuan: tujuanList[2], keterangan: null },
    { nomor_transaksi: 'BK-2025-010', tanggal: new Date('2025-03-05'), barang_id: barangs['ATK-001'].id, jumlah: 10, tujuan: tujuanList[5], keterangan: 'Kebutuhan Musrenbang Kota' },
    { nomor_transaksi: 'BK-2025-011', tanggal: new Date('2025-03-05'), barang_id: barangs['CT-001'].id, jumlah: 15, tujuan: tujuanList[5], keterangan: 'Kebutuhan Musrenbang Kota' },
    { nomor_transaksi: 'BK-2025-012', tanggal: new Date('2025-03-05'), barang_id: barangs['IT-005'].id, jumlah: 5, tujuan: tujuanList[5], keterangan: 'Distribusi materi Musrenbang' },
    { nomor_transaksi: 'BK-2025-013', tanggal: new Date('2025-03-17'), barang_id: barangs['RT-002'].id, jumlah: 2, tujuan: tujuanList[5], keterangan: 'Rapat evaluasi triwulan I' },
    { nomor_transaksi: 'BK-2025-014', tanggal: new Date('2025-03-24'), barang_id: barangs['ATK-001'].id, jumlah: 5, tujuan: tujuanList[1], keterangan: null },
    { nomor_transaksi: 'BK-2025-015', tanggal: new Date('2025-04-03'), barang_id: barangs['ATK-006'].id, jumlah: 5, tujuan: tujuanList[2], keterangan: 'Distribusi agenda pegawai baru' },
    { nomor_transaksi: 'BK-2025-016', tanggal: new Date('2025-04-08'), barang_id: barangs['IT-001'].id, jumlah: 2, tujuan: tujuanList[0], keterangan: null },
    { nomor_transaksi: 'BK-2025-017', tanggal: new Date('2025-04-15'), barang_id: barangs['ATK-001'].id, jumlah: 4, tujuan: tujuanList[4], keterangan: null },
    { nomor_transaksi: 'BK-2025-018', tanggal: new Date('2025-04-22'), barang_id: barangs['ATK-007'].id, jumlah: 4, tujuan: tujuanList[1], keterangan: 'Penandaan dokumen penting' },
    { nomor_transaksi: 'BK-2025-019', tanggal: new Date('2025-05-06'), barang_id: barangs['ATK-001'].id, jumlah: 7, tujuan: tujuanList[0], keterangan: null },
    { nomor_transaksi: 'BK-2025-020', tanggal: new Date('2025-05-13'), barang_id: barangs['KB-003'].id, jumlah: 3, tujuan: tujuanList[2], keterangan: 'Kebersihan toilet & ruangan' },
    { nomor_transaksi: 'BK-2025-021', tanggal: new Date('2025-05-19'), barang_id: barangs['IT-005'].id, jumlah: 3, tujuan: tujuanList[4], keterangan: 'Distribusi data evaluasi' },
    { nomor_transaksi: 'BK-2025-022', tanggal: new Date('2025-05-26'), barang_id: barangs['CT-001'].id, jumlah: 10, tujuan: tujuanList[1], keterangan: null },
    { nomor_transaksi: 'BK-2025-023', tanggal: new Date('2025-06-03'), barang_id: barangs['ATK-001'].id, jumlah: 5, tujuan: tujuanList[3], keterangan: null },
    { nomor_transaksi: 'BK-2025-024', tanggal: new Date('2025-06-10'), barang_id: barangs['RT-001'].id, jumlah: 5, tujuan: tujuanList[2], keterangan: 'Konsumsi rapat koordinasi' },
    { nomor_transaksi: 'BK-2025-025', tanggal: new Date('2025-06-17'), barang_id: barangs['RP-001'].id, jumlah: 3, tujuan: tujuanList[5], keterangan: null },
    { nomor_transaksi: 'BK-2025-026', tanggal: new Date('2025-06-24'), barang_id: barangs['IT-006'].id, jumlah: 2, tujuan: tujuanList[5], keterangan: 'Koneksi proyektor rapat' },
  ];

  for (const bk of barangKeluarData) {
    const existing = await prisma.barangKeluar.findUnique({ where: { nomor_transaksi: bk.nomor_transaksi } });
    if (!existing) await prisma.barangKeluar.create({ data: bk });
  }
  console.log('✅ Barang Keluar selesai');

  console.log('\n🎉 Semua data berhasil dimasukkan!');
  console.log('  - 6 Kategori | 26 Barang | 24 Transaksi Masuk | 26 Transaksi Keluar');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

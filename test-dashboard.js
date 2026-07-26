const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  console.log(await prisma.barang.count())
  console.log(await prisma.barangMasuk.aggregate({ _sum: { jumlah: true } }))
  console.log(await prisma.barangKeluar.aggregate({ _sum: { jumlah: true } }))
  console.log(await prisma.barangKeluar.groupBy({
    by: ['tanggal'],
    _sum: { jumlah: true },
    orderBy: { tanggal: 'asc' },
    take: 30
  }))
}
main().catch(console.error).finally(() => prisma.$disconnect())

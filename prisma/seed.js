const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordAdmin = await bcrypt.hash('admin123', 10)
  const passwordPetugas = await bcrypt.hash('petugas123', 10)
  const passwordPimpinan = await bcrypt.hash('pimpinan123', 10)

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      nama: 'Administrator',
      password: passwordAdmin,
      role: 'ADMIN',
    },
  })

  const petugas = await prisma.user.upsert({
    where: { username: 'petugas' },
    update: {},
    create: {
      username: 'petugas',
      nama: 'Petugas Inventaris',
      password: passwordPetugas,
      role: 'PETUGAS',
    },
  })

  const pimpinan = await prisma.user.upsert({
    where: { username: 'pimpinan' },
    update: {},
    create: {
      username: 'pimpinan',
      nama: 'Bapak Pimpinan',
      password: passwordPimpinan,
      role: 'PIMPINAN',
    },
  })

  console.log({ admin, petugas, pimpinan })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

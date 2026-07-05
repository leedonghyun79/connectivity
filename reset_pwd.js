const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123!', 10);
  await prisma.user.update({
    where: { username: 'admin' },
    data: { password: hash }
  });
  console.log('Password updated to admin123!');
}

main().finally(() => prisma.$disconnect());

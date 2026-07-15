import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminId = '6610000000'; // Example student ID
  const password = 'admin123';
  const name = 'Admin Master';

  const existing = await prisma.adminUser.findUnique({
    where: { studentId: adminId }
  });

  if (existing) {
    console.log(`Admin ${adminId} already exists.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.adminUser.create({
    data: {
      studentId: adminId,
      name,
      password: hashedPassword,
    }
  });

  console.log(`Admin user created! ID: ${adminId}, Password: ${password}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

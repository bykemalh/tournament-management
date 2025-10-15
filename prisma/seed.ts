import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash şifreleri
  const adminPassword = await bcrypt.hash('admin123', 12);
  const refereePassword = await bcrypt.hash('hakem123', 12);

  // Admin kullanıcısı oluştur
  const admin = await prisma.user.upsert({
    where: { tcNo: '11111111111' },
    update: {},
    create: {
      adSoyad: 'Admin User',
      tcNo: '11111111111',
      eposta: 'admin@turnuva.com',
      telNo: '05551111111',
      dogumTarihi: new Date('1990-01-01'),
      sifre: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin created:', admin.eposta);

  // Hakem kullanıcısı oluştur
  const referee = await prisma.user.upsert({
    where: { tcNo: '22222222222' },
    update: {},
    create: {
      adSoyad: 'Hakem User',
      tcNo: '22222222222',
      eposta: 'hakem@turnuva.com',
      telNo: '05552222222',
      dogumTarihi: new Date('1992-05-15'),
      sifre: refereePassword,
      role: 'REFEREE',
    },
  });

  console.log('✅ Referee created:', referee.eposta);

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin  - TC: 11111111111, Şifre: admin123');
  console.log('   Hakem  - TC: 22222222222, Şifre: hakem123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

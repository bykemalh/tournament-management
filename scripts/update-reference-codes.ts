import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateReferenceCode() {
  try {
    console.log('Mevcut takımların referans kodları güncelleniyor...');

    const teams = await prisma.team.findMany();

    for (const team of teams) {
      // 8 haneli alfanumerik benzersiz kod üret
      let referenceCode: string;
      let isUnique = false;

      const generateReferenceCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karışabilecek karakterler hariç (I, O, 0, 1)
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      while (!isUnique) {
        referenceCode = generateReferenceCode();
        
        const existing = await prisma.team.findFirst({
          where: {
            referenceCode,
            NOT: { id: team.id }
          }
        });

        if (!existing) {
          isUnique = true;
          
          await prisma.team.update({
            where: { id: team.id },
            data: { referenceCode }
          });

          console.log(`✓ Takım "${team.name}" için kod güncellendi: ${referenceCode}`);
        }
      }
    }

    console.log('\n✅ Tüm referans kodları başarıyla güncellendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReferenceCode();

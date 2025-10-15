import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTeamsSport() {
  try {
    console.log('Takımların spor alanları güncelleniyor...');

    const teams = await prisma.team.findMany();

    for (const team of teams) {
      if (!team.sport) {
        await prisma.team.update({
          where: { id: team.id },
          data: { sport: 'FOOTBALL' }
        });

        console.log(`✓ Takım "${team.name}" için spor alanı güncellendi: FOOTBALL`);
      } else {
        console.log(`✓ Takım "${team.name}" zaten spor alanına sahip: ${team.sport}`);
      }
    }

    console.log('\n✅ Tüm takımlar kontrol edildi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTeamsSport();

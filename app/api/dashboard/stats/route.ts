import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    // Kullanıcının takımlarını bul
    const userTeams = await prisma.teamMembership.findMany({
      where: { userId: payload.userId },
      select: { teamId: true },
    });

    const teamIds = userTeams.map(({ teamId }: { teamId: string }) => teamId);

    if (teamIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalTournaments: 0,
          activeTournaments: 0,
          totalTeams: 0,
          upcomingMatches: 0,
        },
      });
    }

    // Paralel sorgular ile istatistikleri getir
    const [totalTournaments, activeTournaments, totalTeams, upcomingMatches] = await Promise.all([
      // Toplam turnuva sayısı (takımın katıldığı)
      prisma.tournamentParticipation.count({
        where: {
          teamId: { in: teamIds },
        },
      }),

      // Aktif turnuva sayısı
      prisma.tournamentParticipation.count({
        where: {
          teamId: { in: teamIds },
          tournament: {
            status: 'ONGOING',
          },
        },
      }),

      // Toplam takım sayısı
      teamIds.length,

      // Yaklaşan maçlar (gelecek 7 gün)
      prisma.match.count({
        where: {
          tournament: {
            teams: {
              some: {
                teamId: { in: teamIds },
              },
            },
          },
          status: 'SCHEDULED',
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalTournaments,
        activeTournaments,
        totalTeams,
        upcomingMatches,
      },
    });
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

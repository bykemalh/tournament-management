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

    const teamIds = userTeams.map((t: { teamId: string }) => t.teamId);

    // Son aktiviteleri getir (son 10)
    const recentParticipations = await prisma.tournamentParticipation.findMany({
      where: {
        teamId: { in: teamIds },
      },
      include: {
        tournament: {
          select: {
            name: true,
            status: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
      take: 5,
    });

    const recentMatches = await prisma.match.findMany({
      where: {
        tournament: {
          teams: {
            some: {
              teamId: { in: teamIds },
            },
          },
        },
        status: 'COMPLETED',
      },
      include: {
        tournament: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    interface Participation {
      team: { name: string };
      tournament: { name: string };
      joinedAt: Date;
    }

    interface Match {
      tournament: { name: string };
      updatedAt: Date;
    }

    // Aktiviteleri birleştir ve sırala
    const activities = [
      ...recentParticipations.map((p: Participation) => ({
        type: 'tournament_join',
        message: `${p.team.name} takımı "${p.tournament.name}" turnuvasına katıldı`,
        timestamp: p.joinedAt,
        icon: 'trophy',
      })),
      ...recentMatches.map((m: Match) => ({
        type: 'match_completed',
        message: `"${m.tournament.name}" turnuvasında maç tamamlandı`,
        timestamp: m.updatedAt,
        icon: 'swords',
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Aktiviteler yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Aktiviteler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

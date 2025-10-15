import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const payload = await AuthService.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Hakem kontrolü
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (user?.role !== 'REFEREE') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Hakeme atanan maçlar
    const assignedMatches = await prisma.match.count({
      where: {
        tournament: {
          refereeId: payload.userId,
        },
      },
    });

    // Tamamlanan maçlar
    const completedMatches = await prisma.match.count({
      where: {
        tournament: {
          refereeId: payload.userId,
        },
        status: 'COMPLETED',
      },
    });

    // Yaklaşan maçlar
    const upcomingMatches = await prisma.match.count({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
        tournament: {
          refereeId: payload.userId,
        },
      },
    });

    // Aktif turnuvalar (hakeme atanan maçların turnuvaları)
    const activeTournaments = await prisma.tournament.count({
      where: {
        refereeId: payload.userId,
        status: {
          in: ['UPCOMING', 'ONGOING'],
        },
      },
    });

    return NextResponse.json({
      stats: {
        assignedMatches,
        completedMatches,
        upcomingMatches,
        activeTournaments,
      },
    });
  } catch (error) {
    console.error('Hakem istatistikleri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

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

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Kullanıcı istatistikleri
    const totalUsers = await prisma.user.count();
    const totalPlayers = await prisma.user.count({
      where: { role: 'PLAYER' },
    });
    const totalReferees = await prisma.user.count({
      where: { role: 'REFEREE' },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    // Turnuva istatistikleri
    const totalTournaments = await prisma.tournament.count();
    const activeTournaments = await prisma.tournament.count({
      where: {
        status: {
          in: ['UPCOMING', 'ONGOING'],
        },
      },
    });

    // Takım istatistikleri
    const totalTeams = await prisma.team.count();

    // Maç istatistikleri
    const totalMatches = await prisma.match.count();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPlayers,
        totalReferees,
        totalAdmins,
        totalTournaments,
        activeTournaments,
        totalTeams,
        totalMatches,
      },
    });
  } catch (error) {
    console.error('Admin istatistikleri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

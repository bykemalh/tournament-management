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

    // Hakeme atanan maçları getir (yaklaşan ve devam eden)
    const matches = await prisma.match.findMany({
      where: {
        tournament: {
          refereeId: payload.userId,
        },
        status: {
          in: ['SCHEDULED', 'LIVE'],
        },
      },
      include: {
        tournament: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10,
    });

    const teamIds = Array.from(
      new Set(
        matches.flatMap((match) =>
          [match.team1Id, match.team2Id].filter(
            (teamId): teamId is string => Boolean(teamId)
          )
        )
      )
    );

    const teams = teamIds.length
      ? await prisma.team.findMany({
          where: { id: { in: teamIds } },
          select: { id: true, name: true },
        })
      : [];

    const teamNameMap = new Map(teams.map((team) => [team.id, team.name]));

    const formattedMatches = matches.map((match) => ({
      id: match.id,
      tournamentName: match.tournament.name,
      team1Name: match.team1Id ? teamNameMap.get(match.team1Id) ?? 'Belirlenmedi' : 'Belirlenmedi',
      team2Name: match.team2Id ? teamNameMap.get(match.team2Id) ?? 'Belirlenmedi' : 'Belirlenmedi',
      scheduledDate: match.scheduledAt,
      status: match.status,
    }));

    return NextResponse.json({
      matches: formattedMatches,
    });
  } catch (error) {
    console.error('Hakem maçları alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

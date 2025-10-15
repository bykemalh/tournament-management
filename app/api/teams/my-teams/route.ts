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

    // Kullanıcının üye olduğu tüm takımları getir
    const teamMemberships = await prisma.teamMembership.findMany({
      where: {
        userId: payload.userId,
      },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                adSoyad: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    interface TeamMembership {
      team: {
        id: string;
        name: string;
        referenceCode: string;
        sport: string;
        captainId: string;
        captain: { adSoyad: string };
        _count: { members: number };
      };
      joinedAt: Date;
    }

    const teams = teamMemberships.map((membership: TeamMembership) => ({
      id: membership.team.id,
      name: membership.team.name,
      referenceCode: membership.team.referenceCode,
      sport: membership.team.sport,
      captainId: membership.team.captainId,
      captainName: membership.team.captain.adSoyad,
      memberCount: membership.team._count.members,
      joinedAt: membership.joinedAt,
      isCaptain: membership.team.captainId === payload.userId,
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Takımlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Takımlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

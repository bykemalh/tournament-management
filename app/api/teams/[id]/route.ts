import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Takımı ve üyelerini getir
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        captain: {
          select: {
            id: true,
            adSoyad: true,
            eposta: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                adSoyad: true,
                eposta: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        _count: {
          select: {
            tournaments: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Takım bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bu takımda üye olup olmadığını kontrol et
    const isMember = team.members.some(m => m.userId === payload.userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Bu takıma erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    const isCaptain = team.captainId === payload.userId;

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        referenceCode: team.referenceCode,
        sport: team.sport,
        captainId: team.captainId,
        captainName: team.captain.adSoyad,
        captainEmail: team.captain.eposta,
        memberCount: team.members.length,
        tournamentCount: team._count.tournaments,
        createdAt: team.createdAt,
        members: team.members.map(m => ({
          id: m.id,
          userId: m.user.id,
          name: m.user.adSoyad,
          email: m.user.eposta,
          joinedAt: m.joinedAt,
        })),
        isCaptain,
      },
    });
  } catch (error) {
    console.error('Takım detayı yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Takım detayı yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

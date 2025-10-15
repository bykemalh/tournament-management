import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const joinTeamSchema = z.object({
  referenceCode: z.string().min(1, 'Katılma kodu gereklidir'),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = joinTeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { referenceCode } = validation.data;

    // Takımı bul (büyük harfe çevir)
    const normalizedCode = referenceCode.toUpperCase();
    const team = await prisma.team.findUnique({
      where: { referenceCode: normalizedCode },
      include: {
        captain: {
          select: {
            id: true,
            adSoyad: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Takım bulunamadı. Katılma kodunu kontrol edin.' },
        { status: 404 }
      );
    }

    // Kullanıcı zaten üye mi kontrol et
    const existingMembership = await prisma.teamMembership.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: payload.userId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Bu takıma zaten üyesiniz' },
        { status: 400 }
      );
    }

    // Kullanıcıyı takıma ekle
    await prisma.teamMembership.create({
      data: {
        teamId: team.id,
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      message: 'Takıma başarıyla katıldınız',
      team: {
        id: team.id,
        name: team.name,
        captainName: team.captain.adSoyad,
      },
    });
  } catch (error) {
    console.error('Takıma katılırken hata:', error);
    return NextResponse.json(
      { error: 'Takıma katılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

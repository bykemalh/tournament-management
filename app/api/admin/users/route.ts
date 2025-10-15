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
      where: { id: payload.userId as string },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Tüm kullanıcıları getir (şifre hariç)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
      },
      orderBy: {
        adSoyad: 'asc',
      },
    });

    type UserListItem = (typeof users)[number];

    // Map role to rol for Turkish frontend
    const formattedUsers = users.map((user: UserListItem) => {
      const { role, ...rest } = user;
      return {
        ...rest,
        rol: role,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

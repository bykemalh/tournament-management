import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
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
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi doğrula
    const isPasswordValid = await AuthService.verifyPassword(
      currentPassword,
      user.sifre
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await AuthService.hashPassword(newPassword);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        sifre: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi',
    });
  } catch (error) {
    console.error('Şifre değiştirilirken hata:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

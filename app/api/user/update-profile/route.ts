import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  adSoyad: z.string().min(3, 'Ad soyad en az 3 karakter olmalıdır'),
  eposta: z.string().email('Geçerli bir e-posta adresi giriniz'),
  telNo: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz'),
});

export async function PUT(request: NextRequest) {
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
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { adSoyad, eposta, telNo } = validation.data;

    // E-posta benzersizlik kontrolü (kendisi hariç)
    const existingUser = await prisma.user.findFirst({
      where: {
        eposta,
        NOT: {
          id: payload.userId,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        adSoyad,
        eposta,
        telNo,
      },
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profil güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

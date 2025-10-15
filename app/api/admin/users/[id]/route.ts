import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { z } from 'zod';

// Kullanıcı güncelleme için validasyon şeması
const updateUserSchema = z.object({
  adSoyad: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır').optional(),
  tcNo: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır').optional(),
  eposta: z.string().email('Geçerli bir e-posta adresi giriniz').optional(),
  telNo: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır').optional(),
  dogumTarihi: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Geçerli bir tarih giriniz')
    .optional(),
});

// Yetki kontrolü fonksiyonu
async function checkAdminAuth(token: string | undefined) {
  if (!token) {
    return { error: 'Yetkisiz erişim', status: 401 };
  }

  const payload = await AuthService.verifyToken(token);
  if (!payload) {
    return { error: 'Geçersiz token', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return { error: 'Yetkisiz erişim', status: 403 };
  }

  return { user };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Kullanıcı detaylarını getir
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const token = request.cookies.get('token')?.value;
    const authCheck = await checkAdminAuth(token);

    if ('error' in authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedTeams: {
          select: {
            id: true,
            name: true,
            sport: true,
          },
        },
        teamMemberships: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                sport: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Frontend için rol mapping
    const { role, ...rest } = user;
    const formattedUser = {
      ...rest,
      rol: role,
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Kullanıcı getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcı bilgilerini güncelle
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const token = request.cookies.get('token')?.value;
    const authCheck = await checkAdminAuth(token);

    if ('error' in authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Kullanıcıyı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const body = await request.json();

    // Validasyon
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // TC No değişiyorsa kontrol et
    if (updateData.tcNo && updateData.tcNo !== existingUser.tcNo) {
      const existingUserByTcNo = await prisma.user.findUnique({
        where: { tcNo: updateData.tcNo },
      });

      if (existingUserByTcNo) {
        return NextResponse.json(
          { error: 'Bu TC Kimlik No ile kayıtlı kullanıcı zaten var' },
          { status: 400 }
        );
      }
    }

    // E-posta değişiyorsa kontrol et
    if (updateData.eposta && updateData.eposta !== existingUser.eposta) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { eposta: updateData.eposta },
      });

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi ile kayıtlı kullanıcı zaten var' },
          { status: 400 }
        );
      }
    }

    // Güncelleme verilerini hazırla
    const dataToUpdate: {
      adSoyad?: string;
      tcNo?: string;
      eposta?: string;
      telNo?: string;
      dogumTarihi?: Date;
    } = {};

    if (updateData.adSoyad) dataToUpdate.adSoyad = updateData.adSoyad;
    if (updateData.tcNo) dataToUpdate.tcNo = updateData.tcNo;
    if (updateData.eposta) dataToUpdate.eposta = updateData.eposta;
    if (updateData.telNo) dataToUpdate.telNo = updateData.telNo;
    if (updateData.dogumTarihi)
      dataToUpdate.dogumTarihi = new Date(updateData.dogumTarihi);

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
        updatedAt: true,
      },
    });

    // Frontend için rol mapping
    const { role, ...rest } = updatedUser;
    const formattedUser = {
      ...rest,
      rol: role,
    };

    return NextResponse.json({
      message: 'Kullanıcı bilgileri başarıyla güncellendi',
      user: formattedUser,
    });
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcıyı sil
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const token = request.cookies.get('token')?.value;
    const authCheck = await checkAdminAuth(token);

    if ('error' in authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Kullanıcıyı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedTeams: true,
        teamMemberships: true,
        refereeTournaments: {
          where: {
            status: { in: ['UPCOMING', 'ONGOING'] },
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Kendi hesabını silmeye çalışıyor mu kontrol et
    if (existingUser.id === authCheck.user.id) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      );
    }

    // Hakem ise aktif turnuvaları var mı kontrol et
    if (existingUser.role === 'REFEREE' && existingUser.refereeTournaments.length > 0) {
      return NextResponse.json(
        {
          error:
            'Bu hakem aktif turnuvalarda görevli. Önce turnuva atamaları kaldırılmalıdır.',
        },
        { status: 400 }
      );
    }

    // Takım kaptanı ise uyarı ver
    if (existingUser.ownedTeams.length > 0) {
      return NextResponse.json(
        {
          error:
            'Bu kullanıcı takım kaptanı. Önce takım sahipliği devredilmelidir.',
        },
        { status: 400 }
      );
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

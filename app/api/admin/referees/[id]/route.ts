import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { z } from 'zod';

// Hakem güncelleme için validasyon şeması
const updateRefereeSchema = z.object({
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

// Hakem detaylarını getir
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

    const referee = await prisma.user.findUnique({
      where: { id, role: 'REFEREE' },
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
        refereeTournaments: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!referee) {
      return NextResponse.json({ error: 'Hakem bulunamadı' }, { status: 404 });
    }

    // Frontend için rol mapping
    const { role, refereeTournaments, ...rest } = referee;
    const formattedReferee = {
      ...rest,
      rol: role,
      tournaments: refereeTournaments,
    };

    return NextResponse.json({ referee: formattedReferee });
  } catch (error) {
    console.error('Hakem getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Hakem bilgilerini güncelle
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

    // Hakemi kontrol et
    const existingReferee = await prisma.user.findUnique({
      where: { id, role: 'REFEREE' },
    });

    if (!existingReferee) {
      return NextResponse.json({ error: 'Hakem bulunamadı' }, { status: 404 });
    }

    const body = await request.json();

    // Validasyon
    const validation = updateRefereeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // TC No değişiyorsa kontrol et
    if (updateData.tcNo && updateData.tcNo !== existingReferee.tcNo) {
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
    if (updateData.eposta && updateData.eposta !== existingReferee.eposta) {
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

    // Hakemi güncelle
    const updatedReferee = await prisma.user.update({
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
    const { role, ...rest } = updatedReferee;
    const formattedReferee = {
      ...rest,
      rol: role,
    };

    return NextResponse.json({
      message: 'Hakem bilgileri başarıyla güncellendi',
      referee: formattedReferee,
    });
  } catch (error) {
    console.error('Hakem güncellenirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Hakemi sil
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

    // Hakemi kontrol et
    const existingReferee = await prisma.user.findUnique({
      where: { id, role: 'REFEREE' },
      include: {
        refereeTournaments: {
          where: {
            status: { in: ['UPCOMING', 'ONGOING'] },
          },
        },
      },
    });

    if (!existingReferee) {
      return NextResponse.json({ error: 'Hakem bulunamadı' }, { status: 404 });
    }

    // Aktif turnuvaları var mı kontrol et
    if (existingReferee.refereeTournaments.length > 0) {
      return NextResponse.json(
        {
          error:
            'Bu hakem aktif turnuvalarda görevli. Önce turnuva atamaları kaldırılmalıdır.',
        },
        { status: 400 }
      );
    }

    // Hakemi sil
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Hakem başarıyla silindi',
    });
  } catch (error) {
    console.error('Hakem silinirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

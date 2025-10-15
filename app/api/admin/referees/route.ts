import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Hakem oluşturma için validasyon şeması
const createRefereeSchema = z.object({
  adSoyad: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır'),
  tcNo: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır'),
  eposta: z.string().email('Geçerli bir e-posta adresi giriniz'),
  telNo: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  dogumTarihi: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Geçerli bir tarih giriniz'
  ),
  sifre: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
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

// Tüm hakemleri listele
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const authCheck = await checkAdminAuth(token);

    if ('error' in authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const referees = await prisma.user.findMany({
      where: { role: 'REFEREE' },
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
        createdAt: true,
        refereeTournaments: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Frontend için rol mapping
    const formattedReferees = referees.map((referee) => {
      const { role, refereeTournaments, ...rest } = referee;
      return {
        ...rest,
        rol: role,
        tournaments: refereeTournaments,
      };
    });

    return NextResponse.json({ referees: formattedReferees });
  } catch (error) {
    console.error('Hakemler getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni hakem oluştur
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const authCheck = await checkAdminAuth(token);

    if ('error' in authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();

    // Validasyon
    const validation = createRefereeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { adSoyad, tcNo, eposta, telNo, dogumTarihi, sifre } = validation.data;

    // TC No kontrolü
    const existingUserByTcNo = await prisma.user.findUnique({
      where: { tcNo },
    });

    if (existingUserByTcNo) {
      return NextResponse.json(
        { error: 'Bu TC Kimlik No ile kayıtlı kullanıcı zaten var' },
        { status: 400 }
      );
    }

    // E-posta kontrolü
    const existingUserByEmail = await prisma.user.findUnique({
      where: { eposta },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı kullanıcı zaten var' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(sifre, 10);

    // Hakemi oluştur
    const referee = await prisma.user.create({
      data: {
        adSoyad,
        tcNo,
        eposta,
        telNo,
        dogumTarihi: new Date(dogumTarihi),
        sifre: hashedPassword,
        role: 'REFEREE',
      },
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        role: true,
        createdAt: true,
      },
    });

    // Frontend için rol mapping
    const { role, ...rest } = referee;
    const formattedReferee = {
      ...rest,
      rol: role,
    };

    return NextResponse.json(
      {
        message: 'Hakem başarıyla oluşturuldu',
        referee: formattedReferee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Hakem oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

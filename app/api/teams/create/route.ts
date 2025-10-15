import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(3, 'Takım adı en az 3 karakter olmalıdır').max(50),
  sport: z.enum(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'TENNIS', 'HANDBALL', 'TABLETENNIS', 'BADMINTON', 'ESPORTS']).optional(),
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
    const validation = createTeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, sport } = validation.data;

    // 8 haneli alfanumerik benzersiz referans kodu oluştur
    const generateReferenceCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karışabilecek karakterler hariç (I, O, 0, 1)
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let referenceCode = generateReferenceCode();
    let isUnique = false;

    // Benzersiz kod olana kadar kontrol et
    while (!isUnique) {
      const existing = await prisma.team.findUnique({
        where: { referenceCode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        referenceCode = generateReferenceCode();
      }
    }

    // Takımı oluştur ve kaptanı üye olarak ekle
    const team = await prisma.team.create({
      data: {
        name,
        referenceCode,
        sport: sport || 'FOOTBALL',
        captainId: payload.userId,
        members: {
          create: {
            userId: payload.userId,
          },
        },
      },
      include: {
        captain: {
          select: {
            id: true,
            adSoyad: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Takım başarıyla oluşturuldu',
      team: {
        id: team.id,
        name: team.name,
        referenceCode: team.referenceCode,
        captainName: team.captain.adSoyad,
      },
    });
  } catch (error) {
    console.error('Takım oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Takım oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

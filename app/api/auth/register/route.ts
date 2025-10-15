import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ tcNo: validatedData.tcNo }, { eposta: validatedData.eposta }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.tcNo === validatedData.tcNo
              ? 'Bu TC Kimlik No zaten kayıtlı'
              : 'Bu e-posta adresi zaten kayıtlı',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(validatedData.sifre);

    // Create user
    const user = await prisma.user.create({
      data: {
        adSoyad: validatedData.adSoyad,
        tcNo: validatedData.tcNo,
        eposta: validatedData.eposta,
        telNo: validatedData.telNo,
        dogumTarihi: new Date(validatedData.dogumTarihi),
        sifre: hashedPassword,
      },
      select: {
        id: true,
        adSoyad: true,
        tcNo: true,
        eposta: true,
        telNo: true,
        dogumTarihi: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = await AuthService.generateToken({
      userId: user.id,
      tcNo: user.tcNo,
    });

    const response = NextResponse.json(
      {
        message: 'Kayıt başarılı',
        user,
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Geçersiz veri',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}

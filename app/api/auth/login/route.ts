import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { tcNo: validatedData.tcNo },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'TC Kimlik No veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await AuthService.verifyPassword(
      validatedData.sifre,
      user.sifre
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'TC Kimlik No veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Generate token
    const token = await AuthService.generateToken({
      userId: user.id,
      tcNo: user.tcNo,
    });

    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        adSoyad: user.adSoyad,
        tcNo: user.tcNo,
        eposta: user.eposta,
        telNo: user.telNo,
        dogumTarihi: user.dogumTarihi,
        rol: user.role,
      },
    });

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

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}

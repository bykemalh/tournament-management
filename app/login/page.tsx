'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sparkles, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';

export default function GirisPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Giriş başarısız oldu');
        return;
      }

      const redirectPath =
        result.user?.rol === 'ADMIN'
          ? '/admin'
          : result.user?.rol === 'REFEREE'
            ? '/dashboard/referee'
            : '/dashboard';

      router.replace(redirectPath);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header with Logo */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-orange-600 transition-colors">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Turnuva Yönetim Sistemi
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Tema Değiştir</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tekrar Hoş Geldiniz</h1>
            <p className="text-sm text-muted-foreground">Hesabınıza giriş yapın</p>
          </div>

      <Card className="border shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold">Giriş Yap</CardTitle>
          <CardDescription className="text-sm">
            TC Kimlik No ve şifreniz ile devam edin
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-2 rounded-md border border-red-200 dark:border-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tcNo" className="text-sm">TC Kimlik No</Label>
              <Input
                id="tcNo"
                {...register('tcNo')}
                placeholder="12345678901"
                maxLength={11}
                className="h-10 focus-visible:ring-orange-500"
                autoFocus
              />
              {errors.tcNo && (
                <p className="text-xs text-red-500">
                  {errors.tcNo.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sifre" className="text-sm">Şifre</Label>
              <Input
                id="sifre"
                type="password"
                {...register('sifre')}
                placeholder="Şifrenizi girin"
                className="h-10 focus-visible:ring-orange-500"
              />
              {errors.sifre && (
                <p className="text-xs text-red-500">
                  {errors.sifre.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-4">
            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Link
                href="/register"
                className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
              >
                Hesap Oluşturun
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
        </div>
      </div>
    </div>
  );
}

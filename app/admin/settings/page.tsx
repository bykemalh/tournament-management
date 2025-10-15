'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Moon,
  Sun,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const ensureAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.replace('/login');
          return;
        }

        const data = await response.json();
        if (data.rol !== 'ADMIN') {
          router.replace('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Yönetici yetkisi doğrulanamadı:', err);
        router.replace('/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    ensureAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/admin">Yönetim</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Ayarlar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Görünüm Ayarları</CardTitle>
            <CardDescription>
              Yönetim paneli görünümünü kişiselleştirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Sun className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    Arayüz temasını seçin
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                    theme === 'light'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                      : 'border-border hover:border-orange-500/60'
                  }`}
                >
                  <Sun className="mr-2 inline-block h-4 w-4" />
                  Açık
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                      : 'border-border hover:border-orange-500/60'
                  }`}
                >
                  <Moon className="mr-2 inline-block h-4 w-4" />
                  Koyu
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

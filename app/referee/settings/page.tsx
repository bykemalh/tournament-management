'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import NProgress from 'nprogress';
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
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const themes = [
    {
      value: 'light',
      label: 'Açık Tema',
      description: 'Açık renkli tema',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Koyu Tema',
      description: 'Koyu renkli tema',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'Sistem',
      description: 'Sistem temasını kullan',
      icon: Monitor,
    },
  ];

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
                  <Link href="/referee" onClick={() => NProgress.start()}>
                    Hakem Paneli
                  </Link>
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
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
            <p className="text-muted-foreground">
              Uygulama tercihlerinizi yönetin
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <div>
                    <CardTitle>Tema</CardTitle>
                    <CardDescription>
                      Uygulama temasını seçin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {mounted ? (
                  themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    const isSelected = theme === themeOption.value;
                    
                    return (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value)}
                        className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                          isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isSelected ? 'bg-orange-500 text-white' : 'bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{themeOption.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {themeOption.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-orange-500" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[72px] animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bilgi</CardTitle>
                <CardDescription>
                  Uygulama hakkında bilgiler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Versiyon</Label>
                  <p className="text-sm font-medium">1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Tema</Label>
                  <p className="text-sm font-medium capitalize">
                    {mounted ? theme : 'Yükleniyor...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Renk</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-orange-500 ring-2 ring-orange-500 ring-offset-2" />
                    <p className="text-sm font-medium">Turuncu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}

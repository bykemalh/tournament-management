'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Spor ikonları için lucide-react'tan import edelim
import { 
  Trophy, 
  Dribbble, 
  Goal,
  Volleyball,
  ScanEye,
  Gamepad2,
  Zap,
  CircleDot,
} from 'lucide-react';

type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'HANDBALL' | 'TABLETENNIS' | 'BADMINTON' | 'ESPORTS';

interface Sport {
  id: SportType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const sports: Sport[] = [
  { 
    id: 'FOOTBALL', 
    name: 'Futbol', 
    icon: Goal, 
    color: 'text-green-600',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
  },
  { 
    id: 'BASKETBALL', 
    name: 'Basketbol', 
    icon: Dribbble, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
  },
  { 
    id: 'VOLLEYBALL', 
    name: 'Voleybol', 
    icon: Volleyball, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
  },
  { 
    id: 'TENNIS', 
    name: 'Tenis', 
    icon: Trophy, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
  },
  { 
    id: 'HANDBALL', 
    name: 'Hentbol', 
    icon: CircleDot, 
    color: 'text-red-600',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
  },
  { 
    id: 'TABLETENNIS', 
    name: 'Masa Tenisi', 
    icon: Zap, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
  },
  { 
    id: 'BADMINTON', 
    name: 'Badminton', 
    icon: ScanEye, 
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
  },
  { 
    id: 'ESPORTS', 
    name: 'E-Spor', 
    icon: Gamepad2, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
  },
];

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType>('FOOTBALL');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: teamName,
          sport: selectedSport,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Takım oluşturulamadı');
        return;
      }

      // Başarılı - takım detay sayfasına yönlendir
      router.push(`/dashboard/teams/${data.team.id}`);
    } catch (err) {
      console.error('Takım oluşturma hatası:', err);
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

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
                  <Link href="/dashboard" onClick={() => NProgress.start()}>
                    Turnuva Yönetimi
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/teams" onClick={() => NProgress.start()}>
                    Takımlarım
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Yeni Takım</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="mt-6 max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Yeni Takım Oluştur</CardTitle>
            <CardDescription>
              Takımınızı oluşturun ve arkadaşlarınızı davet edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName">Takım Adı</Label>
                <Input
                  id="teamName"
                  placeholder="Örn: Galatasaray, Lakers, Fenerbahçe..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  3-50 karakter arası bir isim seçin
                </p>
              </div>

              <div className="space-y-3">
                <Label>Branş Seçin</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sports.map((sport) => {
                    const Icon = sport.icon;
                    const isSelected = selectedSport === sport.id;
                    
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => setSelectedSport(sport.id)}
                        className={cn(
                          'relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all',
                          sport.bgColor,
                          isSelected && 'ring-2 ring-primary ring-offset-2'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="rounded-full bg-primary p-1">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <Icon className={cn('h-8 w-8', sport.color)} />
                        <span className="text-sm font-medium">{sport.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isCreating || !teamName.trim()}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Takımı Oluştur'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isCreating}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

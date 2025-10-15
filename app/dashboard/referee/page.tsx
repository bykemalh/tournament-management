'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Flag,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Swords,
  Trophy,
} from 'lucide-react';

interface UserData {
  id: string;
  adSoyad: string;
  rol: 'PLAYER' | 'REFEREE' | 'ADMIN';
}

interface RefereeStats {
  assignedMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  activeTournaments: number;
}

interface AssignedMatch {
  id: string;
  tournamentName: string;
  team1Name: string;
  team2Name: string;
  scheduledDate: string;
  status: string;
}

export default function RefereeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<RefereeStats>({
    assignedMatches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
    activeTournaments: 0,
  });
  const [matches, setMatches] = useState<AssignedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.replace('/login');
        return;
      }
      const userData = await userResponse.json();
      
      // Hakem değilse player dashboard'a yönlendir
      if (userData.rol !== 'REFEREE') {
        router.replace('/dashboard');
        return;
      }
      
      setUser(userData);

      // Hakem istatistiklerini getir
      const statsResponse = await fetch('/api/dashboard/referee/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Atanmış maçları getir
      const matchesResponse = await fetch('/api/dashboard/referee/matches');
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setMatches(matchesData.matches);
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Atanan Maçlar',
      value: stats.assignedMatches,
      icon: Swords,
      description: 'Toplam atanmış maç sayısı',
      color: 'text-blue-500',
    },
    {
      title: 'Tamamlanan Maçlar',
      value: stats.completedMatches,
      icon: CheckCircle,
      description: 'Yönettiğiniz tamamlanan maçlar',
      color: 'text-green-500',
    },
    {
      title: 'Yaklaşan Maçlar',
      value: stats.upcomingMatches,
      icon: Clock,
      description: 'Planlanmış gelecek maçlar',
      color: 'text-orange-500',
    },
    {
      title: 'Aktif Turnuvalar',
      value: stats.activeTournaments,
      icon: Trophy,
      description: 'Görev aldığınız turnuvalar',
      color: 'text-purple-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      SCHEDULED: { label: 'Planlandı', class: 'bg-blue-100 text-blue-700' },
      IN_PROGRESS: { label: 'Devam Ediyor', class: 'bg-yellow-100 text-yellow-700' },
      COMPLETED: { label: 'Tamamlandı', class: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'İptal', class: 'bg-red-100 text-red-700' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Hakem Paneli</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Flag className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Hoş geldiniz, {user.adSoyad}
                </h1>
                <p className="text-muted-foreground">
                  Atanmış maçlarınız ve hakemlik görevleriniz
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Atanmış Maçlarım</CardTitle>
                  <CardDescription>
                    Hakemlik yapacağınız yaklaşan maçlar
                  </CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Flag className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">Henüz atanmış maç yok</p>
                  <p className="text-sm text-muted-foreground">
                    Turnuva organizatörleri sizi maçlara atadığında burada görünecek
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{match.tournamentName}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {match.team1Name} <span className="mx-2">vs</span> {match.team2Name}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(match.scheduledDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div>{getStatusBadge(match.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </>
  );
}

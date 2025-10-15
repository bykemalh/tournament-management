'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Flag,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  AlertCircle,
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

interface Match {
  id: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  tournament: {
    id: string;
    name: string;
  };
}

interface RefereeStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  upcomingMatches: number;
  completedMatches: number;
}

const tournamentStatusLabels: Record<string, string> = {
  UPCOMING: 'Yaklaşan',
  ONGOING: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const tournamentStatusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  UPCOMING: 'default',
  ONGOING: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
};

const matchStatusLabels: Record<string, string> = {
  SCHEDULED: 'Planlandı',
  LIVE: 'Canlı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export default function RefereeDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<RefereeStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    completedTournaments: 0,
    upcomingMatches: 0,
    completedMatches: 0,
  });

  useEffect(() => {
    checkAuthAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }
      const userData = await userResponse.json();

      if (userData.rol !== 'REFEREE') {
        router.push('/dashboard');
        return;
      }

      // Burada hakem görevleri ve istatistikleri API'den çekilecek
      // Şimdilik mock data
      setStats({
        totalTournaments: 0,
        activeTournaments: 0,
        completedTournaments: 0,
        upcomingMatches: 0,
        completedMatches: 0,
      });
      setTournaments([]);
      setUpcomingMatches([]);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Dashboard yükleniyor...</p>
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
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Hoşgeldin Kartı */}
        <Card className="mt-6 border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <Flag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle>Hakem Paneli</CardTitle>
                <CardDescription>
                  Görevlerinizi ve maçlarınızı buradan yönetebilirsiniz
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* İstatistikler */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Turnuva
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktif Turnuva
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.activeTournaments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tamamlanan
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedTournaments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Yaklaşan Maçlar
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.upcomingMatches}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Yönetilen Maç
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMatches}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Aktif Turnuvalar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                Görevli Olduğum Turnuvalar
              </CardTitle>
              <CardDescription>
                {tournaments.length > 0
                  ? `${tournaments.length} turnuvada görevlisiniz`
                  : 'Henüz turnuva göreviniz yok'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournaments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="mb-4 h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">
                    Henüz size atanmış turnuva bulunmuyor
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{tournament.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tournament.startDate)} -{' '}
                          {formatDate(tournament.endDate)}
                        </p>
                      </div>
                      <Badge variant={tournamentStatusColors[tournament.status]}>
                        {tournamentStatusLabels[tournament.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Yaklaşan Maçlar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Yaklaşan Maçlar
                  </CardTitle>
                  <CardDescription>
                    {upcomingMatches.length > 0
                      ? `${upcomingMatches.length} yaklaşan maç`
                      : 'Yaklaşan maç yok'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/referee/matches">Tümünü Gör</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">
                    Yaklaşan maç bulunmuyor
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 5).map((match) => (
                    <div
                      key={match.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {match.tournament.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(match.scheduledAt)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {matchStatusLabels[match.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

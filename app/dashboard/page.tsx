'use client';

import { useEffect, useState } from 'react';
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
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Loader2,
  TrendingUp,
  Swords,
} from 'lucide-react';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

interface UserData {
  id: string;
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
  rol?: 'PLAYER' | 'REFEREE' | 'ADMIN';
}

interface DashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  totalTeams: number;
  upcomingMatches: number;
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    totalTeams: 0,
    upcomingMatches: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTeamAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTeamAndFetchData = async () => {
    try {
      // Kullanıcı bilgilerini getir
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }
      const userData = await userResponse.json();
      setUser(userData);

      // Role göre dashboard'a yönlendir
      if (userData.rol === 'ADMIN') {
        router.replace('/admin');
        return;
      } else if (userData.rol === 'REFEREE') {
        router.replace('/dashboard/referee');
        return;
      }
      // PLAYER için bu sayfada kal

      // Oyuncu için takım kontrolü yap
      const teamsResponse = await fetch('/api/teams/my-teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        if (!teamsData.teams || teamsData.teams.length === 0) {
          // Takımı yok, takımlar sayfasına yönlendir
          router.push('/teams');
          return;
        }
      }

      // İstatistikleri getir
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Aktiviteleri getir
      const activitiesResponse = await fetch('/api/dashboard/activities');
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities);
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
              <BreadcrumbItem>
                <BreadcrumbPage>Ana Sayfa</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Hoş Geldiniz, {user.adSoyad}
            </h1>
            <p className="text-muted-foreground">
              Turnuva yönetim sisteminize genel bakış
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Turnuva
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTournaments}</div>
                <p className="text-xs text-muted-foreground">
                  Katıldığınız turnuvalar
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif Turnuva
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTournaments}</div>
                <p className="text-xs text-muted-foreground">
                  Devam eden turnuvalar
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Takımlarım
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTeams}</div>
                <p className="text-xs text-muted-foreground">
                  Üye olduğunuz takımlar
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Yaklaşan Maçlar
                </CardTitle>
                <Swords className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingMatches}</div>
                <p className="text-xs text-muted-foreground">
                  Bu hafta oynanacak
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>
                  Son turnuva ve maç aktiviteleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Henüz aktivite yok
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Turnuvalara katılın veya maçlara girin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activities.slice(0, 3).map((activity, index) => {
                      const Icon = activity.icon === 'trophy' ? Trophy : activity.icon === 'swords' ? Swords : Users;
                      const timeAgo = formatTimeAgo(new Date(activity.timestamp));
                      
                      return (
                        <div key={index} className="flex items-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.message}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Sık kullanılan işlemlere hızlı erişim
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <button className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Turnuva Oluştur</p>
                    <p className="text-sm text-muted-foreground">
                      Yeni turnuva başlat
                    </p>
                  </div>
                </button>
                <button className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Takım Oluştur</p>
                    <p className="text-sm text-muted-foreground">
                      Yeni takım kur
                    </p>
                  </div>
                </button>
                <button className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Maç Takvimi</p>
                    <p className="text-sm text-muted-foreground">
                      Maçları görüntüle
                    </p>
                  </div>
                </button>
                <button className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">İstatistikler</p>
                    <p className="text-sm text-muted-foreground">
                      Performans analizi
                    </p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}

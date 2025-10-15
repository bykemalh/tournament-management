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
import {
  Users,
  Trophy,
  Shield,
  Loader2,
  Calendar,
  BarChart3,
  UserCheck,
  Flag,
} from 'lucide-react';

interface UserData {
  id: string;
  adSoyad: string;
  rol: 'PLAYER' | 'REFEREE' | 'ADMIN';
}

interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalReferees: number;
  totalAdmins: number;
  totalTournaments: number;
  activeTournaments: number;
  totalTeams: number;
  totalMatches: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
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
      
      if (userData.rol !== 'ADMIN') {
        router.replace('/dashboard');
        return;
      }

      setUser(userData);

      const statsResponse = await fetch('/api/dashboard/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData?.stats) {
          setStats(statsData.stats);
        }
      }
    } catch {
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user || !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      description: 'Tüm kayıtlı kullanıcılar',
      color: 'text-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Oyuncular',
      value: stats.totalPlayers,
      icon: UserCheck,
      description: 'Kayıtlı oyuncu sayısı',
      color: 'text-green-500',
      link: '/admin/users?role=PLAYER',
    },
    {
      title: 'Hakemler',
      value: stats.totalReferees,
      icon: Flag,
      description: 'Kayıtlı hakem sayısı',
      color: 'text-yellow-500',
      link: '/admin/users?role=REFEREE',
    },
    {
      title: 'Yöneticiler',
      value: stats.totalAdmins,
      icon: Shield,
      description: 'Sistem yöneticisi sayısı',
      color: 'text-red-500',
      link: '/admin/users?role=ADMIN',
    },
    {
      title: 'Toplam Turnuva',
      value: stats.totalTournaments,
      icon: Trophy,
      description: 'Oluşturulan turnuva sayısı',
      color: 'text-purple-500',
    },
    {
      title: 'Aktif Turnuvalar',
      value: stats.activeTournaments,
      icon: Calendar,
      description: 'Devam eden turnuvalar',
      color: 'text-orange-500',
    },
    {
      title: 'Toplam Takım',
      value: stats.totalTeams,
      icon: Users,
      description: 'Kayıtlı takım sayısı',
      color: 'text-cyan-500',
    },
    {
      title: 'Toplam Maç',
      value: stats.totalMatches,
      icon: BarChart3,
      description: 'Oynanan/Planlanmış maç sayısı',
      color: 'text-pink-500',
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
              <BreadcrumbItem>
                <BreadcrumbPage>Yönetici Paneli</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              {stat.link ? (
                <Link href={stat.link}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Link>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="hover:shadow-lg transition-shadow">
            <Link href="/admin/users">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Kullanıcı Yönetimi
                </CardTitle>
                <CardDescription>
                  Kullanıcıları görüntüle, düzenle ve yönet
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Turnuva Yönetimi
              </CardTitle>
              <CardDescription>
                Turnuvaları oluştur, düzenle ve yönet
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-500" />
                Hakem Oluştur
              </CardTitle>
              <CardDescription>
                Yeni hakem hesabı oluştur
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}

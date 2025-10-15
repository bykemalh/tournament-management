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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Users,
  Loader2,
  Copy,
  CheckCircle2,
  Crown,
  UserPlus,
  Shield,
  Goal,
  Dribbble,
  Volleyball,
  Trophy,
  CircleDot,
  Zap,
  ScanEye,
  Gamepad2,
} from 'lucide-react';

type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'HANDBALL' | 'TABLETENNIS' | 'BADMINTON' | 'ESPORTS';

interface Team {
  id: string;
  name: string;
  referenceCode: string;
  sport?: SportType;
  captainId: string;
  captainName: string;
  memberCount: number;
  joinedAt: string;
  isCaptain: boolean;
}

const sportIcons = {
  FOOTBALL: { icon: Goal, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  BASKETBALL: { icon: Dribbble, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  VOLLEYBALL: { icon: Volleyball, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  TENNIS: { icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  HANDBALL: { icon: CircleDot, color: 'text-red-600', bgColor: 'bg-red-500/10' },
  TABLETENNIS: { icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  BADMINTON: { icon: ScanEye, color: 'text-pink-600', bgColor: 'bg-pink-500/10' },
  ESPORTS: { icon: Gamepad2, color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
};

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeams = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const teamsResponse = await fetch('/api/teams/my-teams');
      if (teamsResponse.ok) {
        const data = await teamsResponse.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Takımlar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferenceCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Takımlar yükleniyor...</p>
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
                <BreadcrumbPage>Takımlarım</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <Button asChild>
            <Link href="/dashboard/teams/create">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Takım Oluştur
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {teams.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-xl font-semibold">Henüz takımınız yok</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Turnuvalara katılmak için bir takım oluşturun veya mevcut bir takıma katılın
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard/teams/create">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Takım Oluştur
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/team-onboarding">
                    Takıma Katıl
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const sport = (team.sport || 'FOOTBALL') as SportType;
              const SportIcon = sportIcons[sport].icon;
              const sportColor = sportIcons[sport].color;
              const sportBgColor = sportIcons[sport].bgColor;
              
              return (
              <Card key={team.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg ${sportBgColor} p-2.5`}>
                      <SportIcon className={`h-6 w-6 ${sportColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {team.name}
                        {team.isCaptain && (
                          <span title="Kaptan">
                            <Crown className="h-4 w-4 text-orange-500" />
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Kaptan: {team.captainName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {team.memberCount} Üye
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(team.joinedAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Davet Kodu
                      </span>
                      {team.isCaptain && (
                        <span title="Sadece kaptan görebilir">
                          <Shield className="h-3 w-3 text-orange-500" />
                        </span>
                      )}
                    </div>
                    {team.isCaptain ? (
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono">
                          {team.referenceCode}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyReferenceCode(team.referenceCode)}
                          title="Kodu kopyala"
                        >
                          {copiedCode === team.referenceCode ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Sadece kaptan görebilir
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/teams/${team.id}`)}
                    >
                      Detaylar
                    </Button>
                    {team.isCaptain && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/teams/${team.id}/manage`)}
                      >
                        Yönet
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        {teams.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Davet Kodu Nasıl Kullanılır?</CardTitle>
              <CardDescription>
                Arkadaşlarınızı takımınıza davet edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  1
                </div>
                <p className="text-sm">
                  Takımınızın <strong>Davet Kodu</strong>&apos;nu kopyalayın
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  2
                </div>
                <p className="text-sm">
                  Katılmak isteyen arkadaşlarınızla <strong>davet kodunu</strong> paylaşın
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  3
                </div>
                <p className="text-sm">
                  Arkadaşlarınız sisteme giriş yaptıktan sonra <strong>Takıma Katıl</strong> seçeneğinden kodu girebilir
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

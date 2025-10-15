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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Crown,
  Copy,
  CheckCircle2,
  Trophy,
  Users,
  Calendar,
  Mail,
  Goal,
  Dribbble,
  Volleyball,
  CircleDot,
  ScanEye,
  Gamepad2,
  Zap,
} from 'lucide-react';

type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'HANDBALL' | 'TABLETENNIS' | 'BADMINTON' | 'ESPORTS';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface TeamDetail {
  id: string;
  name: string;
  referenceCode: string;
  sport?: SportType;
  captainId: string;
  captainName: string;
  captainEmail: string;
  memberCount: number;
  tournamentCount: number;
  createdAt: string;
  members: TeamMember[];
  isCaptain: boolean;
}

const sportIcons = {
  FOOTBALL: { icon: Goal, color: 'text-green-600', name: 'Futbol' },
  BASKETBALL: { icon: Dribbble, color: 'text-orange-600', name: 'Basketbol' },
  VOLLEYBALL: { icon: Volleyball, color: 'text-blue-600', name: 'Voleybol' },
  TENNIS: { icon: Trophy, color: 'text-yellow-600', name: 'Tenis' },
  HANDBALL: { icon: CircleDot, color: 'text-red-600', name: 'Hentbol' },
  TABLETENNIS: { icon: Zap, color: 'text-purple-600', name: 'Masa Tenisi' },
  BADMINTON: { icon: ScanEye, color: 'text-pink-600', name: 'Badminton' },
  ESPORTS: { icon: Gamepad2, color: 'text-indigo-600', name: 'E-Spor' },
};

export default function MyTeamPage() {
  const router = useRouter();
  
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchUserTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserTeam = async () => {
    try {
      const myTeamsResponse = await fetch('/api/teams/my-teams');
      if (!myTeamsResponse.ok) {
        router.push('/login');
        return;
      }

      const myTeamsData = await myTeamsResponse.json();
      const userTeams = myTeamsData.teams;

      if (!userTeams || userTeams.length === 0) {
        router.push('/teams');
        return;
      }

      const teamId = userTeams[0].id;

      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/teams');
          return;
        }
        throw new Error('Takım detayı yüklenemedi');
      }

      const data = await response.json();
      setTeam(data.team);
    } catch (error) {
      console.error('Takım detayı yüklenirken hata:', error);
      router.push('/dashboard/teams');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferenceCode = async () => {
    if (!team) return;
    
    try {
      await navigator.clipboard.writeText(team.referenceCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Takım bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const sport = (team.sport || 'FOOTBALL') as SportType;
  const SportIcon = sportIcons[sport].icon;
  const sportColor = sportIcons[sport].color;
  const sportName = sportIcons[sport].name;

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
                <BreadcrumbPage>Takımım</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {team.isCaptain && (
          <div className="flex items-center gap-2 px-4">
            <Button variant="outline" onClick={() => router.push(`/dashboard/teams/${team.id}/manage`)}>
              Takımı Yönet
            </Button>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-muted p-3`}>
                  <SportIcon className={`h-8 w-8 ${sportColor}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    {team.name}
                    {team.isCaptain && (
                      <span title="Kaptan">
                        <Crown className="h-5 w-5 text-orange-500" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {sportName} Takımı
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{team.memberCount}</span>
                  <span className="text-xs text-muted-foreground">Üye</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{team.tournamentCount}</span>
                  <span className="text-xs text-muted-foreground">Turnuva</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">
                    {new Date(team.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">Kuruluş</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Kaptan</span>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="font-medium">{team.captainName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    {team.captainEmail}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Davet Kodu</CardTitle>
              <CardDescription>
                {team.isCaptain ? 'Arkadaşlarınızı davet edin' : 'Kaptan paylaşabilir'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.isCaptain ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md border bg-muted px-4 py-3 text-center text-lg font-mono font-bold">
                      {team.referenceCode}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyReferenceCode}
                      title="Kodu kopyala"
                    >
                      {copiedCode ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bu kodu arkadaşlarınızla paylaşarak takıma katılmalarını sağlayabilirsiniz.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Davet kodu sadece takım kaptanı tarafından görülebilir ve paylaşılabilir.
                </p>
              )}
            </CardContent>
          </Card>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Takım Üyeleri ({team.memberCount})</CardTitle>
            <CardDescription>
              Takımınızdaki tüm oyuncular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Katılma Tarihi</TableHead>
                  <TableHead>Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      {member.userId === team.captainId ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Crown className="h-4 w-4" />
                          <span className="text-sm font-medium">Kaptan</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Oyuncu</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

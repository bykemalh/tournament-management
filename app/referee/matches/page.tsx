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
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Swords,
  Calendar,
  Eye,
  Trophy,
} from 'lucide-react';

interface Match {
  id: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  team1Score: number;
  team2Score: number;
  tournament: {
    id: string;
    name: string;
  };
}

const matchStatusLabels: Record<string, string> = {
  SCHEDULED: 'Planlandı',
  LIVE: 'Canlı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const matchStatusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  SCHEDULED: 'default',
  LIVE: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
};

export default function RefereeMatchesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    checkAuthAndFetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, statusFilter]);

  const checkAuthAndFetchMatches = async () => {
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

      // Burada hakem maçları API'den çekilecek
      // Şimdilik mock data
      setMatches([]);
    } catch (error) {
      console.error('Maçlar yüklenirken hata:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(match => match.status === statusFilter);
    }

    // Tarihe göre sırala (en yakın tarih önce)
    filtered.sort((a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    setFilteredMatches(filtered);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Maçlar yükleniyor...</p>
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
                  <Link href="/referee">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Maçlar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-orange-500" />
                <div>
                  <h2 className="text-lg font-semibold">Görevli Olduğum Maçlar</h2>
                  <p className="text-sm text-muted-foreground">
                    Maçlarınızı görüntüleyin ve yönetin
                  </p>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Durum Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Maçlar</SelectItem>
                  <SelectItem value="SCHEDULED">Planlandı</SelectItem>
                  <SelectItem value="LIVE">Canlı</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maç Listesi ({filteredMatches.length})</CardTitle>
            <CardDescription>
              Size atanan tüm maçlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Swords className="mb-4 h-16 w-16 text-muted-foreground/20" />
                <h3 className="mb-2 text-lg font-semibold">
                  {statusFilter === 'ALL'
                    ? 'Henüz maç göreviniz yok'
                    : 'Bu filtreye uygun maç bulunamadı'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {statusFilter === 'ALL'
                    ? 'Size atanan maçlar burada görünecek'
                    : 'Farklı bir filtre seçerek tekrar deneyin'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Turnuva</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Saat</TableHead>
                        <TableHead>Skor</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-orange-500" />
                              {match.tournament.name}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(match.scheduledAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTime(match.scheduledAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {match.status === 'COMPLETED' ? (
                              <span className="font-mono">
                                {match.team1Score} - {match.team2Score}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={matchStatusColors[match.status]}>
                              {matchStatusLabels[match.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/referee/matches/${match.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Detay
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="space-y-3 md:hidden">
                  {filteredMatches.map((match) => (
                    <Card key={match.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-orange-500" />
                              <p className="font-medium">{match.tournament.name}</p>
                            </div>
                            <Badge variant={matchStatusColors[match.status]}>
                              {matchStatusLabels[match.status]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(match.scheduledAt)}
                          </div>

                          {match.status === 'COMPLETED' && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Skor: </span>
                              <span className="font-mono font-semibold">
                                {match.team1Score} - {match.team2Score}
                              </span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/referee/matches/${match.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detay Görüntüle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

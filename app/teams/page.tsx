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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Users,
  Plus,
  Search,
  Trophy,
  ArrowLeft,
  UserPlus,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  referenceCode: string;
  sport: string;
  captainId: string;
  captain: {
    adSoyad: string;
  };
  _count: {
    members: number;
  };
}

interface CreateTeamFormData {
  name: string;
  sport: string;
}

interface JoinTeamFormData {
  referenceCode: string;
}

const sportLabels: Record<string, string> = {
  FOOTBALL: 'Futbol',
  BASKETBALL: 'Basketbol',
  VOLLEYBALL: 'Voleybol',
  TENNIS: 'Tenis',
  HANDBALL: 'Hentbol',
  TABLETENNIS: 'Masa Tenisi',
  BADMINTON: 'Badminton',
  ESPORTS: 'E-Spor',
};

export default function TeamsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Takım oluşturma
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateTeamFormData>({
    name: '',
    sport: 'FOOTBALL',
  });

  // Takıma katılma
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinFormData, setJoinFormData] = useState<JoinTeamFormData>({
    referenceCode: '',
  });

  useEffect(() => {
    checkAuthAndFetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, searchQuery]);

  const checkAuthAndFetchTeams = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }
      const userData = await userResponse.json();
      setCurrentUserId(userData.id);

      // Tüm takımları getir
      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTeams = () => {
    let filtered = teams;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.referenceCode.toLowerCase().includes(query) ||
          team.captain.adSoyad.toLowerCase().includes(query)
      );
    }

    setFilteredTeams(filtered);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.name.trim()) {
      toast({
        title: 'Hata',
        description: 'Takım adı gereklidir',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Takım başarıyla oluşturuldu',
        });
        setIsCreateDialogOpen(false);
        setCreateFormData({ name: '', sport: 'FOOTBALL' });
        checkAuthAndFetchTeams();
      } else {
        toast({
          title: 'Hata',
          description: data.error || 'Takım oluşturulamadı',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Takım oluşturma hatası:', error);
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinFormData.referenceCode.trim()) {
      toast({
        title: 'Hata',
        description: 'Referans kodu gereklidir',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinFormData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Takıma başarıyla katıldınız',
        });
        setIsJoinDialogOpen(false);
        setJoinFormData({ referenceCode: '' });
        checkAuthAndFetchTeams();
      } else {
        toast({
          title: 'Hata',
          description: data.error || 'Takıma katılınamadı',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Takıma katılma hatası:', error);
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Takımlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">

            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">Takımlar</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Takıma Katıl
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Takıma Katıl</DialogTitle>
                  <DialogDescription>
                    Referans kodunu girerek bir takıma katılın
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referenceCode">
                      Referans Kodu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="referenceCode"
                      type="text"
                      placeholder="Örn: ABC123"
                      value={joinFormData.referenceCode}
                      onChange={(e) =>
                        setJoinFormData({
                          referenceCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Takım kaptanından referans kodunu alın
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsJoinDialogOpen(false)}
                      disabled={isJoining}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={isJoining}>
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Katılıyor...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Katıl
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Takım Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Takım Oluştur</DialogTitle>
                  <DialogDescription>
                    Yeni bir takım oluşturun ve kaptan olun
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Takım Adı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Örn: Şampiyonlar Takımı"
                      value={createFormData.name}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sport">
                      Spor Dalı <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={createFormData.sport}
                      onValueChange={(value) =>
                        setCreateFormData({ ...createFormData, sport: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sportLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Oluştur
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Takım adı, referans kodu veya kaptan ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Tüm Takımlar ({filteredTeams.length})
            </h2>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-lg font-semibold">
                {searchQuery ? 'Takım bulunamadı' : 'Henüz takım yok'}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchQuery
                  ? 'Arama kriterlerinize uygun takım bulunamadı'
                  : 'İlk takımı oluşturun ve turnuvalara katılmaya başlayın'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Takımı Oluştur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {sportLabels[team.sport]}
                      </CardDescription>
                    </div>
                    {team.captainId === currentUserId && (
                      <Badge variant="secondary" className="ml-2">
                        <Crown className="mr-1 h-3 w-3" />
                        Kaptan
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/teams/${team.id}`)}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Takımı Seç
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

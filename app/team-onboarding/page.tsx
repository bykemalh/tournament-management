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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Users,
  Plus,
  Loader2,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function TeamOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTeams = async () => {
    try {
      const response = await fetch('/api/teams/my-teams');
      if (response.ok) {
        const data = await response.json();
        if (data.teams && data.teams.length > 0) {
          // Kullanıcının zaten takımı var, dashboard'a yönlendir
          router.push('/dashboard');
          return;
        }
      }
    } catch {
      console.error('Takımlar kontrol edilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setError('Takım adı girmelisiniz');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Takım oluşturulurken hata oluştu');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Katılma kodu girmelisiniz');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: joinCode }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Takıma katılırken hata oluştu');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Turnuva Sistemine Hoş Geldiniz!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Başlamak için bir takıma katılın veya yeni bir takım oluşturun
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Takım Oluştur */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Yeni Takım Oluştur</CardTitle>
                  <CardDescription>
                    Kendi takımınızı kurun ve arkadaşlarınızı davet edin
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Takım Adı</Label>
                  <Input
                    id="teamName"
                    placeholder="Örn: Şampiyonlar Takımı"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Takım Oluştur
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Takıma Katıl */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Mevcut Takıma Katıl</CardTitle>
                  <CardDescription>
                    Katılma kodunu girerek bir takıma katılın
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Katılma Kodu</Label>
                  <Input
                    id="joinCode"
                    placeholder="Örn: ABC123XYZ"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    disabled={isJoining}
                  />
                  <p className="text-xs text-muted-foreground">
                    Takım kaptanından katılma kodunu alın
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="secondary"
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Katılınıyor...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Takıma Katıl
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Takım Hakkında
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Takım oluşturduğunuzda otomatik olarak <strong>kaptan</strong> olursunuz
            </p>
            <p>
              • Takım kaptanı olarak arkadaşlarınızı davet edebilirsiniz
            </p>
            <p>
              • Her takım turnuvalara katılabilir ve maçlara girebilir
            </p>
            <p>
              • İstediğiniz kadar takıma üye olabilirsiniz
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

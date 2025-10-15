'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CheckCircle2,
  Edit,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

interface AdminUser {
  id: string;
  adSoyad: string;
  eposta: string;
  telNo: string;
  tcNo: string;
  dogumTarihi: string;
  rol?: 'ADMIN' | 'REFEREE' | 'PLAYER';
}

interface AuditEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    adSoyad: '',
    eposta: '',
    telNo: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.replace('/login');
          return;
        }

        const data = await response.json();
        if (data.rol !== 'ADMIN') {
          router.replace('/dashboard');
          return;
        }

        setUser(data);
        setFormData({
          adSoyad: data.adSoyad ?? '',
          eposta: data.eposta ?? '',
          telNo: data.telNo ?? '',
        });
      } catch (err) {
        console.error('Yönetici profili yüklenirken hata oluştu:', err);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleCancel = () => {
    if (!user) return;
    setFormData({
      adSoyad: user.adSoyad,
      eposta: user.eposta,
      telNo: user.telNo,
    });
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? 'Profil güncellenemedi');
        return;
      }

      if (user) {
        setUser({ ...user, ...formData });
      }
      setSuccess('Profil bilgileri başarıyla kaydedildi');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Profil kaydedilirken hata oluştu:', err);
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const auditTrail = useMemo<AuditEvent[]>(
    () => [
      {
        id: 'auth-1',
        title: 'İki adımlı doğrulama aktif edildi',
        description: 'Tüm yönetici işlemleri için 2FA zorunlu kılındı.',
        timestamp: '2025-10-09T09:15:00.000Z',
      },
      {
        id: 'user-2',
        title: 'Yeni hakem kaydı onaylandı',
        description: '22222222222 TC kimlik numaralı hakem hesabı sisteme eklendi.',
        timestamp: '2025-10-07T16:42:00.000Z',
      },
      {
        id: 'security-3',
        title: 'Parola politikası güncellendi',
        description: 'Minumum karakter sayısı 12 olarak güncellendi.',
        timestamp: '2025-10-01T08:30:00.000Z',
      },
    ],
    []
  );

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Yönetici profili yükleniyor...</p>
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
                  <Link href="/admin">Yönetim</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Profil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-green-500 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>İletişim bilgilerinizi güncel tutun.</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adSoyad">Ad Soyad</Label>
                  {isEditing ? (
                    <Input
                      id="adSoyad"
                      value={formData.adSoyad}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, adSoyad: event.target.value }))
                      }
                      placeholder="Ad Soyad"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user.adSoyad}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eposta">Kurumsal E-posta</Label>
                  {isEditing ? (
                    <Input
                      id="eposta"
                      type="email"
                      value={formData.eposta}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, eposta: event.target.value }))
                      }
                      placeholder="ornek@turnuva.gov.tr"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.eposta}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telNo">İletişim Telefonu</Label>
                  {isEditing ? (
                    <Input
                      id="telNo"
                      value={formData.telNo}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, telNo: event.target.value }))
                      }
                      placeholder="0(5xx) xxx xx xx"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.telNo}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Yetki Düzeyi</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Yönetici</span>
                    <span className="ml-auto text-xs text-muted-foreground">Sadece görüntülenir</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>TC Kimlik No</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.tcNo}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Değiştirilemez</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Doğum Tarihi</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {user.dogumTarihi
                        ? new Date(user.dogumTarihi).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Belirtilmemiş'}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">Değiştirilemez</span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    İptal
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yetki Özeti</CardTitle>
              <CardDescription>Son yönetici aktiviteleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditTrail.map((event) => (
                <div key={event.id} className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-medium">{event.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Güvenlik Öncelikleriniz</CardTitle>
            <CardDescription>
              Yönetici hesabınız için alınmış önemli güvenlik adımlarını görüntüleyin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <ShieldCheck className="mb-3 h-6 w-6 text-orange-500" />
                <h3 className="font-semibold">İki Aşamalı Doğrulama</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yöneticiler için iki aşamalı kimlik doğrulama etkin. Destek taleplerinde zorunlu.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <CheckCircle2 className="mb-3 h-6 w-6 text-orange-500" />
                <h3 className="font-semibold">Yetki Onay Akışı</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kritik işlemler (rol değişimi, turnuva silme) ikili onay sürecine tabidir.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <Calendar className="mb-3 h-6 w-6 text-orange-500" />
                <h3 className="font-semibold">Periyodik Denetim</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Günlük audit kayıtları otomatik olarak arşivlenir ve raporlanır.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, User, ArrowLeft, Save, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  sport: string;
}

interface TeamMembership {
  team: Team;
}

interface User {
  id: string;
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
  rol: 'PLAYER' | 'REFEREE' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  ownedTeams?: Team[];
  teamMemberships?: TeamMembership[];
}

interface FormData {
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
}

interface FormErrors {
  adSoyad?: string;
  tcNo?: string;
  eposta?: string;
  telNo?: string;
  dogumTarihi?: string;
  submit?: string;
}

const roleLabels: Record<string, string> = {
  PLAYER: 'Oyuncu',
  REFEREE: 'Hakem',
  ADMIN: 'Yönetici',
};

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

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    adSoyad: '',
    tcNo: '',
    eposta: '',
    telNo: '',
    dogumTarihi: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (!response.ok) {
        toast({
          title: 'Hata',
          description: 'Kullanıcı bilgileri yüklenemedi',
          variant: 'destructive',
        });
        router.push('/admin/users');
        return;
      }

      const data = await response.json();
      setUser(data.user);

      // Form verilerini doldur
      const birthDate = new Date(data.user.dogumTarihi);
      const formattedDate = birthDate.toISOString().split('T')[0];

      setFormData({
        adSoyad: data.user.adSoyad,
        tcNo: data.user.tcNo,
        eposta: data.user.eposta,
        telNo: data.user.telNo,
        dogumTarihi: formattedDate,
      });
    } catch (error) {
      console.error('Kullanıcı yüklenirken hata:', error);
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası',
        variant: 'destructive',
      });
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.adSoyad.trim()) {
      newErrors.adSoyad = 'Ad Soyad gereklidir';
    } else if (formData.adSoyad.trim().length < 3) {
      newErrors.adSoyad = 'Ad Soyad en az 3 karakter olmalıdır';
    }

    if (!formData.tcNo.trim()) {
      newErrors.tcNo = 'TC Kimlik No gereklidir';
    } else if (!/^\d{11}$/.test(formData.tcNo)) {
      newErrors.tcNo = 'TC Kimlik No 11 haneli olmalıdır';
    }

    if (!formData.eposta.trim()) {
      newErrors.eposta = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.eposta)) {
      newErrors.eposta = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.telNo.trim()) {
      newErrors.telNo = 'Telefon numarası gereklidir';
    } else if (formData.telNo.trim().length < 10) {
      newErrors.telNo = 'Telefon numarası en az 10 karakter olmalıdır';
    }

    if (!formData.dogumTarihi) {
      newErrors.dogumTarihi = 'Doğum tarihi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSoyad: formData.adSoyad.trim(),
          tcNo: formData.tcNo.trim(),
          eposta: formData.eposta.trim().toLowerCase(),
          telNo: formData.telNo.trim(),
          dogumTarihi: formData.dogumTarihi,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı bilgileri başarıyla güncellendi',
        });
        router.push('/admin/users');
      } else {
        setErrors({ submit: data.error || 'Bir hata oluştu' });
        toast({
          title: 'Hata',
          description: data.error || 'Kullanıcı güncellenemedi',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      setErrors({ submit: 'Bağlantı hatası oluştu' });
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">
            Kullanıcı bilgileri yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/admin/users">Kullanıcılar</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{user.adSoyad}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Sol taraf - Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Kullanıcı Bilgilerini Düzenle</CardTitle>
                    <CardDescription>
                      Kullanıcı bilgilerini güncelleyin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.submit && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Ad Soyad */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adSoyad">
                        Ad Soyad <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="adSoyad"
                        type="text"
                        value={formData.adSoyad}
                        onChange={(e) => handleInputChange('adSoyad', e.target.value)}
                        className={errors.adSoyad ? 'border-red-500' : ''}
                      />
                      {errors.adSoyad && (
                        <p className="text-sm text-red-500">{errors.adSoyad}</p>
                      )}
                    </div>

                    {/* TC Kimlik No */}
                    <div className="space-y-2">
                      <Label htmlFor="tcNo">
                        TC Kimlik No <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="tcNo"
                        type="text"
                        maxLength={11}
                        value={formData.tcNo}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleInputChange('tcNo', value);
                        }}
                        className={errors.tcNo ? 'border-red-500' : ''}
                      />
                      {errors.tcNo && (
                        <p className="text-sm text-red-500">{errors.tcNo}</p>
                      )}
                    </div>

                    {/* Doğum Tarihi */}
                    <div className="space-y-2">
                      <Label htmlFor="dogumTarihi">
                        Doğum Tarihi <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dogumTarihi"
                        type="date"
                        value={formData.dogumTarihi}
                        onChange={(e) =>
                          handleInputChange('dogumTarihi', e.target.value)
                        }
                        className={errors.dogumTarihi ? 'border-red-500' : ''}
                      />
                      {errors.dogumTarihi && (
                        <p className="text-sm text-red-500">{errors.dogumTarihi}</p>
                      )}
                    </div>

                    {/* E-posta */}
                    <div className="space-y-2">
                      <Label htmlFor="eposta">
                        E-posta <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="eposta"
                        type="email"
                        value={formData.eposta}
                        onChange={(e) =>
                          handleInputChange('eposta', e.target.value.toLowerCase())
                        }
                        className={errors.eposta ? 'border-red-500' : ''}
                      />
                      {errors.eposta && (
                        <p className="text-sm text-red-500">{errors.eposta}</p>
                      )}
                    </div>

                    {/* Telefon */}
                    <div className="space-y-2">
                      <Label htmlFor="telNo">
                        Telefon No <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="telNo"
                        type="tel"
                        value={formData.telNo}
                        onChange={(e) => handleInputChange('telNo', e.target.value)}
                        className={errors.telNo ? 'border-red-500' : ''}
                      />
                      {errors.telNo && (
                        <p className="text-sm text-red-500">{errors.telNo}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/users')}
                      disabled={isSaving}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Değişiklikleri Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Sağ taraf - Bilgiler */}
            <div className="space-y-6">
              {/* Genel Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Genel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                    <p className="text-sm font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                    <p className="text-sm font-medium">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rol</p>
                    <Badge variant="secondary">{roleLabels[user.rol]}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Takımlar */}
              {(user.ownedTeams && user.ownedTeams.length > 0) ||
              (user.teamMemberships && user.teamMemberships.length > 0) ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-base">Takımlar</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.ownedTeams && user.ownedTeams.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Kaptan Olduğu Takımlar
                        </p>
                        <div className="space-y-2">
                          {user.ownedTeams.map((team) => (
                            <div
                              key={team.id}
                              className="rounded-lg border bg-orange-50 p-3 dark:bg-orange-950"
                            >
                              <p className="text-sm font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {sportLabels[team.sport]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.teamMemberships && user.teamMemberships.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Üye Olduğu Takımlar
                        </p>
                        <div className="space-y-2">
                          {user.teamMemberships.map((membership, index) => (
                            <div
                              key={index}
                              className="rounded-lg border p-3"
                            >
                              <p className="text-sm font-medium">
                                {membership.team.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {sportLabels[membership.team.sport]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

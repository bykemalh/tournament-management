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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Edit,
  Save,
  X,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserData {
  id: string;
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
  role?: 'PLAYER' | 'REFEREE' | 'ADMIN';
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    adSoyad: '',
    eposta: '',
    telNo: '',
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      console.log('Profile page user data:', data); // Debug için
      setUser(data);
      setFormData({
        adSoyad: data.adSoyad || '',
        eposta: data.eposta || '',
        telNo: data.telNo || '',
      });
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user!, ...formData });
        setSuccess('Profil başarıyla güncellendi');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Profil güncellenirken hata oluştu');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      adSoyad: user!.adSoyad,
      eposta: user!.eposta,
      telNo: user!.telNo,
    });
    setIsEditing(false);
    setError('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Şifre başarıyla değiştirildi');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setPasswordSuccess('');
          setIsPasswordDialogOpen(false);
        }, 2000);
      } else {
        setPasswordError(data.error || 'Şifre değiştirilirken hata oluştu');
      }
    } catch {
      setPasswordError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsChangingPassword(false);
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

  const roleLabels = {
    PLAYER: 'Oyuncu',
    REFEREE: 'Hakem',
    ADMIN: 'Yönetici',
  };

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
                  <Link href="/referee" onClick={() => NProgress.start()}>
                    Hakem Paneli
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Profilim</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
            <p className="text-muted-foreground">
              Hesap bilgilerinizi görüntüleyin ve düzenleyin
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kişisel Bilgiler</CardTitle>
                    <CardDescription>
                      Profil bilgilerinizi güncelleyin
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adSoyad">Ad Soyad</Label>
                    {isEditing ? (
                      <Input
                        id="adSoyad"
                        value={formData.adSoyad}
                        onChange={(e) =>
                          setFormData({ ...formData, adSoyad: e.target.value })
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
                    <Label htmlFor="eposta">E-posta</Label>
                    {isEditing ? (
                      <Input
                        id="eposta"
                        type="email"
                        value={formData.eposta}
                        onChange={(e) =>
                          setFormData({ ...formData, eposta: e.target.value })
                        }
                        placeholder="E-posta"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.eposta}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telNo">Telefon</Label>
                    {isEditing ? (
                      <Input
                        id="telNo"
                        value={formData.telNo}
                        onChange={(e) =>
                          setFormData({ ...formData, telNo: e.target.value })
                        }
                        placeholder="Telefon"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.telNo}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>TC Kimlik No</Label>
                    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user.tcNo}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Değiştirilemez
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Doğum Tarihi</Label>
                    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {user.dogumTarihi ? new Date(user.dogumTarihi).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }) : 'Belirtilmemiş'}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Değiştirilemez
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                    >
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
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="mr-2 h-4 w-4" />
                      İptal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hesap Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rol</p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabels[user.role || 'PLAYER']}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Durum</p>
                      <p className="text-xs text-green-600">Aktif</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Güvenlik</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        Şifre Değiştir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Şifre Değiştir</DialogTitle>
                        <DialogDescription>
                          Hesabınızın güvenliği için güçlü bir şifre kullanın
                        </DialogDescription>
                      </DialogHeader>

                      {passwordError && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-700">
                          {passwordSuccess}
                        </div>
                      )}

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              placeholder="Mevcut şifrenizi girin"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Yeni Şifre</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Yeni şifrenizi girin (en az 6 karakter)"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              placeholder="Yeni şifrenizi tekrar girin"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isChangingPassword}
                          className="w-full"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Değiştiriliyor...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Şifreyi Değiştir
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </>
  );
}

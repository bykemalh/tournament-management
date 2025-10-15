'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  Plus,
  Flag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
  rol: 'PLAYER' | 'REFEREE' | 'ADMIN';
}

interface RefereeFormData {
  adSoyad: string;
  tcNo: string;
  eposta: string;
  telNo: string;
  dogumTarihi: string;
  sifre: string;
  sifreOnay: string;
}

interface FormErrors {
  adSoyad?: string;
  tcNo?: string;
  eposta?: string;
  telNo?: string;
  dogumTarihi?: string;
  sifre?: string;
  sifreOnay?: string;
}

const roleLabels: Record<string, string> = {
  PLAYER: 'Oyuncu',
  REFEREE: 'Hakem',
  ADMIN: 'Yönetici',
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLAYER: 'default',
  REFEREE: 'secondary',
  ADMIN: 'outline',
};

export default function UsersManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Hakem oluşturma dialog state'leri
  const [isRefereeDialogOpen, setIsRefereeDialogOpen] = useState(false);
  const [isCreatingReferee, setIsCreatingReferee] = useState(false);
  const [refereeFormData, setRefereeFormData] = useState<RefereeFormData>({
    adSoyad: '',
    tcNo: '',
    eposta: '',
    telNo: '',
    dogumTarihi: '',
    sifre: '',
    sifreOnay: '',
  });
  const [refereeFormErrors, setRefereeFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    checkAuthAndFetchUsers();

    // URL'den role parametresi varsa filtrele
    const role = searchParams.get('role');
    if (role) {
      setRoleFilter(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, roleFilter]);

  const checkAuthAndFetchUsers = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }
      const userData = await userResponse.json();

      if (userData.rol !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      // Tüm kullanıcıları getir
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Role filtresi
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.rol === roleFilter);
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.adSoyad.toLowerCase().includes(query) ||
          user.tcNo.includes(query) ||
          user.eposta.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setDeleteUserId(null);
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı başarıyla silindi',
        });
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      toast({
        title: 'Hata',
        description: 'Kullanıcı silinemedi',
        variant: 'destructive',
      });
    }
  };


  // Hakem oluşturma fonksiyonları
  const validateRefereeForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!refereeFormData.adSoyad.trim()) {
      newErrors.adSoyad = 'Ad Soyad gereklidir';
    } else if (refereeFormData.adSoyad.trim().length < 3) {
      newErrors.adSoyad = 'Ad Soyad en az 3 karakter olmalıdır';
    }

    if (!refereeFormData.tcNo.trim()) {
      newErrors.tcNo = 'TC Kimlik No gereklidir';
    } else if (!/^\d{11}$/.test(refereeFormData.tcNo)) {
      newErrors.tcNo = 'TC Kimlik No 11 haneli olmalıdır';
    }

    if (!refereeFormData.eposta.trim()) {
      newErrors.eposta = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(refereeFormData.eposta)) {
      newErrors.eposta = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!refereeFormData.telNo.trim()) {
      newErrors.telNo = 'Telefon numarası gereklidir';
    } else if (refereeFormData.telNo.trim().length < 10) {
      newErrors.telNo = 'Telefon numarası en az 10 karakter olmalıdır';
    }

    if (!refereeFormData.dogumTarihi) {
      newErrors.dogumTarihi = 'Doğum tarihi gereklidir';
    } else {
      const birthDate = new Date(refereeFormData.dogumTarihi);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dogumTarihi = 'Hakem en az 18 yaşında olmalıdır';
      }
    }

    if (!refereeFormData.sifre) {
      newErrors.sifre = 'Şifre gereklidir';
    } else if (refereeFormData.sifre.length < 6) {
      newErrors.sifre = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!refereeFormData.sifreOnay) {
      newErrors.sifreOnay = 'Şifre onayı gereklidir';
    } else if (refereeFormData.sifre !== refereeFormData.sifreOnay) {
      newErrors.sifreOnay = 'Şifreler eşleşmiyor';
    }

    setRefereeFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateReferee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRefereeForm()) {
      return;
    }

    setIsCreatingReferee(true);

    try {
      const response = await fetch('/api/admin/referees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSoyad: refereeFormData.adSoyad.trim(),
          tcNo: refereeFormData.tcNo.trim(),
          eposta: refereeFormData.eposta.trim().toLowerCase(),
          telNo: refereeFormData.telNo.trim(),
          dogumTarihi: refereeFormData.dogumTarihi,
          sifre: refereeFormData.sifre,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Hakem başarıyla oluşturuldu',
        });
        setIsRefereeDialogOpen(false);
        // Formu sıfırla
        setRefereeFormData({
          adSoyad: '',
          tcNo: '',
          eposta: '',
          telNo: '',
          dogumTarihi: '',
          sifre: '',
          sifreOnay: '',
        });
        setRefereeFormErrors({});
        // Kullanıcı listesini yenile
        checkAuthAndFetchUsers();
      } else {
        toast({
          title: 'Hata',
          description: data.error || 'Hakem oluşturulamadı',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Hakem oluşturma hatası:', error);
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingReferee(false);
    }
  };

  const handleRefereeInputChange = (field: keyof RefereeFormData, value: string) => {
    setRefereeFormData((prev) => ({ ...prev, [field]: value }));
    if (refereeFormErrors[field]) {
      setRefereeFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Kullanıcılar yükleniyor...</p>
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
                <BreadcrumbPage>Kullanıcılar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <Dialog open={isRefereeDialogOpen} onOpenChange={setIsRefereeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Flag className="mr-2 h-4 w-4" />
                Hakem Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Hakem Oluştur</DialogTitle>
                <DialogDescription>
                  Hakem bilgilerini girerek sisteme yeni hakem ekleyin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReferee} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Ad Soyad */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="adSoyad">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="adSoyad"
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={refereeFormData.adSoyad}
                      onChange={(e) => handleRefereeInputChange('adSoyad', e.target.value)}
                      className={refereeFormErrors.adSoyad ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.adSoyad && (
                      <p className="text-sm text-red-500">{refereeFormErrors.adSoyad}</p>
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
                      placeholder="11 haneli TC No"
                      maxLength={11}
                      value={refereeFormData.tcNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleRefereeInputChange('tcNo', value);
                      }}
                      className={refereeFormErrors.tcNo ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.tcNo && (
                      <p className="text-sm text-red-500">{refereeFormErrors.tcNo}</p>
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
                      value={refereeFormData.dogumTarihi}
                      onChange={(e) => handleRefereeInputChange('dogumTarihi', e.target.value)}
                      className={refereeFormErrors.dogumTarihi ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.dogumTarihi && (
                      <p className="text-sm text-red-500">{refereeFormErrors.dogumTarihi}</p>
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
                      placeholder="ornek@email.com"
                      value={refereeFormData.eposta}
                      onChange={(e) =>
                        handleRefereeInputChange('eposta', e.target.value.toLowerCase())
                      }
                      className={refereeFormErrors.eposta ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.eposta && (
                      <p className="text-sm text-red-500">{refereeFormErrors.eposta}</p>
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
                      placeholder="05XXXXXXXXX"
                      value={refereeFormData.telNo}
                      onChange={(e) => handleRefereeInputChange('telNo', e.target.value)}
                      className={refereeFormErrors.telNo ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.telNo && (
                      <p className="text-sm text-red-500">{refereeFormErrors.telNo}</p>
                    )}
                  </div>

                  {/* Şifre */}
                  <div className="space-y-2">
                    <Label htmlFor="sifre">
                      Şifre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sifre"
                      type="password"
                      placeholder="En az 6 karakter"
                      value={refereeFormData.sifre}
                      onChange={(e) => handleRefereeInputChange('sifre', e.target.value)}
                      className={refereeFormErrors.sifre ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.sifre && (
                      <p className="text-sm text-red-500">{refereeFormErrors.sifre}</p>
                    )}
                  </div>

                  {/* Şifre Onay */}
                  <div className="space-y-2">
                    <Label htmlFor="sifreOnay">
                      Şifre Onay <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sifreOnay"
                      type="password"
                      placeholder="Şifreyi tekrar girin"
                      value={refereeFormData.sifreOnay}
                      onChange={(e) => handleRefereeInputChange('sifreOnay', e.target.value)}
                      className={refereeFormErrors.sifreOnay ? 'border-red-500' : ''}
                    />
                    {refereeFormErrors.sifreOnay && (
                      <p className="text-sm text-red-500">{refereeFormErrors.sifreOnay}</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRefereeDialogOpen(false)}
                    disabled={isCreatingReferee}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isCreatingReferee}>
                    {isCreatingReferee ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Flag className="mr-2 h-4 w-4" />
                        Hakem Oluştur
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ad, TC No veya E-posta ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Rol Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Roller</SelectItem>
                  <SelectItem value="PLAYER">Oyuncu</SelectItem>
                  <SelectItem value="REFEREE">Hakem</SelectItem>
                  <SelectItem value="ADMIN">Yönetici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Kayıtlı kullanıcıların listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>TC No</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Kullanıcı bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.adSoyad}</TableCell>
                      <TableCell>{user.tcNo}</TableCell>
                      <TableCell>{user.eposta}</TableCell>
                      <TableCell>{user.telNo}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariants[user.rol]}>
                          {roleLabels[user.rol]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

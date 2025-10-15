# Route İsimlendirme ve Profil/Ayarlar Sayfaları

## ✅ Yapılan Değişiklikler

### 1. Tüm Route'lar İngilizce'ye Çevrildi

#### Önceki (Türkçe):
```
/dashboard/turnuvalar          → /dashboard/tournaments
/dashboard/turnuvalar/aktif    → /dashboard/tournaments/active
/dashboard/turnuvalar/olustur  → /dashboard/tournaments/create
/dashboard/takimlar            → /dashboard/teams
/dashboard/takimlar/olustur    → /dashboard/teams/create
/dashboard/maclar              → /dashboard/matches
/dashboard/takvim              → /dashboard/calendar
/dashboard/istatistikler       → /dashboard/stats
/dashboard/profil              → /dashboard/profile
/dashboard/ayarlar             → /dashboard/settings
```

#### Admin Route'ları:
```
/dashboard/admin/kullanicilar  → /dashboard/admin/users
/dashboard/admin/hakemler      → /dashboard/admin/referees
/dashboard/admin/ayarlar       → /dashboard/admin/settings
```

### 2. Profile Sayfası (`/dashboard/profile`)

#### Özellikler:
- ✅ Kullanıcı bilgilerini görüntüleme
- ✅ Ad Soyad düzenleme
- ✅ E-posta düzenleme
- ✅ Telefon düzenleme
- ✅ TC No görüntüleme (değiştirilemez)
- ✅ Doğum tarihi görüntüleme (değiştirilemez)
- ✅ Hesap durumu kartı (Rol, Durum)
- ✅ Güvenlik kartı (Şifre değiştir linki)

#### UI/UX:
- Edit modu toggle
- Gerçek zamanlı form validasyonu
- Success/Error mesajları
- Loading states
- İptal butonu (değişiklikleri geri al)
- Kaydet butonu
- Değiştirilemez alanlar gri (disabled)

#### API Endpoint:
**PUT** `/api/user/update-profile`
```typescript
Body: {
  adSoyad: string;
  eposta: string;
  telNo: string;
}
```

**Validasyon:**
- Ad Soyad: Min 3 karakter
- E-posta: Valid email format
- Telefon: Türk telefon formatı (10 haneli)
- E-posta benzersizlik kontrolü

### 3. Settings Sayfası (`/dashboard/settings`)

#### Özellikler:
- ✅ Şifre değiştirme formu
- ✅ Mevcut şifre kontrolü
- ✅ Yeni şifre validasyonu
- ✅ Şifre eşleşme kontrolü
- ✅ Şifre göster/gizle toggle (Eye icon)
- ✅ Güvenlik ipuçları kartı
- ✅ Placeholder kartlar (Bildirimler, Görünüm)

#### Şifre Değiştirme:
**Form Alanları:**
1. Mevcut Şifre
2. Yeni Şifre (min 6 karakter)
3. Yeni Şifre (Tekrar)

**Validasyon:**
- Mevcut şifre doğru olmalı
- Yeni şifre min 6 karakter
- Yeni şifreler eşleşmeli
- Güvenlik ipuçları gösteriliyor

#### API Endpoint:
**POST** `/api/user/change-password`
```typescript
Body: {
  currentPassword: string;
  newPassword: string;
}
```

**Kontroller:**
- JWT token doğrulama
- Mevcut şifre verification
- Yeni şifre hashing (bcrypt, 12 rounds)
- Database update

### 4. Sidebar Güncellemeleri

#### Menu Items:
```typescript
// Türkçe etiketler, İngilizce URL'ler
{
  title: 'Ana Sayfa',        // Türkçe
  url: '/dashboard',          // İngilizce
}
{
  title: 'Turnuvalar',
  url: '/dashboard/tournaments',
  subItems: [
    { title: 'Tüm Turnuvalar', url: '/dashboard/tournaments' },
    { title: 'Aktif Turnuvalar', url: '/dashboard/tournaments/active' },
    { title: 'Turnuva Oluştur', url: '/dashboard/tournaments/create' },
  ]
}
```

#### Footer Menu:
```typescript
<DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
  <User /> Profilim
</DropdownMenuItem>

<DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
  <Settings /> Ayarlar
</DropdownMenuItem>

<DropdownMenuItem onClick={handleLogout}>
  <LogOut /> Çıkış Yap
</DropdownMenuItem>
```

## 📁 Yeni Dosyalar

```
app/
  dashboard/
    profile/
      page.tsx                    ✅ Yeni - Profil sayfası
    settings/
      page.tsx                    ✅ Yeni - Ayarlar sayfası
  api/
    user/
      update-profile/
        route.ts                  ✅ Yeni - Profil güncelleme
      change-password/
        route.ts                  ✅ Yeni - Şifre değiştirme
components/
  app-sidebar.tsx               ♻️ Güncellendi - Route'lar İngilizce
```

## 🎨 UI Özellikleri

### Profile Sayfası:
- **Sol Taraf (2 kolon)**: Düzenlenebilir form
- **Sağ Taraf (1 kolon)**: 
  - Hesap Durumu kartı
  - Güvenlik kartı

### Settings Sayfası:
- **Sol Taraf (2 kolon)**: Şifre değiştirme formu
- **Sağ Taraf (1 kolon)**:
  - Güvenlik ipuçları
  - Bildirimler (yakında)
  - Görünüm (yakında)

## 🔒 Güvenlik

### Profile Update:
- JWT token kontrolü
- E-posta benzersizlik kontrolü
- Input sanitization
- Zod validation

### Password Change:
- Mevcut şifre verification
- bcrypt hashing (12 rounds)
- Min 6 karakter
- Şifre eşleşme kontrolü

## ✨ Kullanıcı Deneyimi

### Success/Error States:
- ✅ Yeşil banner: "Profil başarıyla güncellendi"
- ❌ Kırmızı banner: "E-posta zaten kullanılıyor"
- ⏳ Loading: "Kaydediliyor..." / "Değiştiriliyor..."

### Form İyileştirmeleri:
- Real-time validation
- Password visibility toggle
- Disabled fields (TC No, Doğum Tarihi)
- Cancel button (revert changes)
- Auto-dismiss success messages (3 saniye)

### Navigation:
- Breadcrumb: Dashboard → Profilim / Ayarlar
- Sidebar active state
- Quick access from user dropdown

## 📊 Özet

**Route İsimlendirme:**
- ✅ Tüm URL'ler İngilizce
- ✅ UI etiketleri Türkçe (kullanıcı deneyimi)
- ✅ API endpoint'leri İngilizce
- ✅ Tutarlı naming convention

**Yeni Sayfalar:**
- ✅ Profile: Görüntüleme + Düzenleme
- ✅ Settings: Şifre değiştirme + Gelecek özellikler

**API Entegrasyonu:**
- ✅ `/api/user/update-profile` - PUT
- ✅ `/api/user/change-password` - POST
- ✅ Gerçek veritabanı işlemleri
- ✅ Tam validation ve güvenlik

**Kod Kalitesi:**
- ✅ TypeScript strict mode
- ✅ Zod validation
- ✅ Error handling
- ✅ Loading states
- ✅ Clean, maintainable code

Sistem production-ready! 🚀

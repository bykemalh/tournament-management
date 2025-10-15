# 🏆 Turnuva Yönetim Sistemi

Profesyonel turnuva, takım ve maç yönetimi için geliştirilmiş modern web uygulaması. Next.js 15.5, PostgreSQL, Prisma ORM ve shadcn/ui ile geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Sistem Gereksinimleri](#-sistem-gereksinimleri)
- [Kurulum](#-kurulum)
- [Veritabanı Yapılandırması](#-veritabanı-yapılandırması)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [API Endpoint'leri](#-api-endpointleri)
- [Kimlik Doğrulama](#-kimlik-doğrulama)
- [Rol Yönetimi](#-rol-yönetimi)
- [Spor Dalları](#-spor-dalları)
- [Geliştirme](#-geliştirme)
- [Deployment](#-deployment)
- [Lisans](#-lisans)

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- ✅ TC Kimlik No ile kayıt ve giriş sistemi
- ✅ JWT tabanlı güvenli oturum yönetimi (HTTP-only cookies)
- ✅ Rol bazlı erişim kontrolü (PLAYER, REFEREE, ADMIN)
- ✅ Profil yönetimi ve şifre değiştirme
- ✅ Kullanıcı aktivite takibi

### 🎯 Takım Yönetimi
- ✅ Takım oluşturma ve düzenleme
- ✅ 8 haneli benzersiz referans kodu sistemi
- ✅ Takım kaptanlığı ve üye yönetimi
- ✅ Referans kodu ile takıma katılma
- ✅ 8 farklı spor dalı desteği
- ✅ Takım istatistikleri ve performans takibi

### 🏅 Turnuva Yönetimi
- ✅ Turnuva oluşturma ve düzenleme
- ✅ Turnuva durumu takibi (Yaklaşan, Devam Eden, Tamamlanmış, İptal)
- ✅ Hakem ataması
- ✅ Takım katılım yönetimi
- ✅ Maksimum takım kapasitesi kontrolü

### ⚔️ Maç Yönetimi
- ✅ Maç programlama ve takvim
- ✅ Canlı skor takibi
- ✅ Maç durumu yönetimi (Planlanmış, Canlı, Tamamlandı, İptal)
- ✅ Maç geçmişi ve sonuçlar

### 📊 İstatistik ve Raporlama
- ✅ Kullanıcı dashboard'u
- ✅ Hakem kontrol paneli
- ✅ Admin yönetim paneli
- ✅ Gerçek zamanlı istatistikler
- ✅ Aktivite akışı

### 🎨 Kullanıcı Arayüzü
- ✅ Modern ve responsive tasarım
- ✅ Dark/Light tema desteği
- ✅ Türkçe dil desteği
- ✅ Mobil uyumlu
- ✅ Loading state'leri ve animasyonlar
- ✅ Toast bildirimleri

## 🛠 Teknolojiler

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **React**: 19.1.0
- **TypeScript**: Type-safe development
- **Styling**: Tailwind CSS v4 (CSS variables)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Hooks
- **Theme**: next-themes (dark/light mode)
- **Progress Bar**: NProgress + next-nprogress-bar

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma 6.17.1
- **Authentication**: Custom JWT (jose library)
- **Password Hashing**: bcryptjs (12 rounds)
- **Validation**: Zod schemas

### DevOps
- **Build Tool**: Turbopack (Next.js 15)
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Database Migrations**: Prisma Migrate
- **Seeding**: TypeScript seed scripts

## 💻 Sistem Gereksinimleri

- **Node.js**: 20.x veya üzeri
- **npm**: 10.x veya üzeri
- **PostgreSQL**: 14.x veya üzeri
- **Git**: Versiyon kontrolü için

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd tournament-management
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/turnuva_db"

# JWT Secret (güvenli bir key kullanın)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Node Environment
NODE_ENV="development"
```

### 4. Veritabanını Hazırlayın

```bash
# Prisma Client oluştur
npx prisma generate

# Veritabanı migration'larını çalıştır
npx prisma db push

# Veya migration ile:
npx prisma migrate dev --name init

# Test verilerini ekle
npm run seed
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🗄️ Veritabanı Yapılandırması

### Prisma Schema

Proje, PostgreSQL veritabanı ile Prisma ORM kullanır. Tüm alan adları Türkçe'dir:

```prisma
model User {
  id          String   @id @default(cuid())
  adSoyad     String   // Ad Soyad
  tcNo        String   @unique  // TC Kimlik No
  eposta      String   @unique  // E-posta
  telNo       String   // Telefon
  dogumTarihi DateTime // Doğum Tarihi
  sifre       String   // Şifre (hashed)
  role        Role     @default(PLAYER)
}
```

### Migration'lar

Veritabanı şeması değişikliklerini yönetmek için:

```bash
# Yeni migration oluştur
npx prisma migrate dev --name aciklama

# Migration'ları production'a uygula
npx prisma migrate deploy

# Veritabanını sıfırla (dikkatli!)
npx prisma migrate reset
```

### Veritabanı Yönetimi

Prisma Studio ile veritabanını görselleştirin:

```bash
npx prisma studio
```

Studio, [http://localhost:5555](http://localhost:5555) adresinde açılır.

## 📖 Kullanım

### Test Hesapları

Seed scripti ile oluşturulan test hesapları:

| Rol    | TC Kimlik No | Şifre     | E-posta            |
|--------|--------------|-----------|-------------------|
| Admin  | 11111111111  | admin123  | admin@turnuva.com |
| Hakem  | 22222222222  | hakem123  | hakem@turnuva.com |

### Yeni Kullanıcı Kaydı

1. `/register` sayfasına gidin
2. Formu doldurun (TC Kimlik No zorunlu)
3. Kayıt olduktan sonra otomatik giriş yapılır
4. Dashboard'a yönlendirilirsiniz

### Takım Oluşturma

1. Dashboard'da "Takım Oluştur" butonuna tıklayın
2. Takım adı ve spor dalı seçin
3. Otomatik 8 haneli referans kodu oluşturulur
4. Kaptan olarak otomatik üye olursunuz

### Takıma Katılma

1. "Takıma Katıl" sayfasına gidin
2. 8 haneli referans kodunu girin
3. Onay aldıktan sonra takıma üye olursunuz

## 📁 Proje Yapısı

```
tournament-management/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Kimlik doğrulama
│   │   │   ├── login/            # Giriş endpoint'i
│   │   │   ├── register/         # Kayıt endpoint'i
│   │   │   ├── logout/           # Çıkış endpoint'i
│   │   │   └── me/               # Kullanıcı bilgileri
│   │   ├── teams/                # Takım API'leri
│   │   │   ├── create/           # Takım oluşturma
│   │   │   ├── join/             # Takıma katılma
│   │   │   ├── my-teams/         # Kullanıcının takımları
│   │   │   └── [id]/             # Takım detayı
│   │   ├── dashboard/            # Dashboard API'leri
│   │   │   ├── stats/            # Genel istatistikler
│   │   │   └── activities/       # Aktivite akışı
│   │   ├── admin/                # Admin API'leri
│   │   │   ├── users/            # Kullanıcı yönetimi
│   │   │   └── referees/         # Hakem yönetimi
│   │   └── user/                 # Kullanıcı profil API'leri
│   ├── dashboard/                # Oyuncu dashboard
│   │   ├── page.tsx              # Ana dashboard
│   │   ├── team/                 # Takım yönetimi
│   │   ├── teams/                # Takım listesi
│   │   ├── matches/              # Maçlar
│   │   ├── calendar/             # Takvim
│   │   ├── stats/                # İstatistikler
│   │   ├── profile/              # Profil
│   │   └── settings/             # Ayarlar
│   ├── admin/                    # Admin paneli
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── users/                # Kullanıcı yönetimi
│   │   ├── profile/              # Admin profil
│   │   └── settings/             # Admin ayarları
│   ├── referee/                  # Hakem paneli
│   │   ├── page.tsx              # Hakem dashboard
│   │   ├── matches/              # Maç yönetimi
│   │   ├── profile/              # Hakem profil
│   │   └── settings/             # Hakem ayarları
│   ├── login/                    # Giriş sayfası
│   ├── register/                 # Kayıt sayfası
│   ├── team-onboarding/          # Takım onboarding
│   ├── teams/                    # Genel takım sayfası
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Ana sayfa
│   └── globals.css               # Global stiller
├── components/                   # React bileşenleri
│   ├── ui/                       # shadcn/ui bileşenleri
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── app-sidebar.tsx           # Uygulama sidebar
│   ├── progress-bar.tsx          # Progress bar
│   └── theme-provider.tsx        # Tema sağlayıcı
├── lib/                          # Utility fonksiyonlar
│   ├── auth.ts                   # JWT auth servisi
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validations.ts            # Zod şemaları
│   └── utils.ts                  # Yardımcı fonksiyonlar
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Veritabanı şeması
│   ├── seed.ts                   # Seed scripti
│   └── migrations/               # Migration dosyaları
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobil algılama
│   └── use-toast.ts              # Toast hook
├── public/                       # Statik dosyalar
├── .env                          # Ortam değişkenleri
├── components.json               # shadcn/ui config
├── next.config.ts                # Next.js konfigürasyonu
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## 🔌 API Endpoint'leri

### Kimlik Doğrulama

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/api/auth/login` | Kullanıcı girişi | ❌ |
| POST | `/api/auth/logout` | Kullanıcı çıkışı | ✅ |
| GET | `/api/auth/me` | Oturum bilgisi | ✅ |

### Takım Yönetimi

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/teams/create` | Yeni takım oluştur | ✅ |
| GET | `/api/teams` | Tüm takımları listele | ✅ |
| GET | `/api/teams/[id]` | Takım detayı | ✅ |
| POST | `/api/teams/join` | Takıma katıl | ✅ |
| GET | `/api/teams/my-teams` | Kullanıcının takımları | ✅ |

### Dashboard

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/dashboard/stats` | Dashboard istatistikleri | ✅ |
| GET | `/api/dashboard/activities` | Aktivite akışı | ✅ |

### Admin

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/admin/users` | Kullanıcı listesi | ✅ ADMIN |
| GET | `/api/admin/users/[id]` | Kullanıcı detayı | ✅ ADMIN |
| GET | `/api/admin/referees` | Hakem listesi | ✅ ADMIN |
| GET | `/api/admin/referees/[id]` | Hakem detayı | ✅ ADMIN |

### Kullanıcı Profil

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/user/update-profile` | Profil güncelle | ✅ |
| POST | `/api/user/change-password` | Şifre değiştir | ✅ |

## 🔐 Kimlik Doğrulama

### JWT Token Yapısı

```typescript
interface JWTPayload {
  userId: string;    // Kullanıcı ID
  tcNo: string;      // TC Kimlik No
}
```

### Token Özellikleri

- **Algoritma**: HS256
- **Süre**: 7 gün
- **Depolama**: HTTP-only cookie
- **SameSite**: lax
- **Secure**: Production'da true

### Şifre Hashleme

- **Algoritma**: bcryptjs
- **Salt Rounds**: 12
- **Doğrulama**: Zaman sabitlemeli karşılaştırma

### Auth Akışı

1. Kullanıcı `/api/auth/login` veya `/api/auth/register` endpoint'ine istek atar
2. Kimlik bilgileri doğrulanır
3. JWT token oluşturulur
4. Token HTTP-only cookie'de saklanır
5. Her API isteğinde cookie otomatik gönderilir
6. Middleware token'ı doğrular
7. Geçersiz/süresi dolmuş token'da 401 döner

## 👑 Rol Yönetimi

### Roller

```typescript
enum Role {
  PLAYER   // Oyuncu - Varsayılan rol
  REFEREE  // Hakem - Maç yönetimi
  ADMIN    // Admin - Tam yetki
}
```

### Rol Yetkileri

#### PLAYER (Oyuncu)
- ✅ Takım oluşturma ve yönetme
- ✅ Takıma katılma
- ✅ Kendi takımlarını görme
- ✅ Turnuvalara katılma
- ✅ Maç sonuçlarını görme
- ✅ Profil yönetimi

#### REFEREE (Hakem)
- ✅ Player yetkilerine ek olarak:
- ✅ Atandığı turnuvaları yönetme
- ✅ Maç sonuçlarını güncelleme
- ✅ Maç durumlarını değiştirme
- ✅ Hakem dashboard erişimi

#### ADMIN (Yönetici)
- ✅ Tüm yetkiler
- ✅ Kullanıcı yönetimi
- ✅ Rol atama
- ✅ Turnuva yönetimi
- ✅ Hakem atama
- ✅ Sistem ayarları
- ✅ Admin dashboard erişimi

### Rol Kontrolü

API route'larında:

```typescript
const payload = await AuthService.verifyToken(token);
if (!payload) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const user = await prisma.user.findUnique({
  where: { id: payload.userId },
});

if (user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## ⚽ Spor Dalları

Sistem 8 farklı spor dalını destekler:

```typescript
enum SportType {
  FOOTBALL    // Futbol
  BASKETBALL  // Basketbol
  VOLLEYBALL  // Voleybol
  TENNIS      // Tenis
  HANDBALL    // Hentbol
  TABLETENNIS // Masa Tenisi
  BADMINTON   // Badminton
  ESPORTS     // E-Spor
}
```

Her takım bir spor dalına ait olur ve bu alan takım oluşturulurken seçilir (varsayılan: FOOTBALL).

## 🔧 Geliştirme

### Komutlar

```bash
# Geliştirme sunucusu (Turbopack ile)
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# Linting
npm run lint

# Database seeding
npm run seed

# Prisma Studio
npx prisma studio

# Migration oluştur
npx prisma migrate dev --name migration_adi

# Prisma client yenile
npx prisma generate
```

### shadcn/ui Bileşen Ekleme

```bash
# Yeni bileşen ekle
npx shadcn@latest add <component-name>

# Örnek: dialog ekle
npx shadcn@latest add dialog
```

Bileşenler otomatik olarak `components/ui/` klasörüne eklenir.

### Kod Standartları

- **TypeScript**: Strict mode etkin
- **ESLint**: Code quality kontrolü
- **Prettier**: Code formatting (opsiyonel)
- **Naming Conventions**:
  - Components: PascalCase (`UserCard.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - API Routes: lowercase (`route.ts`)
  - Database Fields: Türkçe camelCase (`adSoyad`, `tcNo`)

### Git Workflow

```bash
# Feature branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklikleri commit et
git add .
git commit -m "feat: yeni özellik eklendi"

# Main branch'e merge et
git checkout main
git merge feature/yeni-ozellik
```

### Commit Mesaj Formatı

- `feat:` Yeni özellik
- `fix:` Bug düzeltme
- `docs:` Dokümantasyon
- `style:` Kod formatı
- `refactor:` Kod yeniden yapılandırma
- `test:` Test ekleme/düzeltme
- `chore:` Bakım işleri

## 🚢 Deployment

### Vercel (Önerilen)

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com)'e gidin
3. "Import Project" ile projeyi içe aktarın
4. Environment variables'ları ekleyin
5. Deploy edin

### Environment Variables (Vercel)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
NODE_ENV=production
```

### PostgreSQL Database

Production için önerilen sağlayıcılar:
- [Vercel Postgres](https://vercel.com/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

### Build Komutları

```bash
# Build
npm run build

# Migration'ları çalıştır
npx prisma migrate deploy

# Sunucuyu başlat
npm start
```

### Docker (Opsiyonel)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Performans Optimizasyonları

- ✅ Next.js Image Optimization
- ✅ Automatic Code Splitting
- ✅ Server Components (React Server Components)
- ✅ Turbopack build tool
- ✅ Font optimization (Geist)
- ✅ CSS-in-JS with Tailwind
- ✅ API Route caching strategies

## 🐛 Bilinen Sorunlar ve Çözümler

### Prisma Client Hatası

**Hata**: `PrismaClient is unable to run in the browser`

**Çözüm**: `lib/prisma.ts` dosyasında singleton pattern kullanıldığından emin olun.

### Cookie Çalışmıyor

**Hata**: Token cookie'de saklanmıyor

**Çözüm**: 
- `sameSite: 'lax'` ayarını kontrol edin
- HTTPS kullanıyorsanız `secure: true` olmalı
- Localhost'ta `secure: false` olmalı

### Migration Hataları

**Hata**: Migration çalışmıyor

**Çözüm**:
```bash
npx prisma migrate reset  # Dikkat: Tüm veriyi siler
npx prisma db push        # Alternatif: Schema'yı direkt push eder
```

## 📝 Notlar

- Tüm API endpoint'leri Türkçe hata mesajları döner
- TC Kimlik No giriş için benzersiz tanımlayıcıdır (e-posta değil)
- Şifreler asla API response'larında dönmez
- Tüm tarih/saat bilgileri UTC formatındadır
- Referans kodları 8 haneli alfanumeriktir (I, O, 0, 1 hariç)
- JWT token'lar 7 gün geçerlidir
- Password hash'leme bcrypt 12 rounds kullanır

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: amazing feature eklendi'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [GitHub](https://github.com/yourusername)

Proje Linki: [https://github.com/yourusername/tournament-management](https://github.com/yourusername/tournament-management)

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Özellikler ve dokümantasyon düzenli olarak güncellenmektedir.

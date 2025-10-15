# Copilot Instructions - Tournament Management System

## Project Overview
Next.js 15.5 tournament management system with PostgreSQL, Prisma ORM, and shadcn/ui. Turkish language UI with role-based access (PLAYER, REFEREE, ADMIN). Uses JWT authentication via HTTP-only cookies.

## Architecture Patterns

### Authentication Flow
- **Custom JWT auth** (not NextAuth): JWT tokens in HTTP-only cookies, 7-day expiry
- `lib/auth.ts` provides `AuthService` for password hashing (bcrypt, 12 rounds) and JWT signing/verification (jose library)
- Login credential: TC Kimlik No (11-digit Turkish ID) + password, not email
- Auth endpoints: `/api/auth/{register,login,logout,me}` - all return user object without `sifre` field
- No middleware - auth checks done per-route via cookie token validation

### Database & Prisma
- **Turkish field names in schema**: `adSoyad`, `tcNo`, `eposta`, `telNo`, `dogumTarihi`, `sifre`
- Prisma singleton: `lib/prisma.ts` prevents multiple instances in dev hot-reload
- Relations: Teams → Captain (User), Tournaments → Referee (User), cascading deletes on team/tournament participation
- Enums: `Role` (PLAYER/REFEREE/ADMIN), `TournamentStatus`, `MatchStatus`
- Seeding: `npm run seed` creates test users (admin: TC 11111111111 / admin123, referee: 22222222222 / hakem123)

### Form Validation
- Zod schemas in `lib/validations.ts` with **Turkish error messages**
- Custom regex validators: TC No (`/^[1-9][0-9]{10}$/`), Turkish phone (`/^(\+90|0)?[0-9]{10}$/`)
- Client-side: React Hook Form + `@hookform/resolvers/zod`
- API validation: Parse with Zod, return `ZodError.issues` in 400 responses

### UI Components (shadcn/ui)
- Config: `components.json` - "new-york" style, RSC enabled, neutral base color
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/ui`
- Icons: Lucide React
- Tailwind v4 with CSS variables for theming, orange accent color (`text-orange-500`, `ring-orange-500`)
- Client components marked with `'use client'` directive (forms, interactive elements)

## Key Conventions

### API Routes
```typescript
// Standard error responses
return NextResponse.json({ error: 'Turkish error message' }, { status: 4xx/5xx });

// Success with cookie
const response = NextResponse.json({ message: '...', data: ... });
response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
});
```

### Database Queries
- Always exclude `sifre` field in user selects: `select: { id: true, adSoyad: true, ... }`
- Use `findFirst` with `OR` for duplicate checks (TC No / email)
- Date handling: Convert ISO strings to `Date` objects for Prisma (`new Date(dateString)`)

### Client-Side Forms
- `useState` for error messages and loading states
- `router.push('/dashboard')` on successful auth
- Turkish placeholders and labels (`"Ad Soyad"`, `"TC Kimlik No"`, `"Şifre"`)

## Development Workflows

### Setup
```bash
npm install
npx prisma generate
npx prisma db push
npm run seed    # Creates test users
npm run dev     # Starts on localhost:3000 with Turbopack
```

### Database Changes
```bash
npx prisma migrate dev --name description
npx prisma studio  # GUI at localhost:5555
```

### Adding shadcn/ui Components
```bash
npx shadcn@latest add <component-name>
# Components auto-install to components/ui/
```

## Environment Variables
Required in `.env`:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NODE_ENV="development|production"
```

## Critical Gotchas
- TC Kimlik No is the **unique login identifier**, not email
- All user-facing text must be **Turkish** (error messages, labels, placeholders)
- Never expose `sifre` field in API responses or client state
- Prisma client must use singleton pattern (`lib/prisma.ts`) to avoid connection exhaustion
- Forms need `'use client'` directive for React Hook Form to work
- JWT verification returns `null` on failure - always check before accessing payload properties

'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, Award, Sun, Moon } from 'lucide-react';

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full shadow-lg border-2"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Tema Değiştir</span>
        </Button>
      </div>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Turnuva Yönetim Sistemi
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Turnuvalarınızı
            <br />
            Profesyonelce Yönetin
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Kolay kullanımlı arayüz ile turnuvalarınızı organize edin,
            takip edin ve yönetin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                Hemen Başla
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-orange-50 border-orange-200 hover:border-orange-300 text-orange-600 shadow-lg"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Özellikler
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow hover:scale-105 transform duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">Turnuva Yönetimi</h3>
              <p className="text-muted-foreground">
                Turnuvalarınızı kolayca oluşturun ve yönetin
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow hover:scale-105 transform duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">Takım Organizasyonu</h3>
              <p className="text-muted-foreground">
                Takımları organize edin ve yönetin
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow hover:scale-105 transform duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">Takvim Planlama</h3>
              <p className="text-muted-foreground">
                Maç programlarını otomatik oluşturun
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow hover:scale-105 transform duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-400 rounded-2xl flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">Skor Takibi</h3>
              <p className="text-muted-foreground">
                Sonuçları anlık olarak kaydedin ve paylaşın
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <Card className="border-2 shadow-2xl bg-orange-500 text-white overflow-hidden">
          <CardContent className="py-16 px-8 text-center relative">
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Hemen Başlamaya Hazır Mısınız?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Ücretsiz hesap oluşturun ve turnuvalarınızı yönetmeye başlayın
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl mt-4"
                >
                  Ücretsiz Kayıt Ol
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

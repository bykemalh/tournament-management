'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PlayerSidebar, RefereeSidebar } from '@/components/app-sidebar';
import { ReactNode, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

function LoadingFallback() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRefereeSection = pathname?.startsWith('/dashboard/referee');
  const SidebarComponent = isRefereeSection ? RefereeSidebar : PlayerSidebar;

  return (
    <SidebarProvider>
      <SidebarComponent />
      <SidebarInset>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}

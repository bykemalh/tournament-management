'use client';

import { ReactNode, Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

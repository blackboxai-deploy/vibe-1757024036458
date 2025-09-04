'use client';

import { AppProvider } from '@/contexts/AppContext';
import { MainLayout } from '@/components/MainLayout';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen w-full bg-background">
        <MainLayout />
        <Toaster />
      </div>
    </AppProvider>
  );
}
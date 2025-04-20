'use client';

import React from 'react';
import { StoreProvider } from '@/providers/StoreProvider';
import RootLayout from './RootLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <RootLayout>{children}</RootLayout>
    </StoreProvider>
  );
}


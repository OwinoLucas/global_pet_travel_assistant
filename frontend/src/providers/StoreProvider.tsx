'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';

// Create store instance for the provider
const store = makeStore();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}


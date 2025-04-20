'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { cn } from '@/lib/utils';

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className={cn(
          "flex-1 p-4 md:p-6 pt-20 md:pt-24",
          className
        )}>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default RootLayout;


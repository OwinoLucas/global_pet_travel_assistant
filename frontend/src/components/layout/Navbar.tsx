import React from 'react';
import Link from 'next/link';
import { Menu, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, className }) => {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-foreground hover:bg-primary-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <Link href="/" className="flex items-center ml-2 md:ml-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paw-print">
                <circle cx="11" cy="4" r="2"/>
                <circle cx="18" cy="8" r="2"/>
                <circle cx="20" cy="16" r="2"/>
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground">PetTravel</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-background p-1 text-foreground hover:bg-accent-50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Profile dropdown */}
          <div className="relative ml-3">
            <div className="flex rounded-full bg-secondary text-secondary-foreground">
              <button
                type="button"
                className="flex rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <span className="sr-only">Open user menu</span>
                <User className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


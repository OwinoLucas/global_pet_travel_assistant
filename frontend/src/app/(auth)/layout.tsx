import Link from "next/link";
import { PawPrint } from "lucide-react";

export const metadata = {
  title: 'Authentication | Global Pet Travel Assistant',
  description: 'Sign in or register for Global Pet Travel Assistant',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-background p-4 md:p-8">
      <div className="w-full max-w-[500px]">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <PawPrint className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-foreground">Global Pet Travel Assistant</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Making international pet travel easier and stress-free
          </p>
        </div>
        
        <div>
          {children}
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Global Pet Travel Assistant. 
            All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/terms" className="hover:text-primary hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-primary hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

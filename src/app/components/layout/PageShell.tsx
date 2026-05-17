import type { ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { cn } from '../../utils/cn';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageShell({ children, className, contentClassName }: PageShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <Navbar />
      <main className={cn('max-w-screen-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8', contentClassName)}>
        {children}
      </main>
    </div>
  );
}

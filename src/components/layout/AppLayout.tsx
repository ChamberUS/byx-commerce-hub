import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
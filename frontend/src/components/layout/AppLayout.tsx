import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNav for desktop/tablet, hidden on mobile */}
      {!hideNav && !isMobile && <TopNav />}
      
      <main className={`flex-1 ${isMobile && !hideNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {/* BottomNav for mobile only */}
      {!hideNav && isMobile && <BottomNav />}
    </div>
  );
}

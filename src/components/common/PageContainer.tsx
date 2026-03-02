import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * PageContainer - Utilitário padrão para padding e responsividade
 * 
 * Features:
 * - Padding bottom automático para não ficar atrás da BottomNav
 * - Max-width responsivo
 * - Padding horizontal consistente
 */
export function PageContainer({ 
  children, 
  className, 
  noPadding = false,
  maxWidth = '7xl' 
}: PageContainerProps) {
  return (
    <div className={cn(
      // Max width
      maxWidthClasses[maxWidth],
      'mx-auto',
      // Padding horizontal
      !noPadding && 'px-4 md:px-6',
      // Padding vertical
      !noPadding && 'py-6 md:py-8',
      // Padding bottom para BottomNav (apenas mobile)
      'pb-20 md:pb-6',
      className
    )}>
      {children}
    </div>
  );
}

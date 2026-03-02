import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * MobileCard - Card otimizado para mobile
 * Usa padding menor e melhor touch feedback
 */
export function MobileCard({ children, className, onClick }: MobileCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border',
        'transition-all',
        isMobile ? 'p-3' : 'p-4 md:p-6',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-primary/30 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}

/**
 * ResponsiveInput - Input com label e min-height 44px
 */
export function ResponsiveInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false,
  className 
}: ResponsiveInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="flex h-11 md:h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

/**
 * StepIndicator - Indicador de steps mobile-friendly
 */
export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <span className="text-sm font-medium">
          Passo {currentStep} de {totalSteps}
        </span>
        {stepLabels && stepLabels[currentStep - 1] && (
          <span className="text-xs text-muted-foreground">
            • {stepLabels[currentStep - 1]}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div key={idx} className="flex items-center">
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium text-sm',
            idx + 1 === currentStep ? 'border-primary bg-primary text-primary-foreground' :
            idx + 1 < currentStep ? 'border-success bg-success text-success-foreground' :
            'border-muted bg-background text-muted-foreground'
          )}>
            {idx + 1}
          </div>
          {idx < totalSteps - 1 && (
            <div className={cn(
              'w-12 md:w-20 h-0.5 mx-2',
              idx + 1 < currentStep ? 'bg-success' : 'bg-muted'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

interface StickyBottomBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * StickyBottomBar - Barra fixa no bottom para CTAs mobile
 * Fica acima da BottomNav
 */
export function StickyBottomBar({ children, className }: StickyBottomBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-40',
      'bg-background/95 backdrop-blur-lg border-t',
      'p-4 pb-safe md:pb-4',
      // Espaço para BottomNav no mobile
      'mb-16 md:mb-0',
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

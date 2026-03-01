import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export function SettingsItem({
  icon: Icon,
  label,
  description,
  onClick,
  variant = 'default',
  rightElement,
  disabled = false,
}: SettingsItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl text-left',
        'transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-accent active:bg-accent/80',
        variant === 'destructive' && 'text-destructive'
      )}
    >
      <div
        className={cn(
          'rounded-xl p-2.5',
          variant === 'destructive' ? 'bg-destructive/10' : 'bg-muted'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
      {rightElement || (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
}
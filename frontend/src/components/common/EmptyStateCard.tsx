import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'gradient';
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  variant = 'default',
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-8 text-center',
        variant === 'gradient'
          ? 'bg-gradient-to-br from-primary/10 to-primary/5'
          : 'bg-muted/50',
        className
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Button asChild>
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}

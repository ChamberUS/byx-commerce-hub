import { HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface BeginnerModeToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function BeginnerModeToggle({
  checked,
  onCheckedChange,
  disabled = false,
}: BeginnerModeToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl bg-accent/50',
        disabled && 'opacity-50'
      )}
    >
      <div className="rounded-xl p-2.5 bg-primary/10">
        <HelpCircle className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">Modo iniciante</p>
        <p className="text-sm text-muted-foreground">
          {checked
            ? 'Explicações simples e passo a passo'
            : 'Modo avançado para usuários experientes'}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label="Alternar modo iniciante"
      />
    </div>
  );
}
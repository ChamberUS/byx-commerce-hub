import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="rounded-2xl bg-card border p-4 space-y-3">
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aparência</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

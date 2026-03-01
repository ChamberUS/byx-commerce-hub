import { ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileType = 'cliente' | 'lojista';

interface ProfileTypeSelectorProps {
  value?: ProfileType;
  onChange: (type: ProfileType) => void;
}

const options = [
  {
    type: 'cliente' as ProfileType,
    icon: ShoppingBag,
    title: 'Quero Comprar',
    description: 'Explorar produtos e fazer compras com BYX',
  },
  {
    type: 'lojista' as ProfileType,
    icon: Store,
    title: 'Quero Vender',
    description: 'Criar minha loja e receber pagamentos em BYX',
  },
];

export function ProfileTypeSelector({ value, onChange }: ProfileTypeSelectorProps) {
  return (
    <div className="grid gap-4">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.type;

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={cn(
              'flex items-start gap-4 p-5 rounded-2xl border-2 text-left',
              'transition-all duration-200',
              'hover:border-primary/50 hover:bg-accent/50',
              isSelected
                ? 'border-primary bg-accent shadow-sm'
                : 'border-border bg-card'
            )}
          >
            <div
              className={cn(
                'rounded-xl p-3 transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{option.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {option.description}
              </p>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1',
                'flex items-center justify-center transition-colors',
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              )}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
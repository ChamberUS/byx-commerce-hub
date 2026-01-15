import { LucideIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface WalletTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

export function WalletTypeCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
}: WalletTypeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-2xl border bg-card text-left
        flex items-center gap-4 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 active:bg-accent'}
      `}
    >
      <div className="p-3 rounded-xl bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.button>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface SeedPhraseDisplayProps {
  words: string[];
  onContinue: () => void;
}

export function SeedPhraseDisplay({ words, onContinue }: SeedPhraseDisplayProps) {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(words.join(' '));
      setCopied(true);
      toast({ title: 'Frase copiada!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao copiar' });
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      {/* Warning */}
      <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground">Importante!</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Esta é sua única forma de recuperar sua carteira. Guarde em um local seguro e nunca compartilhe com ninguém.
            </p>
          </div>
        </div>
      </div>

      {/* Seed Phrase Grid */}
      <div className="relative mb-6">
        <div className="grid grid-cols-3 gap-2">
          {words.map((word, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-muted/50 border text-center"
            >
              <span className="text-xs text-muted-foreground">{index + 1}.</span>{' '}
              <span className={`font-mono font-medium ${!revealed ? 'blur-sm select-none' : ''}`}>
                {word}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Blur overlay */}
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
            <Button
              variant="secondary"
              onClick={() => setRevealed(true)}
              className="gap-2 rounded-xl"
            >
              <Eye className="w-4 h-4" />
              Revelar frase
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => setRevealed(!revealed)}
          className="flex-1 gap-2 rounded-xl"
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {revealed ? 'Ocultar' : 'Revelar'}
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 gap-2 rounded-xl"
          disabled={!revealed}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>

      {/* Confirmation */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 mb-6">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked === true)}
        />
        <label
          htmlFor="confirm"
          className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
        >
          Eu entendo que se perder minha frase de recuperação, perderei o acesso à minha carteira permanentemente.
        </label>
      </div>

      {/* Continue Button */}
      <div className="mt-auto">
        <Button
          onClick={onContinue}
          disabled={!confirmed || !revealed}
          className="w-full h-12 rounded-xl"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

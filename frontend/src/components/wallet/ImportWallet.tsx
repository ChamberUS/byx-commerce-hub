import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { validateSeedPhrase } from '@/lib/wallet-utils';
import { useToast } from '@/hooks/use-toast';

interface ImportWalletProps {
  onSuccess: (words: string[]) => void;
}

export function ImportWallet({ onSuccess }: ImportWalletProps) {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    const words = input
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);

    if (words.length !== 12 && words.length !== 24) {
      setError('A frase deve ter 12 ou 24 palavras');
      return;
    }

    if (!validateSeedPhrase(words)) {
      setError('Algumas palavras não são válidas');
      return;
    }

    onSuccess(words);
  };

  const wordCount = input.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-2xl bg-primary/10">
          <Download className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Instructions */}
      <p className="text-muted-foreground text-center mb-6">
        Digite sua frase de recuperação de 12 ou 24 palavras separadas por espaços
      </p>

      {/* Warning */}
      <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Nunca compartilhe sua frase de recuperação. Certifique-se de estar em um local seguro.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2 mb-6">
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          placeholder="palavra1 palavra2 palavra3..."
          className="min-h-32 rounded-xl font-mono text-sm resize-none"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />
        
        <div className="flex justify-between text-sm">
          <span className={error ? 'text-destructive' : 'text-muted-foreground'}>
            {error || `${wordCount} palavras digitadas`}
          </span>
          <span className="text-muted-foreground">
            {wordCount === 12 || wordCount === 24 ? '✓' : `Falta ${12 - wordCount}`}
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-auto">
        <Button
          onClick={handleImport}
          disabled={wordCount !== 12 && wordCount !== 24}
          className="w-full h-12 rounded-xl"
        >
          Importar carteira
        </Button>
      </div>
    </div>
  );
}

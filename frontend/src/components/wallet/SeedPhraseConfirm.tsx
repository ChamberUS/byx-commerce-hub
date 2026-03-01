import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SeedPhraseConfirmProps {
  words: string[];
  onSuccess: () => void;
}

export function SeedPhraseConfirm({ words, onSuccess }: SeedPhraseConfirmProps) {
  const { toast } = useToast();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Shuffle words for selection
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [words]);

  const handleSelectWord = (word: string) => {
    if (selectedWords.includes(word)) return;
    
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    setError(false);
  };

  const handleRemoveWord = (index: number) => {
    const newSelected = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newSelected);
    setError(false);
  };

  const handleVerify = () => {
    const isCorrect = selectedWords.every((word, index) => word === words[index]);
    
    if (isCorrect && selectedWords.length === words.length) {
      onSuccess();
    } else {
      setError(true);
      toast({
        variant: 'destructive',
        title: 'Ordem incorreta',
        description: 'A frase não corresponde. Tente novamente.',
      });
      setSelectedWords([]);
    }
  };

  const handleClear = () => {
    setSelectedWords([]);
    setError(false);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      <p className="text-muted-foreground text-center mb-6">
        Toque nas palavras na ordem correta para confirmar sua frase de recuperação
      </p>

      {/* Selected Words Area */}
      <div className="min-h-32 p-4 rounded-2xl bg-muted/30 border border-dashed mb-6">
        {selectedWords.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            Toque nas palavras abaixo para começar
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <motion.button
                key={`selected-${index}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => handleRemoveWord(index)}
                className={`
                  px-3 py-2 rounded-lg font-mono text-sm
                  ${error ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}
                `}
              >
                <span className="text-xs opacity-60">{index + 1}.</span> {word}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Shuffled Words for Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shuffledWords.map((word, index) => {
          const isSelected = selectedWords.includes(word);
          
          return (
            <motion.button
              key={`shuffle-${index}`}
              whileHover={{ scale: isSelected ? 1 : 1.05 }}
              whileTap={{ scale: isSelected ? 1 : 0.95 }}
              onClick={() => handleSelectWord(word)}
              disabled={isSelected}
              className={`
                px-3 py-2 rounded-lg font-mono text-sm transition-all
                ${isSelected 
                  ? 'bg-muted text-muted-foreground opacity-50' 
                  : 'bg-card border hover:border-primary/50 active:bg-accent'}
              `}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {selectedWords.length > 0 && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="w-full rounded-xl"
          >
            Limpar e recomeçar
          </Button>
        )}
        
        <Button
          onClick={handleVerify}
          disabled={selectedWords.length !== words.length}
          className="w-full h-12 rounded-xl"
        >
          Verificar frase
        </Button>
      </div>
    </div>
  );
}

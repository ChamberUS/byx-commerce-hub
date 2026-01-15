import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PinSetupProps {
  onComplete: (pin: string) => void;
  loading?: boolean;
}

export function PinSetup({ onComplete, loading = false }: PinSetupProps) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const PIN_LENGTH = 4;
  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handleDigit = (digit: string) => {
    if (currentPin.length < PIN_LENGTH) {
      const newPin = currentPin + digit;
      setCurrentPin(newPin);
      setError('');

      if (newPin.length === PIN_LENGTH) {
        if (step === 'create') {
          setTimeout(() => setStep('confirm'), 300);
        } else {
          if (newPin === pin) {
            onComplete(newPin);
          } else {
            setError('Os PINs não coincidem');
            setConfirmPin('');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (currentPin.length > 0) {
      setCurrentPin(currentPin.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    setCurrentPin('');
    setError('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Icon */}
      <div className="p-4 rounded-2xl bg-primary/10 mb-6">
        <Lock className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground mb-2">
        {step === 'create' ? 'Crie seu PIN' : 'Confirme seu PIN'}
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        {step === 'create' 
          ? 'Escolha um PIN de 4 dígitos para proteger sua carteira'
          : 'Digite o PIN novamente para confirmar'}
      </p>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-4">
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: index < currentPin.length ? 1.1 : 1,
              backgroundColor: index < currentPin.length ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
            }}
            className="w-4 h-4 rounded-full"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-sm mb-4"
        >
          {error}
        </motion.p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs mt-4">
        {digits.map((digit, index) => {
          if (digit === '') {
            return <div key={index} />;
          }
          
          if (digit === 'del') {
            return (
              <Button
                key={index}
                variant="ghost"
                size="lg"
                onClick={handleDelete}
                onDoubleClick={handleClear}
                disabled={loading}
                className="h-16 rounded-2xl text-xl"
              >
                <Delete className="w-6 h-6" />
              </Button>
            );
          }

          return (
            <Button
              key={index}
              variant="outline"
              size="lg"
              onClick={() => handleDigit(digit)}
              disabled={loading || currentPin.length >= PIN_LENGTH}
              className="h-16 rounded-2xl text-xl font-semibold"
            >
              {digit}
            </Button>
          );
        })}
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
}

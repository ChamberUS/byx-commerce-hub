import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled = false, error = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }

    // Check if complete
    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newValues = [...values];
      pastedData.split('').forEach((digit, i) => {
        if (i < length) {
          newValues[i] = digit;
        }
      });
      setValues(newValues);

      // Focus last filled input or next empty
      const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
      focusInput(lastFilledIndex);

      // Check if complete
      const code = newValues.join('');
      if (code.length === length && !newValues.includes('')) {
        onComplete(code);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-semibold',
            'rounded-xl border-2 bg-background',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-destructive text-destructive'
              : 'border-input hover:border-primary/50'
          )}
          aria-label={`Dígito ${index + 1} do código`}
        />
      ))}
    </div>
  );
}
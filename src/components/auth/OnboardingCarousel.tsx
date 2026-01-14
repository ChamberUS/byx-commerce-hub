import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    icon: Globe,
    title: 'Compre e venda sem fronteiras',
    description:
      'O BYX conecta você a um mercado global. Encontre produtos únicos ou venda para o mundo todo.',
    color: 'bg-primary',
  },
  {
    icon: Shield,
    title: 'Pagamentos simples e seguros',
    description:
      'Transações protegidas por tecnologia de ponta. Você compra com confiança, o vendedor recebe com segurança.',
    color: 'bg-success',
  },
  {
    icon: Wallet,
    title: 'Você no controle do seu dinheiro',
    description:
      'Sua carteira BYX é sua. Sem bancos, sem taxas escondidas, sem surpresas. Simples assim.',
    color: 'bg-primary',
  },
];

export function OnboardingCarousel({ onComplete, onSkip }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Pular
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div
              className={cn(
                'w-20 h-20 rounded-3xl flex items-center justify-center mb-8',
                slides[currentSlide].color
              )}
            >
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="w-10 h-10 text-white" />;
              })()}
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {slides[currentSlide].title}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 pb-8 space-y-6">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={goToNext}
          className="w-full h-12 rounded-xl gap-2"
          size="lg"
        >
          {isLastSlide ? 'Começar' : 'Próximo'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
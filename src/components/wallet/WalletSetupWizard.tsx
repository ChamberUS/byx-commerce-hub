import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Download, 
  Link2, 
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletTypeCard } from './WalletTypeCard';
import { SeedPhraseDisplay } from './SeedPhraseDisplay';
import { SeedPhraseConfirm } from './SeedPhraseConfirm';
import { PinSetup } from './PinSetup';
import { ImportWallet } from './ImportWallet';
import { KeplrConnect } from './KeplrConnect';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSeedPhrase, 
  generateWalletAddress, 
  hashPin, 
  encryptSeedPhrase 
} from '@/lib/wallet-utils';

type WalletType = 'create' | 'import' | 'keplr';
type Step = 'choose' | 'seed' | 'confirm' | 'pin' | 'import' | 'keplr' | 'success';

interface WalletSetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function WalletSetupWizard({ onComplete, onCancel }: WalletSetupWizardProps) {
  const { createWallet } = useWallet();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('choose');
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChooseType = (type: WalletType) => {
    setWalletType(type);
    
    if (type === 'create') {
      const phrase = generateSeedPhrase(12);
      setSeedPhrase(phrase);
      setStep('seed');
    } else if (type === 'import') {
      setStep('import');
    } else if (type === 'keplr') {
      setStep('keplr');
    }
  };

  const handleSeedConfirmed = () => {
    setStep('confirm');
  };

  const handleConfirmSuccess = () => {
    setStep('pin');
  };

  const handleImportSuccess = (words: string[]) => {
    setSeedPhrase(words);
    setStep('pin');
  };

  const handleKeplrSuccess = async (address: string) => {
    setLoading(true);
    try {
      const { error } = await createWallet({
        address,
        wallet_type: 'keplr',
        pin_hash: '', // Keplr doesn't need PIN
      });

      if (error) throw error;
      setStep('success');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao conectar Keplr',
        description: 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinSet = async (pinValue: string) => {
    setPin(pinValue);
    setLoading(true);
    
    try {
      const address = generateWalletAddress();
      const pinHash = await hashPin(pinValue);
      const encryptedSeed = await encryptSeedPhrase(seedPhrase, pinValue);

      const { error } = await createWallet({
        address,
        wallet_type: walletType === 'import' ? 'imported' : 'internal',
        pin_hash: pinHash,
        seed_phrase_encrypted: encryptedSeed,
      });

      if (error) throw error;
      setStep('success');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar carteira',
        description: 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'seed') setStep('choose');
    else if (step === 'confirm') setStep('seed');
    else if (step === 'pin') setStep(walletType === 'import' ? 'import' : 'confirm');
    else if (step === 'import') setStep('choose');
    else if (step === 'keplr') setStep('choose');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {step !== 'success' && (
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={step === 'choose' ? onCancel : handleBack}
              className="rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {step === 'choose' && 'Configurar Carteira'}
              {step === 'seed' && 'Sua Frase de Recuperação'}
              {step === 'confirm' && 'Confirmar Frase'}
              {step === 'pin' && 'Criar PIN'}
              {step === 'import' && 'Importar Carteira'}
              {step === 'keplr' && 'Conectar Keplr'}
            </h1>
          </div>
        </header>
      )}

      {/* Content */}
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={step}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {step === 'choose' && (
            <div className="flex-1 px-4 py-6 space-y-4">
              <p className="text-muted-foreground text-center mb-6">
                Escolha como você quer configurar sua carteira BYX
              </p>
              
              <WalletTypeCard
                icon={Plus}
                title="Criar nova carteira"
                description="Gere uma nova carteira com frase de recuperação"
                onClick={() => handleChooseType('create')}
              />
              
              <WalletTypeCard
                icon={Download}
                title="Importar carteira"
                description="Use sua frase de recuperação existente"
                onClick={() => handleChooseType('import')}
              />
              
              <WalletTypeCard
                icon={Link2}
                title="Conectar Keplr"
                description="Use sua carteira Keplr existente"
                onClick={() => handleChooseType('keplr')}
              />
            </div>
          )}

          {step === 'seed' && (
            <SeedPhraseDisplay
              words={seedPhrase}
              onContinue={handleSeedConfirmed}
            />
          )}

          {step === 'confirm' && (
            <SeedPhraseConfirm
              words={seedPhrase}
              onSuccess={handleConfirmSuccess}
            />
          )}

          {step === 'pin' && (
            <PinSetup
              onComplete={handlePinSet}
              loading={loading}
            />
          )}

          {step === 'import' && (
            <ImportWallet onSuccess={handleImportSuccess} />
          )}

          {step === 'keplr' && (
            <KeplrConnect
              onSuccess={handleKeplrSuccess}
              loading={loading}
            />
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-6"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground mb-2">
                Carteira configurada!
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Sua carteira BYX está pronta para usar
              </p>

              <Button
                onClick={onComplete}
                className="w-full max-w-xs h-12 rounded-xl gap-2"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

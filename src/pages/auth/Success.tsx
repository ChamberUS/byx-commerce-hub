import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Wallet, ChevronRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Success() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSetupWallet = () => {
    // Placeholder - Fase 2
    navigate('/app', { replace: true });
  };

  const handleSkipWallet = () => {
    navigate('/app', { replace: true });
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Tudo pronto!</h1>
          <p className="text-muted-foreground mt-2">
            Sua conta BYX foi criada com sucesso, {profile?.nome?.split(' ')[0] || 'usuário'}.
          </p>
        </motion.div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="p-5 rounded-2xl border-2 border-primary/20 bg-accent/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Configure sua Carteira BYX
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Para pagar e receber, você precisa de uma carteira digital.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 space-y-2">
              <Button
                onClick={handleSetupWallet}
                className="w-full h-11 rounded-xl gap-2"
              >
                Fazer agora
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipWallet}
                className="w-full h-11 rounded-xl text-muted-foreground"
              >
                Depois
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Você pode configurar sua carteira a qualquer momento nas configurações.
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
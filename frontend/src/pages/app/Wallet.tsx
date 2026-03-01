import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode,
  Settings,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { formatAddress } from '@/lib/wallet-utils';

export default function Wallet() {
  const navigate = useNavigate();
  const { wallet, hasWallet } = useWallet();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast({ title: 'Endereço copiado!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!hasWallet) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-3xl bg-primary/10 mb-6"
          >
            <WalletIcon className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sua Carteira BYX
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-xs">
            Configure sua carteira para começar a pagar e receber no BYX
          </p>

          <Button
            onClick={() => navigate('/app/wallet/setup')}
            className="h-12 px-8 rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Configurar Carteira
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
        >
          <p className="text-sm opacity-80 mb-1">Saldo disponível</p>
          <h2 className="text-4xl font-bold mb-4">0.00 BYX</h2>
          
          {/* Address */}
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            <span className="font-mono">{formatAddress(wallet?.address || '')}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border"
          >
            <div className="p-3 rounded-xl bg-success/10">
              <ArrowDownLeft className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm font-medium">Receber</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border"
          >
            <div className="p-3 rounded-xl bg-primary/10">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Enviar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border"
          >
            <div className="p-3 rounded-xl bg-muted">
              <QrCode className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">QR Code</span>
          </motion.button>
        </div>

        {/* Wallet Info */}
        <div className="rounded-2xl bg-card border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Detalhes da Carteira</h3>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate('/app/account/security')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium capitalize">{wallet?.wallet_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-success capitalize">
                {wallet?.status === 'active' ? 'Ativa' : wallet?.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Biometria</span>
              <span className="font-medium">
                {wallet?.has_biometric ? 'Ativada' : 'Desativada'}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions (placeholder) */}
        <div className="rounded-2xl bg-card border p-4">
          <h3 className="font-semibold mb-4">Últimas Transações</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhuma transação ainda</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface KeplrConnectProps {
  onSuccess: (address: string) => void;
  loading?: boolean;
}

declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getKey: (chainId: string) => Promise<{ bech32Address: string; name: string }>;
    };
  }
}

export function KeplrConnect({ onSuccess, loading = false }: KeplrConnectProps) {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const isKeplrInstalled = typeof window !== 'undefined' && !!window.keplr;

  const handleConnect = async () => {
    if (!window.keplr) {
      setError('Keplr não encontrado. Instale a extensão primeiro.');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      // For demo, using cosmoshub-4 chainId
      // In production, use your chain's ID
      await window.keplr.enable('cosmoshub-4');
      const key = await window.keplr.getKey('cosmoshub-4');
      
      toast({
        title: 'Keplr conectado!',
        description: `Carteira: ${key.name}`,
      });
      
      onSuccess(key.bech32Address);
    } catch (err: any) {
      console.error('Keplr error:', err);
      if (err.message?.includes('Request rejected')) {
        setError('Conexão recusada pelo usuário');
      } else {
        setError('Erro ao conectar com Keplr');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleInstall = () => {
    window.open('https://www.keplr.app/download', '_blank');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-4 rounded-2xl bg-primary/10 mb-6"
      >
        <Link2 className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground mb-2">
        Conectar Keplr
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Use sua carteira Keplr existente para acessar o BYX
      </p>

      {/* Keplr Not Installed */}
      {!isKeplrInstalled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-4 rounded-2xl bg-warning/10 border border-warning/20 mb-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Keplr não detectado</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Instale a extensão Keplr no seu navegador para continuar.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-4 rounded-2xl bg-destructive/10 border border-destructive/20 mb-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {isKeplrInstalled ? (
          <Button
            onClick={handleConnect}
            disabled={connecting || loading}
            className="w-full h-12 rounded-xl gap-2"
          >
            {connecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Conectar Keplr
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleInstall}
            className="w-full h-12 rounded-xl gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Instalar Keplr
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center mt-8 max-w-sm">
        Keplr é uma carteira segura para blockchains Cosmos. 
        Sua chave privada nunca é compartilhada com o BYX.
      </p>
    </div>
  );
}

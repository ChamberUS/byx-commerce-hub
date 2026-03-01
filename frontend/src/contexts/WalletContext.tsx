import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type WalletType = 'internal' | 'keplr' | 'imported';
type WalletStatus = 'active' | 'locked' | 'pending_setup';

interface Wallet {
  id: string;
  user_id: string;
  address: string | null;
  wallet_type: WalletType;
  status: WalletStatus;
  has_biometric: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  hasWallet: boolean;
  isWalletActive: boolean;
  createWallet: (data: {
    address: string;
    wallet_type: WalletType;
    pin_hash: string;
    seed_phrase_encrypted?: string;
  }) => Promise<{ error: Error | null }>;
  updateWallet: (data: Partial<Wallet>) => Promise<{ error: Error | null }>;
  verifyPin: (pin: string) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async (userId: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }

    return data as Wallet | null;
  };

  const refreshWallet = async () => {
    if (user) {
      const walletData = await fetchWallet(user.id);
      setWallet(walletData);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet(user.id).then((data) => {
        setWallet(data);
        setLoading(false);
      });
    } else {
      setWallet(null);
      setLoading(false);
    }
  }, [user]);

  const createWallet = async (data: {
    address: string;
    wallet_type: WalletType;
    pin_hash: string;
    seed_phrase_encrypted?: string;
  }) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    const { error } = await supabase.from('wallets').insert({
      user_id: user.id,
      address: data.address,
      wallet_type: data.wallet_type,
      pin_hash: data.pin_hash,
      seed_phrase_encrypted: data.seed_phrase_encrypted,
      status: 'active',
    });

    if (!error) {
      await refreshWallet();
    }

    return { error: error as Error | null };
  };

  const updateWallet = async (data: Partial<Wallet>) => {
    if (!user || !wallet) {
      return { error: new Error('Carteira não encontrada') };
    }

    const { error } = await supabase
      .from('wallets')
      .update(data)
      .eq('id', wallet.id);

    if (!error) {
      await refreshWallet();
    }

    return { error: error as Error | null };
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    // Simple hash verification - in production use proper crypto
    if (!wallet) return false;
    const inputHash = btoa(pin);
    // This is a placeholder - real implementation would verify against stored hash
    return true;
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        hasWallet: !!wallet,
        isWalletActive: wallet?.status === 'active',
        createWallet,
        updateWallet,
        verifyPin,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

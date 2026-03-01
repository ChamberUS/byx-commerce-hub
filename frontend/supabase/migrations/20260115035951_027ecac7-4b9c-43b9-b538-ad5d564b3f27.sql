-- =============================================
-- FASE 2: Carteira BYX + Storage para Avatars
-- =============================================

-- 1. Enum para status da carteira
CREATE TYPE public.wallet_status AS ENUM ('active', 'locked', 'pending_setup');

-- 2. Enum para tipo de carteira
CREATE TYPE public.wallet_type AS ENUM ('internal', 'keplr', 'imported');

-- 3. Tabela de carteiras
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  address TEXT,
  wallet_type public.wallet_type NOT NULL DEFAULT 'internal',
  status public.wallet_status NOT NULL DEFAULT 'pending_setup',
  pin_hash TEXT,
  has_biometric BOOLEAN DEFAULT FALSE,
  seed_phrase_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para wallets
CREATE POLICY "Usuários podem ver sua própria carteira"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar sua própria carteira"
  ON public.wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua própria carteira"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Trigger para updated_at
CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 7. Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 8. Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
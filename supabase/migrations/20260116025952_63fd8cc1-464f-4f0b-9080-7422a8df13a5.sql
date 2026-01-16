
-- =============================================
-- BYX MARKETPLACE PHASE 3-5: Complete Schema
-- =============================================

-- ENUMS (if not exist)
DO $$ BEGIN
    CREATE TYPE public.listing_type AS ENUM ('fixed_price', 'accepts_offers', 'auction');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.product_condition AS ENUM ('new', 'used', 'refurbished');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'paused', 'sold', 'deleted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.message_type AS ENUM ('text', 'image', 'offer', 'system');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- SECTORS & CATEGORIES (hierarchical)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    emoji TEXT,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_id UUID REFERENCES public.sectors(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.category_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    input_type TEXT DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- STORES
-- =============================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    city TEXT,
    state TEXT,
    instagram TEXT,
    whatsapp TEXT,
    website TEXT,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PRODUCTS/LISTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price DECIMAL(18,2) NOT NULL,
    price_brl_ref DECIMAL(18,2),
    listing_type listing_type DEFAULT 'fixed_price',
    condition product_condition DEFAULT 'new',
    status product_status DEFAULT 'draft',
    allow_offers BOOLEAN DEFAULT false,
    min_offer_price DECIMAL(18,2),
    stock_quantity INT DEFAULT 1,
    sku TEXT,
    attributes JSONB DEFAULT '{}',
    views_count INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    price_modifier DECIMAL(18,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FAVORITES & SAVED SEARCHES
-- =============================================
CREATE TABLE IF NOT EXISTS public.favorites_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorites_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    notify_new_results BOOLEAN DEFAULT false,
    last_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL NOT NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(18,2) NOT NULL,
    shipping_cost DECIMAL(18,2) DEFAULT 0,
    total DECIMAL(18,2) NOT NULL,
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CHAT & MESSAGING
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    buyer_unread_count INT DEFAULT 0,
    store_unread_count INT DEFAULT 0,
    is_archived_buyer BOOLEAN DEFAULT false,
    is_archived_store BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    message_type message_type DEFAULT 'text',
    content TEXT,
    media_url TEXT,
    offer_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    status offer_status DEFAULT 'pending',
    counter_amount DECIMAL(18,2),
    message TEXT,
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- AIOS (Store Performance/Balance)
-- =============================================
CREATE TABLE IF NOT EXISTS public.aios_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance DECIMAL(18,2) DEFAULT 0,
    total_earned DECIMAL(18,2) DEFAULT 0,
    total_withdrawn DECIMAL(18,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.aios_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- LEGAL DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_id UUID REFERENCES public.legal_documents(id) ON DELETE CASCADE NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_sector ON public.categories(sector_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_store ON public.conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_favorites_products_user ON public.favorites_products(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_stores_user ON public.favorites_stores(user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.is_store_member(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.store_members
        WHERE user_id = _user_id AND store_id = _store_id
    ) OR EXISTS (
        SELECT 1 FROM public.stores
        WHERE id = _store_id AND owner_id = _user_id
    )
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = _conversation_id 
        AND (c.buyer_id = _user_id OR public.is_store_member(_user_id, c.store_id))
    )
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'BYX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS sectors_updated_at ON public.sectors;
CREATE TRIGGER sectors_updated_at BEFORE UPDATE ON public.sectors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS stores_updated_at ON public.stores;
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS quick_replies_updated_at ON public.quick_replies;
CREATE TRIGGER quick_replies_updated_at BEFORE UPDATE ON public.quick_replies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aios_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aios_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (using DROP IF EXISTS pattern)
-- =============================================

-- SECTORS & CATEGORIES (public read)
DROP POLICY IF EXISTS "Sectors are viewable by everyone" ON public.sectors;
CREATE POLICY "Sectors are viewable by everyone" ON public.sectors FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Category attributes are viewable by everyone" ON public.category_attributes;
CREATE POLICY "Category attributes are viewable by everyone" ON public.category_attributes FOR SELECT USING (true);

-- STORES
DROP POLICY IF EXISTS "Active stores are viewable by everyone" ON public.stores;
CREATE POLICY "Active stores are viewable by everyone" ON public.stores FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Store owner can update store" ON public.stores;
CREATE POLICY "Store owner can update store" ON public.stores FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated users can create store" ON public.stores;
CREATE POLICY "Authenticated users can create store" ON public.stores FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- STORE MEMBERS
DROP POLICY IF EXISTS "Store members are viewable by store members" ON public.store_members;
CREATE POLICY "Store members are viewable by store members" ON public.store_members 
    FOR SELECT USING (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store owner can manage members" ON public.store_members;
CREATE POLICY "Store owner can manage members" ON public.store_members 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid()));

-- PRODUCTS
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
CREATE POLICY "Active products are viewable by everyone" ON public.products 
    FOR SELECT USING (status = 'active' OR public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store members can insert products" ON public.products;
CREATE POLICY "Store members can insert products" ON public.products 
    FOR INSERT WITH CHECK (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store members can update products" ON public.products;
CREATE POLICY "Store members can update products" ON public.products 
    FOR UPDATE USING (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store members can delete products" ON public.products;
CREATE POLICY "Store members can delete products" ON public.products 
    FOR DELETE USING (public.is_store_member(auth.uid(), store_id));

-- PRODUCT MEDIA
DROP POLICY IF EXISTS "Product media viewable with product" ON public.product_media;
CREATE POLICY "Product media viewable with product" ON public.product_media 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.products p WHERE p.id = product_id 
        AND (p.status = 'active' OR public.is_store_member(auth.uid(), p.store_id))
    ));

DROP POLICY IF EXISTS "Store members can manage product media" ON public.product_media;
CREATE POLICY "Store members can manage product media" ON public.product_media 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.products p WHERE p.id = product_id 
        AND public.is_store_member(auth.uid(), p.store_id)
    ));

-- PRODUCT VARIATIONS
DROP POLICY IF EXISTS "Product variations viewable with product" ON public.product_variations;
CREATE POLICY "Product variations viewable with product" ON public.product_variations 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.products p WHERE p.id = product_id 
        AND (p.status = 'active' OR public.is_store_member(auth.uid(), p.store_id))
    ));

DROP POLICY IF EXISTS "Store members can manage variations" ON public.product_variations;
CREATE POLICY "Store members can manage variations" ON public.product_variations 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.products p WHERE p.id = product_id 
        AND public.is_store_member(auth.uid(), p.store_id)
    ));

-- FAVORITES PRODUCTS
DROP POLICY IF EXISTS "Users can view own product favorites" ON public.favorites_products;
CREATE POLICY "Users can view own product favorites" ON public.favorites_products 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add product favorites" ON public.favorites_products;
CREATE POLICY "Users can add product favorites" ON public.favorites_products 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove product favorites" ON public.favorites_products;
CREATE POLICY "Users can remove product favorites" ON public.favorites_products 
    FOR DELETE USING (auth.uid() = user_id);

-- FAVORITES STORES
DROP POLICY IF EXISTS "Users can view own store favorites" ON public.favorites_stores;
CREATE POLICY "Users can view own store favorites" ON public.favorites_stores 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add store favorites" ON public.favorites_stores;
CREATE POLICY "Users can add store favorites" ON public.favorites_stores 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove store favorites" ON public.favorites_stores;
CREATE POLICY "Users can remove store favorites" ON public.favorites_stores 
    FOR DELETE USING (auth.uid() = user_id);

-- SAVED SEARCHES
DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage own saved searches" ON public.saved_searches 
    FOR ALL USING (auth.uid() = user_id);

-- ORDERS
DROP POLICY IF EXISTS "Buyers can view own orders" ON public.orders;
CREATE POLICY "Buyers can view own orders" ON public.orders 
    FOR SELECT USING (auth.uid() = buyer_id OR public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders 
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Store members can update order status" ON public.orders;
CREATE POLICY "Store members can update order status" ON public.orders 
    FOR UPDATE USING (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Order items viewable with order" ON public.order_items;
CREATE POLICY "Order items viewable with order" ON public.order_items 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.orders o WHERE o.id = order_id 
        AND (o.buyer_id = auth.uid() OR public.is_store_member(auth.uid(), o.store_id))
    ));

DROP POLICY IF EXISTS "Order items created with order" ON public.order_items;
CREATE POLICY "Order items created with order" ON public.order_items 
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()
    ));

-- CONVERSATIONS
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations 
    FOR SELECT USING (public.is_conversation_participant(auth.uid(), id));

DROP POLICY IF EXISTS "Buyers can create conversations" ON public.conversations;
CREATE POLICY "Buyers can create conversations" ON public.conversations 
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations" ON public.conversations 
    FOR UPDATE USING (public.is_conversation_participant(auth.uid(), id));

-- MESSAGES
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages 
    FOR SELECT USING (public.is_conversation_participant(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages 
    FOR INSERT WITH CHECK (public.is_conversation_participant(auth.uid(), conversation_id) AND auth.uid() = sender_id);

DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;
CREATE POLICY "Participants can update messages" ON public.messages 
    FOR UPDATE USING (public.is_conversation_participant(auth.uid(), conversation_id));

-- OFFERS
DROP POLICY IF EXISTS "Participants can view offers" ON public.offers;
CREATE POLICY "Participants can view offers" ON public.offers 
    FOR SELECT USING (public.is_conversation_participant(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Buyers can create offers" ON public.offers;
CREATE POLICY "Buyers can create offers" ON public.offers 
    FOR INSERT WITH CHECK (auth.uid() = buyer_id AND public.is_conversation_participant(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Participants can update offers" ON public.offers;
CREATE POLICY "Participants can update offers" ON public.offers 
    FOR UPDATE USING (public.is_conversation_participant(auth.uid(), conversation_id));

-- QUICK REPLIES
DROP POLICY IF EXISTS "Store members can view quick replies" ON public.quick_replies;
CREATE POLICY "Store members can view quick replies" ON public.quick_replies 
    FOR SELECT USING (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store members can manage quick replies" ON public.quick_replies;
CREATE POLICY "Store members can manage quick replies" ON public.quick_replies 
    FOR ALL USING (public.is_store_member(auth.uid(), store_id));

-- AIOS
DROP POLICY IF EXISTS "Store members can view AIOS balance" ON public.aios_balances;
CREATE POLICY "Store members can view AIOS balance" ON public.aios_balances 
    FOR SELECT USING (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Store members can view AIOS transactions" ON public.aios_transactions;
CREATE POLICY "Store members can view AIOS transactions" ON public.aios_transactions 
    FOR SELECT USING (public.is_store_member(auth.uid(), store_id));

-- LEGAL DOCUMENTS
DROP POLICY IF EXISTS "Active legal documents are viewable" ON public.legal_documents;
CREATE POLICY "Active legal documents are viewable" ON public.legal_documents 
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view own acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can view own acceptances" ON public.legal_acceptances 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can create acceptances" ON public.legal_acceptances 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKETS (if not exist)
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
SELECT 'store-assets', 'store-assets', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'store-assets');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'product-images', 'product-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'chat-media', 'chat-media', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-media');

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Store assets are publicly accessible" ON storage.objects;
CREATE POLICY "Store assets are publicly accessible" ON storage.objects 
    FOR SELECT USING (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "Store members can upload store assets" ON storage.objects;
CREATE POLICY "Store members can upload store assets" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Store members can update store assets" ON storage.objects;
CREATE POLICY "Store members can update store assets" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Store members can delete store assets" ON storage.objects;
CREATE POLICY "Store members can delete store assets" ON storage.objects 
    FOR DELETE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible" ON storage.objects 
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Store members can upload product images" ON storage.objects;
CREATE POLICY "Store members can upload product images" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Store members can update product images" ON storage.objects;
CREATE POLICY "Store members can update product images" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Store members can delete product images" ON storage.objects;
CREATE POLICY "Store members can delete product images" ON storage.objects 
    FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Chat media accessible by authenticated" ON storage.objects;
CREATE POLICY "Chat media accessible by authenticated" ON storage.objects 
    FOR SELECT USING (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can upload chat media" ON storage.objects;
CREATE POLICY "Authenticated can upload chat media" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

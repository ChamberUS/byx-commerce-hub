/**
 * BYX Design System - Responsive Constants
 * Sistema unificado de breakpoints, spacing e sizing para mobile-first
 */

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const BREAKPOINTS = {
  mobile: 360,      // Mobile mínimo
  mobileLg: 430,    // Mobile large (iPhone Pro Max)
  tablet: 768,      // Tablet / iPad
  desktop: 1024,    // Desktop
  desktopLg: 1280,  // Desktop large
  desktopXl: 1536,  // Desktop XL
} as const;

export const MOBILE_BREAKPOINT = BREAKPOINTS.tablet; // 768px

// ============================================================================
// CONTAINER WIDTHS
// ============================================================================
export const CONTAINER = {
  mobile: 'max-w-full px-4',           // Full width com padding
  tablet: 'max-w-5xl mx-auto px-6',    // 1024px centered
  desktop: 'max-w-7xl mx-auto px-8',   // 1280px centered
} as const;

// ============================================================================
// GRID COLUMNS (Produtos, Categorias, Lojas)
// ============================================================================
export const GRID_COLS = {
  products: {
    mobile: 'grid-cols-2',      // 2 colunas
    tablet: 'md:grid-cols-3',   // 3 colunas
    desktop: 'lg:grid-cols-4',  // 4 colunas
  },
  categories: {
    mobile: 'grid-cols-2',
    tablet: 'md:grid-cols-4',
    desktop: 'lg:grid-cols-7',  // 7 categorias por linha
  },
  stores: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
} as const;

// ============================================================================
// SPACING (Mobile vs Desktop)
// ============================================================================
export const SPACING = {
  section: {
    mobile: 'space-y-6',      // 24px entre seções
    desktop: 'md:space-y-8',  // 32px entre seções
  },
  card: {
    mobile: 'gap-3 p-3',      // 12px padding e gap
    desktop: 'md:gap-4 md:p-4', // 16px padding e gap
  },
  page: {
    mobile: 'px-4 py-6',      // Padding da página
    desktop: 'md:px-6 md:py-8',
  },
} as const;

// ============================================================================
// TOUCH TARGETS (Mínimo 44x44px para mobile)
// ============================================================================
export const TOUCH_TARGET = {
  button: 'min-h-[44px] min-w-[44px]',
  input: 'min-h-[44px]',
  icon: 'h-5 w-5 md:h-4 md:w-4', // Ícones maiores no mobile
} as const;

// ============================================================================
// TYPOGRAPHY (Responsive Font Sizes)
// ============================================================================
export const TYPOGRAPHY = {
  h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl md:text-2xl lg:text-3xl font-bold',
  h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
  h4: 'text-base md:text-lg font-semibold',
  body: 'text-sm md:text-base',
  small: 'text-xs md:text-sm',
  tiny: 'text-[10px] md:text-xs',
} as const;

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================
export const LAYOUT = {
  // Bottom navigation offset (para não cobrir conteúdo)
  bottomNavOffset: 'pb-20 md:pb-0',
  
  // Sticky headers
  stickyHeader: 'sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b',
  stickyHeaderMobile: 'sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b lg:hidden',
  
  // Cards
  card: 'bg-card rounded-2xl border transition-all hover:shadow-lg hover:border-primary/30',
  cardCompact: 'bg-card rounded-xl border p-3 md:p-4',
  
  // Modals/Sheets
  sheetBottom: 'h-[80vh] md:h-auto', // Mobile: 80% altura, Desktop: auto
  
  // Safe areas (iOS notch)
  safeArea: 'pb-safe-area-inset-bottom',
} as const;

// ============================================================================
// ANIMATIONS (Sutis e performáticas)
// ============================================================================
export const ANIMATIONS = {
  // Glassmorphism
  glass: 'bg-background/70 backdrop-blur-xl border border-primary/10',
  
  // Hover effects
  hoverScale: 'transition-transform hover:scale-[1.02] active:scale-[0.98]',
  hoverLift: 'transition-all hover:shadow-lg hover:-translate-y-0.5',
  
  // Shimmer (loading)
  shimmer: 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted',
  
  // Fade in
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retorna classes de grid responsivo para produtos
 */
export const getProductGrid = () => {
  return `grid ${GRID_COLS.products.mobile} ${GRID_COLS.products.tablet} ${GRID_COLS.products.desktop} gap-3 md:gap-4`;
};

/**
 * Retorna classes de grid responsivo para categorias
 */
export const getCategoryGrid = () => {
  return `grid ${GRID_COLS.categories.mobile} ${GRID_COLS.categories.tablet} ${GRID_COLS.categories.desktop} gap-3 md:gap-4`;
};

/**
 * Retorna classes de grid responsivo para lojas
 */
export const getStoreGrid = () => {
  return `grid ${GRID_COLS.stores.mobile} ${GRID_COLS.stores.tablet} ${GRID_COLS.stores.desktop} gap-4 md:gap-6`;
};

/**
 * Retorna classes de container responsivo
 */
export const getContainer = (size: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
  return CONTAINER[size];
};

/**
 * Retorna classes de seção com spacing responsivo
 */
export const getSection = () => {
  return `${SPACING.section.mobile} ${SPACING.section.desktop}`;
};

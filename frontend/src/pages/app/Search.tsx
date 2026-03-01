import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X, Bookmark, Grid, List } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ZeroResults } from '@/components/common/ZeroResults';
import { useProducts, ProductFilters } from '@/hooks/use-products';
import { useSectors, useCategories } from '@/hooks/use-categories';
import { useCreateSavedSearch } from '@/hooks/use-saved-searches';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AISearchAssistant } from '@/components/search/AISearchAssistant';

const conditionOptions = [
  { value: 'new', label: 'Novo' },
  { value: 'used', label: 'Usado' },
  { value: 'refurbished', label: 'Recondicionado' },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'rating', label: 'Mais populares' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  const [filters, setFilters] = useState<ProductFilters>({
    query: searchParams.get('q') || '',
    category_id: searchParams.get('category') || undefined,
    condition: searchParams.get('condition')?.split(',') || [],
    allow_offers: searchParams.get('offers') === 'true' ? true : undefined,
    sort_by: (searchParams.get('sort') as ProductFilters['sort_by']) || 'newest',
    min_price: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    max_price: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
  });

  const { data: products, isLoading } = useProducts(filters);
  const { data: sectors } = useSectors();
  const { data: categories } = useCategories(searchParams.get('sector') || undefined);
  const saveSearch = useCreateSavedSearch();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category_id) params.set('category', filters.category_id);
    if (filters.condition?.length) params.set('condition', filters.condition.join(','));
    if (filters.allow_offers) params.set('offers', 'true');
    if (filters.sort_by && filters.sort_by !== 'newest') params.set('sort', filters.sort_by);
    if (filters.min_price) params.set('min', String(filters.min_price));
    if (filters.max_price) params.set('max', String(filters.max_price));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchQuery }));
  };

  const handleSaveSearch = async () => {
    if (!filters.query) {
      toast({ title: 'Digite algo para buscar primeiro', variant: 'destructive' });
      return;
    }
    
    try {
      await saveSearch.mutateAsync({ 
        query: filters.query, 
        filters: filters as unknown as Record<string, unknown>
      });
      toast({ title: 'Busca salva!', description: 'Você será notificado de novos resultados.' });
    } catch {
      toast({ title: 'Erro ao salvar busca', variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setFilters({ query: filters.query, sort_by: 'newest' });
    setPriceRange([0, 10000]);
  };

  const activeFiltersCount = [
    filters.category_id,
    filters.condition?.length,
    filters.allow_offers,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Condition */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Condição</Label>
        <div className="space-y-2">
          {conditionOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.condition?.includes(option.value)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    condition: checked
                      ? [...(prev.condition || []), option.value]
                      : prev.condition?.filter(c => c !== option.value)
                  }));
                }}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Faixa de Preço (BYX)</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommit={(value) => {
              setFilters(prev => ({
                ...prev,
                min_price: value[0] > 0 ? value[0] : undefined,
                max_price: value[1] < 10000 ? value[1] : undefined,
              }));
            }}
            max={10000}
            step={100}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={priceRange[0]}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceRange([val, priceRange[1]]);
                setFilters(prev => ({ ...prev, min_price: val > 0 ? val : undefined }));
              }}
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceRange([priceRange[0], val]);
                setFilters(prev => ({ ...prev, max_price: val < 10000 ? val : undefined }));
              }}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Accept Offers */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.allow_offers || false}
            onCheckedChange={(checked) => {
              setFilters(prev => ({ ...prev, allow_offers: checked ? true : undefined }));
            }}
          />
          <span className="text-sm">Aceita oferta</span>
        </label>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Categoria</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.category_id === category.id}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({ 
                      ...prev, 
                      category_id: checked ? category.id : undefined 
                    }));
                  }}
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar Filters */}
        {!isMobile && (
          <aside className="w-64 flex-shrink-0 hidden lg:block border-r min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Filtros</h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>
            <FilterContent />
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Header */}
          <div className="sticky top-0 lg:top-16 bg-background z-30 px-4 py-4 border-b">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="O que você está buscando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <Button type="submit" className="rounded-xl h-11">
                Buscar
              </Button>
            </form>

            {/* Active Filters & Sort */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {/* Mobile Filters Button */}
              {isMobile && (
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 flex-shrink-0">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto">
                      <FilterContent />
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        Limpar
                      </Button>
                      <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                        Aplicar
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* Sort */}
              <Select 
                value={filters.sort_by || 'newest'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as ProductFilters['sort_by'] }))}
              >
                <SelectTrigger className="w-auto h-9 rounded-xl text-sm gap-1">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Save Search */}
              {filters.query && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl gap-1 flex-shrink-0"
                  onClick={handleSaveSearch}
                  disabled={saveSearch.isPending}
                >
                  <Bookmark className="h-4 w-4" />
                  Salvar
                </Button>
              )}

              {/* Active Filter Chips */}
              {filters.condition?.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 flex-shrink-0">
                  {conditionOptions.find(o => o.value === c)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      condition: prev.condition?.filter(cond => cond !== c)
                    }));
                  }} />
                </Badge>
              ))}
              
              {filters.allow_offers && (
                <Badge variant="secondary" className="gap-1 flex-shrink-0">
                  Aceita oferta
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, allow_offers: undefined }))} />
                </Badge>
              )}
            </div>
          </div>

          {/* Sectors (horizontal scroll) */}
          {sectors && sectors.length > 0 && (
            <div className="px-4 py-3 border-b overflow-x-auto">
              <div className="flex gap-2">
                {sectors.map((sector) => (
                  <Link
                    key={sector.id}
                    to={`/app/search?sector=${sector.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-accent transition-colors flex-shrink-0 text-sm"
                  >
                    <span>{sector.emoji}</span>
                    <span>{sector.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="px-4 py-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
                  {filters.query && ` para "${filters.query}"`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <ZeroResults 
                query={filters.query}
                onClearFilters={clearFilters}
                onSaveSearch={filters.query ? handleSaveSearch : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Search Assistant */}
      <AISearchAssistant />
    </AppLayout>
  );
}

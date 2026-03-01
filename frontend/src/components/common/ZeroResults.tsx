import { Search, X, Bookmark, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ZeroResultsProps {
  query?: string;
  onClearFilters?: () => void;
  onSaveSearch?: () => void;
  suggestions?: string[];
}

export function ZeroResults({ query, onClearFilters, onSaveSearch, suggestions }: ZeroResultsProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">Nenhum resultado encontrado</h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {query
          ? `Não encontramos resultados para "${query}" com os filtros selecionados.`
          : 'Não encontramos produtos com os filtros selecionados.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="rounded-xl">
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
        
        {query && onSaveSearch && (
          <Button variant="secondary" onClick={onSaveSearch} className="rounded-xl">
            <Bookmark className="mr-2 h-4 w-4" />
            Salvar busca
          </Button>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-muted/50 rounded-2xl p-6 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-warning" />
          <span className="font-medium">Sugestões</span>
        </div>
        
        <ul className="text-left text-sm text-muted-foreground space-y-2">
          <li>• Tente buscar por termos mais gerais</li>
          <li>• Remova alguns filtros para ampliar a busca</li>
          <li>• Verifique se não há erros de digitação</li>
          <li>• Explore as categorias para encontrar o que procura</li>
        </ul>

        <div className="mt-4 pt-4 border-t">
          <Link 
            to="/app/search" 
            className="text-primary text-sm font-medium hover:underline"
          >
            Explorar todas as categorias →
          </Link>
        </div>
      </div>
    </div>
  );
}

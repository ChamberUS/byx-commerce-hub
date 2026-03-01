import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Frown, ArrowLeft, ShoppingBag, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-bold">BYX</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Frown className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="flex justify-center gap-1 text-6xl font-bold text-muted-foreground/30">
              <span>4</span>
              <span className="text-primary">0</span>
              <span>4</span>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
              <Link to="/app">
                <Home className="mr-2 h-4 w-4" />
                Voltar para Home
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-xl w-full sm:w-auto">
              <Link to="/app/search">
                <Search className="mr-2 h-4 w-4" />
                Buscar Produtos
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="bg-muted/50 rounded-2xl p-6">
            <p className="text-sm font-medium mb-4">Links úteis</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link 
                to="/app/search" 
                className="flex items-center gap-2 p-3 rounded-xl bg-background hover:bg-accent transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span>Explorar</span>
              </Link>
              <Link 
                to="/app/account" 
                className="flex items-center gap-2 p-3 rounded-xl bg-background hover:bg-accent transition-colors"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                <span>Suporte</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BYX. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default NotFound;

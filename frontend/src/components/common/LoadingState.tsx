import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Carregando...', fullScreen = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
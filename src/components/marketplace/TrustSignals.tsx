import { Shield, Zap, HeadphonesIcon, Lock } from 'lucide-react';

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      title: 'Compra Protegida',
      description: 'Escrow integrado para sua segurança',
    },
    {
      icon: Zap,
      title: 'Pagamento Rápido',
      description: 'Pague com AIOS/BYX em segundos',
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte 24/7',
      description: 'Estamos sempre aqui para ajudar',
    },
    {
      icon: Lock,
      title: 'Dados Seguros',
      description: 'Criptografia de ponta a ponta',
    },
  ];

  return (
    <section className="py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals.map((signal) => (
          <div
            key={signal.title}
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-card border"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <signal.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-sm mb-1">{signal.title}</h3>
            <p className="text-xs text-muted-foreground">{signal.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

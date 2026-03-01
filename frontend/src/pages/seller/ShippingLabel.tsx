import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useOrder } from '@/hooks/use-orders';
import { useMyStore } from '@/hooks/use-store';

export default function ShippingLabel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: store } = useMyStore();

  if (isLoading) return <AppLayout><div className="max-w-xl mx-auto px-4 py-6"><Skeleton className="h-96 rounded-xl" /></div></AppLayout>;
  if (!order) return <AppLayout><div className="max-w-xl mx-auto px-4 py-12 text-center"><p>Pedido não encontrado</p></div></AppLayout>;

  const addr = order.shipping_address as Record<string, string> | null;
  const originAddr = (store as unknown as Record<string, unknown>)?.origin_address as Record<string, string> | null;

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b print:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-lg font-semibold flex-1">Etiqueta de Envio</h1>
          <Button onClick={() => window.print()} className="rounded-xl"><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 print:px-0 print:py-0">
        <div className="border-2 border-foreground rounded-xl p-6 print:border-black print:rounded-none space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-foreground pb-4 print:border-black">
            <h2 className="text-xl font-bold tracking-wider">ETIQUETA DE ENVIO</h2>
            <p className="text-sm font-mono mt-1">{order.order_number}</p>
          </div>

          {/* From */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Remetente</p>
            {originAddr ? (
              <div className="text-sm">
                <p className="font-semibold">{store?.name}</p>
                <p>{originAddr.street}, {originAddr.number}</p>
                <p>{originAddr.city} - {originAddr.state}</p>
                <p>CEP: {originAddr.zipCode}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Configure o endereço de origem em "Editar Loja"</p>
            )}
          </div>

          <Separator className="border-dashed" />

          {/* To */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Destinatário</p>
            {addr ? (
              <div className="text-sm">
                <p className="font-semibold">{addr.name || order.buyer_profile?.nome || 'Comprador'}</p>
                <p>{addr.street}, {addr.number}{addr.complement && ` - ${addr.complement}`}</p>
                <p>{addr.neighborhood && `${addr.neighborhood}, `}{addr.city} - {addr.state}</p>
                <p className="font-bold text-lg mt-1">CEP: {addr.zipCode}</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">Endereço não informado</p>}
          </div>

          <Separator className="border-dashed" />

          {/* Shipment info */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transportadora</p>
              <p className="text-sm font-semibold">{order.carrier || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rastreio</p>
              <p className="text-sm font-mono font-semibold">{order.tracking_code || '—'}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Conteúdo ({order.order_items?.length || 0} itens)</p>
            <div className="space-y-1">
              {order.order_items?.map(item => (
                <p key={item.id} className="text-xs">{item.quantity}x {item.title}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

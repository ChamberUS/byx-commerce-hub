import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Package, MessageCircle, Tag, Shield, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  Notification,
} from '@/hooks/use-notifications';

const notificationIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4" />,
  message: <MessageCircle className="h-4 w-4" />,
  offer: <Tag className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />,
};

const notificationColors: Record<string, string> = {
  order: 'bg-primary/10 text-primary',
  message: 'bg-blue-500/10 text-blue-500',
  offer: 'bg-green-500/10 text-green-500',
  security: 'bg-orange-500/10 text-orange-500',
  default: 'bg-muted text-muted-foreground',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();
  
  const icon = notificationIcons[notification.type] || notificationIcons.default;
  const colorClass = notificationColors[notification.type] || notificationColors.default;
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) {
      markRead.mutate(notification.id);
    }
  };

  const content = (
    <div 
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50',
        isUnread && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', isUnread && 'font-semibold')}>
            {notification.title}
          </p>
          {isUnread && (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteNotification.mutate(notification.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );

  if (notification.href) {
    return (
      <Link to={notification.href} className="block group">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading, unreadCount } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[360px]">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-center">Você está em dia!</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Nenhuma notificação no momento
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-9 text-sm"
            asChild
          >
            <Link to="/app/account/notifications" onClick={() => setOpen(false)}>
              Configurar notificações
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-error/10 text-error border-error/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

export function ToastContainer() {
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((n) => (
        <ToastItem
          key={n.id}
          id={n.id}
          type={n.type}
          message={n.message}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  type,
  message,
  onDismiss,
}: {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const Icon = icons[type];

  return (
    <div
      data-testid="toast"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-elevation-2 animate-slide-up',
        'backdrop-blur-sm',
        colors[type]
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

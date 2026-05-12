'use client';

import { useUIStore } from '@/store/uiStore';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function useToast() {
  const addNotification = useUIStore((s) => s.addNotification);

  const toast = {
    success: (message: string) => addNotification('success', message),
    error: (message: string) => addNotification('error', message),
    warning: (message: string) => addNotification('warning', message),
    info: (message: string) => addNotification('info', message),
  };

  return toast;
}

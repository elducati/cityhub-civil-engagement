import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: 'OPEN' | 'CLOSED' | 'ARCHIVED' }) {
  const config = {
    OPEN: { label: 'Open', variant: 'success' as const },
    CLOSED: { label: 'Closed', variant: 'default' as const },
    ARCHIVED: { label: 'Archived', variant: 'info' as const },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
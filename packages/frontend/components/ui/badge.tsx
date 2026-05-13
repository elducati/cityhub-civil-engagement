import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
        outline: 'border border-gray-300 text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' | 'warning' | 'outline' | 'error' }> = {
    OPEN: { label: 'Open', variant: 'success' },
    UNDER_REVIEW: { label: 'Under Review', variant: 'secondary' },
    FEASIBILITY: { label: 'Feasibility', variant: 'default' },
    PLANNED: { label: 'Planned', variant: 'warning' },
    IMPLEMENTED: { label: 'Implemented', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'error' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={variant}>{label}</Badge>;
}

function VoteCounter({ count, className }: { count: number; className?: string }) {
  return <span className={cn('font-bold text-lg text-primary', className)}>{count}</span>;
}

export { Badge, badgeVariants, StatusChip, VoteCounter };
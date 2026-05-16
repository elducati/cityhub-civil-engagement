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

const statusStyles: Record<string, string> = {
  OPEN: 'bg-success text-white',
  UNDER_REVIEW: 'bg-secondary text-white',
  FEASIBILITY: 'bg-primary text-white',
  PLANNED: 'bg-warning text-white',
  IMPLEMENTED: 'bg-success text-white',
  REJECTED: 'bg-error text-white',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  FEASIBILITY: 'Feasibility',
  PLANNED: 'Planned',
  IMPLEMENTED: 'Implemented',
  REJECTED: 'Rejected',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`${statusStyles[status as keyof typeof statusStyles] || 'bg-outline text-on-surface-variant'} rounded-full`}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </Badge>
  );
}

const categoryLabels: Record<string, string> = {
  infrastructure: 'Infrastructure',
  environment: 'Environment',
  safety: 'Public Safety',
  transportation: 'Transportation',
  community: 'Community',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  infrastructure: 'bg-blue-100 text-blue-700',
  environment: 'bg-green-100 text-green-700',
  safety: 'bg-red-100 text-red-700',
  transportation: 'bg-amber-100 text-amber-700',
  community: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
      {categoryLabels[category] || category}
    </span>
  );
}

export { Badge, badgeVariants, StatusChip, VoteCounter, StatusBadge, CategoryBadge, categoryLabels, categoryColors };
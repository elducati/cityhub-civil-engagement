import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-container-high',
        className
      )}
    />
  );
}

export function ProposalCardSkeleton() {
  return (
    <div className="bg-surface-container rounded-3xl border-none shadow-elevation-1 p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-between pt-4 border-t border-outline">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={i === 0 ? 'h-4 w-48' : 'h-4 w-20'} />
        </td>
      ))}
    </tr>
  );
}

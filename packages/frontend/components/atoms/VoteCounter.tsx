import { cn } from '@/lib/utils';

interface VoteCounterProps {
  count: number;
  className?: string;
}

export function VoteCounter({ count, className }: VoteCounterProps) {
  return (
    <span className={cn('font-semibold text-gray-900', className)}>
      {count} vote{count !== 1 ? 's' : ''}
    </span>
  );
}
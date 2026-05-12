import * as React from 'react';
import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

const AvatarImage = AvatarPrimitive.Image;
const AvatarFallback = AvatarPrimitive.Fallback;

const Avatar = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
  )
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

(Avatar as any).Image = AvatarImage;
(Avatar as any).Fallback = AvatarFallback;

export { Avatar, AvatarImage, AvatarFallback };

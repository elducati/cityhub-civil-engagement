import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Dialog = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>>(
  ({ className = '', children, ...props }, ref) => (
    <DialogPrimitive.Root ref={ref} className={cn('fixed inset-0 z-50 grid items-center justify-center px-4 py-4 sm:px-6 sm:items-start sm:max-h-[calc(100vh-6rem)]', className)} {...props}>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/80" />
      <DialogPrimitive.Content className={cn('bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 sm:rounded-3xl', className)}>
        <DialogPrimitive.Header className="space-y-2">
          <DialogPrimitive.Title className="text-2xl font-semibold leading-none tracking-tight text-text-primary" />
          <DialogPrimitive.Description className="text-sm text-text-secondary" />
        </DialogPrimitive.Header>
        <DialogPrimitive.Content className="space-y-4 mt-6">{children}</DialogPrimitive.Content>
        <DialogPrimitive.Footer className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
          <DialogPrimitive.Cancel className="btn btn-ghost">Cancel</DialogPrimitive.Cancel>
          <DialogPrimitive.Action className="btn btn-primary">Confirm</DialogPrimitive.Action>
        </DialogPrimitive.Footer>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
);
Dialog.displayName = DialogPrimitive.Root.displayName;

const DialogTrigger = DialogPrimitive.Trigger;
const DialogContent = DialogPrimitive.Content;
const DialogHeader = DialogPrimitive.Header;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogFooter = DialogPrimitive.Footer;
const DialogAction = DialogPrimitive.Action;
const DialogCancel = DialogPrimitive.Cancel;
const DialogOverlay = DialogPrimitive.Overlay;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogAction,
  DialogCancel,
  DialogOverlay,
  DialogPrimitive,
};
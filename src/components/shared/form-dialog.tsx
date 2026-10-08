'use client';

import { useId, useRef, type ReactElement, type ReactNode, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

/** Creation stays in context; Base UI owns modal focus, dismissal and nested portals. */
export function FormDialog({ title, description, trigger, children, open, onOpenChange, focusReturnRef }: {
  title: string;
  description: string;
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  focusReturnRef?: RefObject<HTMLElement | null>;
}) {
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // Base UI also invokes finalFocus on unmount, before a close animation completes.
  // Keep its native cancel behavior; a removed opener falls back within the record.
  function finalFocus() {
    if (triggerRef.current?.isConnected) return true;
    return focusReturnRef?.current?.isConnected ? focusReturnRef.current : true;
  }
  return <Dialog open={open} onOpenChange={onOpenChange} triggerId={triggerId}>
    <DialogTrigger id={triggerId} ref={triggerRef} render={trigger} className={cn('max-w-full min-w-0 whitespace-normal [overflow-wrap:anywhere]', trigger.type === Button && 'h-auto min-h-11 py-2')} />
    <DialogContent finalFocus={focusReturnRef ? finalFocus : undefined} className="flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <DialogHeader className="shrink-0 px-4 py-5 pr-16 sm:px-6 sm:pr-16">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="w-full min-h-0 min-w-0 overflow-y-auto overscroll-contain px-4 pb-5 sm:px-6">
        {children}
      </div>
      <DialogFooter className="shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

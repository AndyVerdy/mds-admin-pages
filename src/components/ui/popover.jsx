import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * Helper — returns true when the event target lives inside a Radix
 * Select / DropdownMenu portal that was spawned from inside this popover.
 * This prevents the popover from auto-closing when the user interacts
 * with a portaled Select dropdown that visually lives "outside" the popover.
 */
function isRadixPortalInteraction(e) {
  const target = e.target;
  if (!target) return false;
  return !!(
    target.closest?.("[data-radix-popper-content-wrapper]") ||
    target.closest?.("[data-radix-select-content]") ||
    target.closest?.("[role='listbox']") ||
    target.closest?.("[role='option']") ||
    target.getAttribute?.("data-radix-select-viewport") != null
  );
}

const PopoverContent = React.forwardRef(
  ({ className, align = "start", sideOffset = 4, onInteractOutside, onFocusOutside, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        onInteractOutside={(e) => {
          if (isRadixPortalInteraction(e)) {
            e.preventDefault();
            return;
          }
          onInteractOutside?.(e);
        }}
        onFocusOutside={(e) => {
          if (isRadixPortalInteraction(e)) {
            e.preventDefault();
            return;
          }
          onFocusOutside?.(e);
        }}
        className={cn(
          "z-50 w-auto rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

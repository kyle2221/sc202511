"use client"

import * as React from "react"
import { ImperativePanelHandle, Panel as ResizablePrimitivePanel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { cva } from "class-variance-authority"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  ImperativePanelHandle,
  React.ComponentProps<typeof PanelGroup>
>(({ className, ...props }, ref) => (
  <PanelGroup
    ref={ref}
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = ResizablePrimitivePanel
ResizablePanel.displayName = "ResizablePanel"

const resizeHandleVariants = cva("flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", {
  variants: {
    direction: {
      vertical: "w-full cursor-row-resize",
      horizontal: "h-full cursor-col-resize",
    },
    variant: {
      default: "bg-transparent",
      ghost: "hover:bg-accent active:bg-accent",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    variant: "ghost",
  },
})

const ResizableHandle = React.forwardRef<
  ImperativePanelHandle,
  React.ComponentProps<typeof PanelResizeHandle> & {
    withHandle?: boolean
    variant?: "default" | "ghost"
  }
>(({ className, withHandle, variant, ...props }, ref) => {
  const [isDragging, setIsDragging] = React.useState(false)

  return (
    <PanelResizeHandle
      ref={ref}
      onDragging={setIsDragging}
      className={cn(
        resizeHandleVariants({ variant }),
        "relative",
        "data-[panel-group-direction=vertical]:h-2.5 data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=horizontal]:w-2.5 data-[panel-group-direction=horizontal]:h-full",
        "data-[resize-handle-state=drag]:bg-accent data-[resize-handle-state=hover]:bg-accent",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "z-10 flex h-8 w-1 items-center justify-center rounded-full border bg-border",
            isDragging && "bg-primary text-primary-foreground"
          )}
        >
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </PanelResizeHandle>
  )
})
ResizableHandle.displayName = "ResizableHandle"


export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

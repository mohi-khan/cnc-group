import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      role="switch"
      className={cn(
        "peer h-[24px] w-[44px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-input",
        "checked:bg-primary",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Switch.displayName = "Switch"

export { Switch }
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type, ...props }, ref) => {
    return (
        <div className={cn(
               "relative rounded-md border flex items-center justify-start",
               className
             )}>
          <div className={"text-gray-500 p-2"}>
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border-none bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

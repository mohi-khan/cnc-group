'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string | undefined) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value)

    React.useEffect(() => {
      setSelectedValue(value)
    }, [value])

    const handleChange = React.useCallback((newValue: string | undefined) => {
      setSelectedValue(newValue)
      onValueChange?.(newValue)
    }, [onValueChange])

    return (
      <RadioGroupContext.Provider value={{ value: selectedValue, onChange: handleChange }}>
        <div className={cn("grid gap-2", className)} ref={ref} {...props} />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) {
      throw new Error('RadioGroupItem must be used within a RadioGroup')
    }

    const { value: groupValue, onChange } = context

    const handleClick = () => {
      if (groupValue === value) {
        // If the clicked item is already selected, deselect it
        onChange(undefined)
      } else {
        // Otherwise, select the clicked item
        onChange(value)
      }
    }

    return (
      <input
        type="radio"
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-black ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        checked={groupValue === value}
        onClick={handleClick}
        readOnly
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  loading?: boolean
  popoverContentClassName?: string // New prop for additional PopoverContent styling
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText = 'No items found.',
  className,
  loading = false,
  popoverContentClassName, // New prop
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value
            ? options.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(`w-full p-0 ${popoverContentClassName}`)}>
        {' '}
        {/* Added popoverContentClassName */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={
              searchPlaceholder || `Search ${placeholder.toLowerCase()}...`
            }
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {loading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : filteredOptions.length === 0 ? (
                <CommandItem disabled>No items available</CommandItem>
              ) : (
                filteredOptions.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue)
                      setOpen(false)
                      setSearchQuery('')
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

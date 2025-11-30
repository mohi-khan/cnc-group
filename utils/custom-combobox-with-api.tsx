'use client'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'

export interface ComboboxItem {
  id: string | number
  name: string
}

interface CustomComboboxProps<T extends ComboboxItem> {
  items: T[]
  value: T | null
  onChange: (item: T | null) => void
  placeholder?: string
  disabled?: boolean
  searchFunction?: (query: string) => Promise<T[]>
  fetchByIdFunction?: (id: string | number) => Promise<T | null>
}

// ---------------------------
// Utility function outside component
// ---------------------------
function removeDuplicates<T extends { id: string | number }>(array: T[]): T[] {
  return [...new Map(array.map((i) => [i.id, i])).values()]
}

// ---------------------------
// Main Component
// ---------------------------
export function CustomComboboxWithApi<T extends ComboboxItem>({
  items: initialItems,
  value,
  onChange,
  placeholder = 'Select an item...',
  disabled = false,
  searchFunction,
  fetchByIdFunction,
}: CustomComboboxProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Ensure selected value is always in the list
  useEffect(() => {
    if (value) {
      setItems((prev) => {
        const exists = prev.find((i) => i.id === value.id)
        if (!exists) return removeDuplicates([value, ...prev])
        return removeDuplicates(
          prev.map((i) => (i.id === value.id ? value : i))
        )
      })
    }
  }, [value])

  // Fetch full value if only id is present
  useEffect(() => {
    const fetchFullValue = async () => {
      if (value && (!value.name || value.name === '') && fetchByIdFunction) {
        try {
          const fullItem = await fetchByIdFunction(value.id)
          if (fullItem) onChange(fullItem)
        } catch (err) {
          console.error('Error fetching full item by ID:', err)
        }
      }
    }
    fetchFullValue()
  }, [value, fetchByIdFunction, onChange])

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search API
  useEffect(() => {
    const fetchData = async () => {
      if (!searchFunction) return
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setItems((prev) =>
          value && !prev.find((i) => i.id === value.id)
            ? removeDuplicates([value, ...initialItems])
            : removeDuplicates(initialItems)
        )
        return
      }

      setIsLoading(true)
      try {
        const results = await searchFunction(debouncedQuery)
        if (value && !results.find((i) => i.id === value.id)) {
          setItems(removeDuplicates([value, ...results]))
        } else {
          setItems(removeDuplicates(results))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [debouncedQuery, searchFunction, initialItems, value])

  const handleSelect = (item: T | null) => {
    onChange(item)
    setQuery('') // Clear input after selection
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuery('')
    onChange(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="relative">
      <Combobox value={value} onChange={handleSelect} disabled={disabled}>
        <div className="relative w-full cursor-default overflow-hidden border rounded-lg bg-white text-left focus:outline-none sm:text-sm">
          <Combobox.Input
            ref={inputRef}
            className="w-full border-none py-2 pl-3 pr-10 text-sm text-black focus:ring-0"
            displayValue={(item: T | null) => item?.name || ''}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
          {(query || value) ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-2 hover:bg-gray-100 rounded"
              disabled={disabled}
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" aria-hidden="true" />
            </button>
          ) : (
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <ChevronsUpDown className="h-5 w-5 text-gray-400" />
              )}
            </Combobox.Button>
          )}
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-20 mt-1 max-h-60 h-40 min-w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
            {isLoading ? (
              <div className="px-4 py-2 text-black">Loading...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-2 text-black">Nothing found.</div>
            ) : (
              items.map((item, index) => (
                <Combobox.Option
                  key={`${item.id}-${index}`}
                  value={item}
                  className={({ active }) =>
                    `relative cursor-default select-none py-1 px-10 mx-2 rounded-md ${
                      active ? 'bg-slate-200 text-black' : 'text-black'
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center">
                      {selected && (
                        <span className="text-teal-600">
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                      <span
                        className={`block truncate px-3 ${
                          selected ? 'font-bold' : 'font-normal'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  )
}

// 'use client'
// import { Fragment, useState, useEffect, useRef } from 'react'
// import { Combobox, Transition } from '@headlessui/react'
// import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'

// export interface ComboboxItem {
//   id: string | number
//   name: string
// }

// interface CustomComboboxProps<T extends ComboboxItem> {
//   items: T[]
//   value: T | null
//   onChange: (item: T | null) => void
//   placeholder?: string
//   disabled?: boolean
//   searchFunction?: (query: string) => Promise<T[]>
//   fetchByIdFunction?: (id: string | number) => Promise<T | null>
// }

// // ---------------------------
// // Utility function outside component
// // ---------------------------
// function removeDuplicates<T extends { id: string | number }>(array: T[]): T[] {
//   return [...new Map(array.map((i) => [i.id, i])).values()]
// }

// // ---------------------------
// // Main Component
// // ---------------------------
// export function CustomComboboxWithApi<T extends ComboboxItem>({
//   items: initialItems,
//   value,
//   onChange,
//   placeholder = 'Select an item...',
//   disabled = false,
//   searchFunction,
//   fetchByIdFunction,
// }: CustomComboboxProps<T>) {
//   const [items, setItems] = useState<T[]>(initialItems)
//   const [query, setQuery] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [debouncedQuery, setDebouncedQuery] = useState('')
//   const inputRef = useRef<HTMLInputElement>(null)

//   // Ensure selected value is always in the list
//   useEffect(() => {
//     if (value) {
//       setItems((prev) => {
//         const exists = prev.find((i) => i.id === value.id)
//         if (!exists) return removeDuplicates([value, ...prev])
//         return removeDuplicates(
//           prev.map((i) => (i.id === value.id ? value : i))
//         )
//       })
//     }
//   }, [value])

//   // Fetch full value if only id is present
//   useEffect(() => {
//     const fetchFullValue = async () => {
//       if (value && (!value.name || value.name === '') && fetchByIdFunction) {
//         try {
//           const fullItem = await fetchByIdFunction(value.id)
//           if (fullItem) onChange(fullItem)
//         } catch (err) {
//           console.error('Error fetching full item by ID:', err)
//         }
//       }
//     }
//     fetchFullValue()
//   }, [value, fetchByIdFunction, onChange])

//   // Debounce query
//   useEffect(() => {
//     const timer = setTimeout(() => setDebouncedQuery(query), 300)
//     return () => clearTimeout(timer)
//   }, [query])

//   // Search API
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!searchFunction) return
//       if (!debouncedQuery || debouncedQuery.length < 2) {
//         setItems((prev) =>
//           value && !prev.find((i) => i.id === value.id)
//             ? removeDuplicates([value, ...initialItems])
//             : removeDuplicates(initialItems)
//         )
//         return
//       }

//       setIsLoading(true)
//       try {
//         const results = await searchFunction(debouncedQuery)
//         if (value && !results.find((i) => i.id === value.id)) {
//           setItems(removeDuplicates([value, ...results]))
//         } else {
//           setItems(removeDuplicates(results))
//         }
//       } catch (err) {
//         console.error('Error fetching data:', err)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [debouncedQuery, searchFunction, initialItems, value])

//   const handleSelect = (item: T | null) => {
//     onChange(item)
//     setQuery('') // Clear input after selection
//   }

//   return (
//     <div className="relative">
//       <Combobox value={value} onChange={handleSelect} disabled={disabled}>
//         <div className="relative w-full cursor-default overflow-hidden border rounded-lg bg-white text-left focus:outline-none sm:text-sm">
//           <Combobox.Input
//             ref={inputRef}
//             className="w-full border-none py-2 pl-3 pr-10 text-sm text-black focus:ring-0"
//             displayValue={(item: T | null) => item?.name || ''}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder={placeholder}
//             disabled={disabled}
//           />
//           <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
//             {isLoading ? (
//               <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
//             ) : (
//               <ChevronsUpDown className="h-5 w-5 text-gray-400" />
//             )}
//           </Combobox.Button>
//         </div>

//         <Transition
//           as={Fragment}
//           leave="transition ease-in duration-100"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//           afterLeave={() => setQuery('')}
//         >
//           <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
//             {isLoading ? (
//               <div className="px-4 py-2 text-black">Loading...</div>
//             ) : items.length === 0 ? (
//               <div className="px-4 py-2 text-black">Nothing found.</div>
//             ) : (
//               items.map((item, index) => (
//                 <Combobox.Option
//                   key={`${item.id}-${index}`}
//                   value={item}
//                   className={({ active }) =>
//                     `relative cursor-default select-none py-1 px-10 mx-2 rounded-md ${
//                       active ? 'bg-slate-200 text-black' : 'text-black'
//                     }`
//                   }
//                 >
//                   {({ selected }) => (
//                     <div className="flex items-center">
//                       {selected && (
//                         <span className="text-teal-600">
//                           <Check className="h-5 w-5" />
//                         </span>
//                       )}
//                       <span
//                         className={`block truncate px-3 ${
//                           selected ? 'font-bold' : 'font-normal'
//                         }`}
//                       >
//                         {item.name}
//                       </span>
//                     </div>
//                   )}
//                 </Combobox.Option>
//               ))
//             )}
//           </Combobox.Options>
//         </Transition>
//       </Combobox>
//     </div>
//   )
// }

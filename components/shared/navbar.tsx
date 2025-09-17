// 'use client'

// import React, { useState, useRef, useEffect } from 'react'
// import Image from 'next/image'
// import { ChevronDown, User2 } from 'lucide-react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { Company, CompanyFromLocalstorage, User } from '@/utils/type'
// import { MENU_ITEMS } from '@/utils/constants'
// import { DollarSign, Building, BookOpen, Repeat } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip'
// import { useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'

// export default function Navbar() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)

//   // State variables
//   const [user, setUser] = useState<User | null>(null)
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [activeMenu, setActiveMenu] = useState<string | null>(null)
//   const [isProfileOpen, setIsProfileOpen] = useState(false)
//   const [isCompaniesOpen, setIsCompaniesOpen] = useState(false)
//   const profileRef = useRef<HTMLDivElement>(null)
//   const companiesRef = useRef<HTMLDivElement>(null)

//   const router = useRouter()

//   const handleSignOut = () => {
//     localStorage.removeItem('currentUser')
//     localStorage.removeItem('authToken')
//     setIsProfileOpen(false)
//     router.push('/')
//   }

//   // getting userData from local storage
//   useEffect(() => {
//     if (userData) {
//       setUser(userData)
//       setCompanies(userData.userCompanies)
//     } else {
//     }
//   }, [userData])

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(event.target as Node) &&
//         companiesRef.current &&
//         !companiesRef.current.contains(event.target as Node)
//       ) {
//         setIsProfileOpen(false)
//         setIsCompaniesOpen(false)
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [profileRef, companiesRef])

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="mx-auto px-4 sm:px-6 lg:px-8 border-b">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex-shrink-0 flex items-center">
//             <Image
//               src="/logo.webp"
//               width={70}
//               height={70}
//               className=""
//               alt="Profile"
//             />
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="hidden sm:flex sm:items-center sm:space-x-4 ml-4">
//               <Link
//                 href={'/dashboard'}
//                 className="font-medium text-gray-900 text-sm"
//               >
//                 Dashboard
//               </Link>
//               {MENU_ITEMS.map((menuItem, index) => (
//                 <div
//                   key={index}
//                   className="relative"
//                   onMouseEnter={() => setActiveMenu(menuItem.name)}
//                   onMouseLeave={() => setActiveMenu(null)}
//                 >
//                   <button
//                     className="inline-flex items-center h-16 px-1 text-sm font-medium leading-5 text-gray-900 focus:outline-none transition duration-500 ease-in-out"
//                     aria-expanded={activeMenu === menuItem.name}
//                     aria-haspopup={menuItem.subItemGroups.length > 0}
//                   >
//                     {menuItem.name}
//                     {menuItem.subItemGroups.length > 0 && (
//                       <ChevronDown className="ml-1 h-4 w-4" />
//                     )}
//                   </button>
//                   {menuItem.subItemGroups.length > 0 &&
//                     activeMenu === menuItem.name && (
//                       <div className="absolute z-10 -ml-4 transform px-2 w-screen max-w-[300px] sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
//                         <div className="rounded-lg shadow-lg ring-1 ring-slate-800 ring-opacity-5 overflow-hidden">
//                           <div className="relative max-h-[520px] overflow-y-auto grid gap-6 bg-white px-5 py-6 sm:gap-4 sm:p-8">
//                             {menuItem.subItemGroups.map((group, groupIndex) => (
//                               <div key={groupIndex}>
//                                 <p className="text-base font-bold text-gray-900 mb-2">
//                                   {group.name}
//                                 </p>
//                                 {group.items.map((item, itemIndex) => (
//                                   <Link
//                                     key={itemIndex}
//                                     href={item.source}
//                                     onClick={(e) => {
//                                       if (!item.source) {
//                                         e.preventDefault()
//                                       }
//                                     }}
//                                     className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-100 transition ease-in-out duration-150"
//                                   >
//                                     <div className="ml-4">
//                                       <p className="text-base text-gray-900">
//                                         {item.name}
//                                       </p>
//                                     </div>
//                                   </Link>
//                                 ))}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex items-center ml-4">
//             <div className="relative" ref={profileRef}>
//               <button
//                 className="flex items-center justify-center w-10 h-10 text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-500 ease-in-out"
//                 id="user-menu"
//                 aria-label="User menu"
//                 aria-haspopup="true"
//                 onClick={() => setIsProfileOpen(!isProfileOpen)}
//               >
//                 <User2 className="h-9 w-9 text-gray-600 border border-gray-600 p-1 rounded-full" />
//               </button>
//               {isProfileOpen && (
//                 <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
//                   <div
//                     className="py-1 rounded-md bg-white shadow-xs"
//                     role="menu"
//                     aria-orientation="vertical"
//                     aria-labelledby="user-menu"
//                   >
//                     <Link
//                       href="/change-password"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       role="menuitem"
//                     >
//                       Change Password
//                     </Link>
//                     <button
//                       onClick={handleSignOut}
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       role="menuitem"
//                     >
//                       Sign out
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="py-1 text-center">
//         <TooltipProvider>
//           <div className="flex gap-6 items-center justify-center">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Link href={'/cash/cash-voucher'}>
//                   <Button variant="ghost" size="icon">
//                     <DollarSign className="h-5 w-5" />
//                     <span className="sr-only">Cash Voucher</span>
//                   </Button>
//                 </Link>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Cash Voucher</p>
//               </TooltipContent>
//             </Tooltip>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Link href={'/bank/bank-vouchers'}>
//                   <Button variant="ghost" size="icon">
//                     <Building className="h-5 w-5" />
//                     <span className="sr-only">Bank Voucher</span>
//                   </Button>
//                 </Link>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Bank Voucher</p>
//               </TooltipContent>
//             </Tooltip>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Link href={'/accounting/journal-voucher'}>
//                   <Button variant="ghost" size="icon">
//                     <BookOpen className="h-5 w-5" />
//                     <span className="sr-only">Journal Voucher</span>
//                   </Button>
//                 </Link>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Journal Voucher</p>
//               </TooltipContent>
//             </Tooltip>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Link href={'/cash/contra-vouchers'}>
//                   <Button variant="ghost" size="icon">
//                     <Repeat className="h-5 w-5" />
//                     <span className="sr-only">Contra Voucher</span>
//                   </Button>
//                 </Link>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Contra Voucher</p>
//               </TooltipContent>
//             </Tooltip>
//           </div>
//         </TooltipProvider>
//       </div>
//     </nav>
//   )
// }

'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, User2, Search, X, Folder, PackageMinusIcon, PackageX, PackageCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CompanyFromLocalstorage, User } from '@/utils/type'
import { MENU_ITEMS } from '@/utils/constants'
import { DollarSign, Building, BookOpen, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

interface SearchResult {
  name: string
  source: string
  category: string
  group: string
}

export default function Navbar() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  // State variables
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const companiesRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    setIsProfileOpen(false)
    router.push('/')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const results: SearchResult[] = []

    // Search through all menu items
    MENU_ITEMS.forEach((menuItem) => {
      menuItem.subItemGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (
            query.trim() === '' || // Show all items when no query
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            group.name.toLowerCase().includes(query.toLowerCase()) ||
            menuItem.name.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({
              name: item.name,
              source: item.source,
              category: menuItem.name,
              group: group.name,
            })
          }
        })
      })
    })

    setSearchResults(results)
    setIsSearchOpen(true) // Always show dropdown when focused
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : 0
          setTimeout(() => scrollToSelectedItem(newIndex), 0)
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : searchResults.length - 1
          setTimeout(() => scrollToSelectedItem(newIndex), 0)
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedResult = searchResults[selectedIndex]
          router.push(selectedResult.source)
          clearSearch()
          setActiveMenu(null)
        }
        break
      case 'Escape':
        clearSearch()
        break
    }
  }

  const scrollToSelectedItem = (index: number) => {
    if (searchDropdownRef.current && index >= 0) {
      const selectedElement = searchDropdownRef.current.children[0]?.children[
        index
      ] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearchOpen(false)
    setSelectedIndex(-1)
    setIsSearchExpanded(false)
  }

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true)
    handleSearch('')
  }

  // getting userData from local storage
  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
    } else {
    }
  }, [userData])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }

      if (
        companiesRef.current &&
        !companiesRef.current.contains(event.target as Node)
      ) {
        setIsCompaniesOpen(false)
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
        setIsSearchExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef, companiesRef, searchRef])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/logo.webp"
              width={70}
              height={70}
              className=""
              alt="Profile"
            />
          </div>

          <div
            className={`mx-8 relative transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'flex-1 max-w-lg' : 'w-auto'
            }`}
            ref={searchRef}
          >
            {!isSearchExpanded ? (
              <button
                onClick={handleSearchIconClick}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </button>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search navigation items..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => handleSearch(searchQuery)}
                  onBlur={() => {
                    if (!isSearchOpen) {
                      setIsSearchExpanded(false)
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300"
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {isSearchOpen && searchResults.length > 0 && isSearchExpanded && (
              <div
                ref={searchDropdownRef}
                className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-2xl ring-2 ring-black ring-opacity-10 border-2 border-gray-200 max-h-[500px] overflow-y-auto"
              >
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      href={result.source}
                      onClick={() => {
                        clearSearch()
                        setActiveMenu(null)
                      }}
                      className={`block px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                        index === selectedIndex
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {result.category} → {result.group}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="hidden sm:flex sm:items-center sm:space-x-4 ml-4">
              <Link
                href={'/dashboard'}
                className="font-medium text-gray-900 text-sm"
              >
                Dashboard
              </Link>
              {MENU_ITEMS.map((menuItem, index) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(menuItem.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button
                    className="inline-flex items-center h-16 px-1 text-sm font-medium leading-5 text-gray-900 focus:outline-none transition duration-500 ease-in-out"
                    aria-expanded={activeMenu === menuItem.name}
                    aria-haspopup={menuItem.subItemGroups.length > 0}
                  >
                    {menuItem.name}
                    {menuItem.subItemGroups.length > 0 && (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                  {menuItem.subItemGroups.length > 0 &&
                    activeMenu === menuItem.name && (
                      <div className="absolute z-10 -ml-4 transform px-2 w-screen max-w-[300px] sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                        <div className="rounded-lg shadow-lg ring-1 ring-slate-800 ring-opacity-5 overflow-hidden">
                          <div className="relative max-h-[520px] overflow-y-auto grid gap-6 bg-white px-5 py-6 sm:gap-4 sm:p-8">
                            {menuItem.subItemGroups.map((group, groupIndex) => (
                              <div key={groupIndex}>
                                <p className="text-base font-bold text-gray-900 mb-2">
                                  {group.name}
                                </p>
                                {group.items.map((item, itemIndex) => (
                                  <Link
                                    key={itemIndex}
                                    href={item.source}
                                    onClick={(e) => {
                                      if (!item.source) {
                                        e.preventDefault()
                                      }
                                    }}
                                    className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-100 transition ease-in-out duration-150"
                                  >
                                    <div className="ml-4">
                                      <p className="text-base text-gray-900">
                                        {item.name}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center ml-4">
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center justify-center w-10 h-10 text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-500 ease-in-out"
                id="user-menu"
                aria-label="User menu"
                aria-haspopup="true"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User2 className="h-9 w-9 text-gray-600 border border-gray-600 p-1 rounded-full" />
              </button>
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
                  <div
                    className="py-1 rounded-md bg-white shadow-xs"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      href="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Change Password
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="py-1 text-center">
        <TooltipProvider>
          <div className="flex gap-6 items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={'/cash/cash-voucher'}>
                  <Button variant="ghost" size="icon">
                    <DollarSign className="h-5 w-5" />
                    <span className="sr-only">Cash Voucher</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cash Voucher</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={'/bank/bank-vouchers'}>
                  <Button variant="ghost" size="icon">
                    <Building className="h-5 w-5" />
                    <span className="sr-only">Bank Voucher</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bank Voucher</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={'/accounting/journal-voucher'}>
                  <Button variant="ghost" size="icon">
                    <BookOpen className="h-5 w-5" />
                    <span className="sr-only">Journal Voucher</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Journal Voucher</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={'/cash/contra-vouchers'}>
                  <Button variant="ghost" size="icon">
                    <Repeat className="h-5 w-5" />
                    <span className="sr-only">Contra Voucher</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contra Voucher</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={'/opening-balance'}>
                  <Button variant="ghost" size="icon">
                    <PackageCheckIcon className="h-5 w-5" />
                    <span className="sr-only">Opening Balance</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opening Balance</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </nav>
  )
}

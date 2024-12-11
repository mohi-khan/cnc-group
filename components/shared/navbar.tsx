'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Company, User } from '@/utils/type'
import { MENU_ITEMS } from '@/utils/constants'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const companiesRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem('currentUser') // Remove the current user from local storage
    setIsProfileOpen(false) // Close the profile dropdown
    router.push('/') // Redirect to login page
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/company/get-all-companies'
        )
        const data: Company[] = await response.json()

        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const userData: User = JSON.parse(userStr)
          setUser(userData)

          // Filter companies based on userCompanies
          const userCompanyIds = userData.userCompanies.map(
            (uc) => uc.companyId
          )
          const filteredCompanies = data.filter((company) =>
            userCompanyIds.includes(company.companyId)
          )
          console.log('company filter', filteredCompanies)
          setCompanies(filteredCompanies)
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }

    fetchCompanies()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        companiesRef.current &&
        !companiesRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
        setIsCompaniesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef, companiesRef])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            {/* <span className="text-xl font-bold text-gray-800">Logo</span> */}
            <Image
              src="/logo.webp"
              width={70}
              height={70}
              className=""
              alt="Profile"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex sm:items-center sm:space-x-4 ml-4">
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
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-4 sm:p-8">
                            {menuItem.subItemGroups.map((group, groupIndex) => (
                              <div key={groupIndex}>
                                <p className="text-base font-bold text-gray-900 mb-2">
                                  {group.name}
                                </p>
                                {group.items.map((item, itemIndex) => (
                                  <Link
                                    key={itemIndex}
                                    href={item.source}
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
            <div className="relative mr-4" ref={companiesRef}>
              <button
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsCompaniesOpen(!isCompaniesOpen)}
              >
                Companies
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {isCompaniesOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
                  <div
                    className="py-1 rounded-md bg-white shadow-xs"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {companies?.length > 0 ? (
                      companies?.map((company) => (
                        <Link
                          key={company?.companyId}
                          href={`/company/${company.companyId}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          {company?.companyName}
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-gray-500">
                        No companies available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center justify-center w-10 h-10 text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-500 ease-in-out"
                id="user-menu"
                aria-label="User menu"
                aria-haspopup="true"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  width={40}
                  height={40}
                  className="rounded-full border"
                  alt="Profile"
                />
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
    </nav>
  )
}

// Notes : In settings i have bank accounts. from there i can create bank accounts as well. previously there was banks. i kept the banks code in 'settings/banks' folder location in both page folder and component folder, even though i don't need it for now. i also commented out the create bank accounts route form navbar.

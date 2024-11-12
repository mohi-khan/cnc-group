'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

interface MenuItem {
    name: string
    subItems: string[]
}

export default function Navbar() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    const menuItems: MenuItem[] = [
        { name: "Dashboard", subItems: [] },
        {
            name: "Accounting",
            subItems: [
                "Journal Entry",
                "Journal Items",
                "Reverse Entry",
                "Day Books",
                "Create Repetitive Vouchers",
                "Lock Vouchers"
            ]
        },
        {
            name: "Cash",
            subItems: [
                "Cash Voucher",
                "Cash Reports",
                "Cntra Vouchers"
            ]
        },
        {
            name: "Customers",
            subItems: [
                "Invoices",
                "Receipt",
                "Customer Statement"
            ]
        },
        {
            name: "Vendors",
            subItems: [
                "Bills",
                "Payments",
                "Vendor Statement"
            ]
        },
        {
            name: "Assets",
            subItems: [
                "Create Asset Group",
                "Configure Depreciation",
                "Configure Asset Accounting",
                "Run Depreciation"
            ]
        },
        {
            name: "Bank",
            subItems: [
                "Create Bank Account",
                "Bank Vouchers",
                "Bank Reconciliation",
                "Bank Ledger",
                "Check Print",
                "Bank Balances"
            ]
        },
        {
            name: "Budget",
            subItems: [
                "Create Budget",
                "Budget Settings",
                "View Budget"
            ]
        },
        {
            name: "Reports",
            subItems: [
                "Trial Balance",
                "Profit and Loss Accounts",
                "Balance Sheet",
                "Bank Ledger",
                "Customer Ledger",
                "Bank and Cash Reports",
                "Fund Flow Statement",
                "Budget Vs Actual Reports"
            ]
        },
        {
            name: "Admin",
            subItems: [
                "Users"
            ]
        },
        {
            name: "Settings",
            subItems: [
                "Company",
                "Chart of Accounts",
                "Currencies",
                "Cost Centers",
                "Internal Orders",
                "Banks",
                "Cash Accounts",
                "Locations",
                "Withholding Taxes",
                "Financial Year"
            ]
        }
    ]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [profileRef])

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-between">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-gray-800">Logo</span>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:space-x-4 ml-4">
                            {menuItems.map((menuItem, index) => (
                                <div
                                    key={index}
                                    className="relative"
                                    onMouseEnter={() => setActiveMenu(menuItem.name)}
                                    onMouseLeave={() => setActiveMenu(null)}
                                >
                                    <button
                                        className="inline-flex items-center h-16 px-1 text-sm font-medium leading-5 text-gray-900 focus:outline-none transition duration-150 ease-in-out"
                                        aria-expanded={activeMenu === menuItem.name}
                                        aria-haspopup={menuItem.subItems.length > 0}
                                    >
                                        {menuItem.name}
                                        {menuItem.subItems.length > 0 && (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </button>
                                    {menuItem.subItems.length > 0 && activeMenu === menuItem.name && (
                                        <div className="absolute z-10 -ml-4 transform px-2 w-screen max-w-52 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                                <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-3">
                                                    {menuItem.subItems.map((subItem, subIndex) => (
                                                        <a
                                                            key={subIndex}
                                                            href="#"
                                                            className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-100 transition ease-in-out duration-150"
                                                        >
                                                            <div className="ml-4">
                                                                <p className="text-base font-medium text-gray-900">
                                                                    {subItem}
                                                                </p>
                                                            </div>
                                                        </a>
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
                                className="flex items-center justify-center w-10 h-10 text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
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
                                    <div className="py-1 rounded-md bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Option 1</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Option 2</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Option 3</a>
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
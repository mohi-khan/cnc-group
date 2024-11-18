"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface SubItem {
    name: string
    source: string
}

interface SubItemGroup {
    name: string
    items: SubItem[]
}

interface MenuItem {
    name: string
    subItemGroups: SubItemGroup[]
}

export default function Navbar() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    const menuItems: MenuItem[] = [
        { name: "Dashboard", subItemGroups: [] },
        {
            name: "Accounting",
            subItemGroups: [
                {
                    name: "Journal Management",
                    items: [
                        { name: "Journal Entry", source: "/accounting/journal-entry" },
                        { name: "Journal Items", source: "/accounting/journal-items" },
                        { name: "Reverse Entry", source: "/accounting/reverse-entry" },
                    ]
                },
                {
                    name: "Books",
                    items: [
                        { name: "Day Books", source: "/accounting/day-books" },
                    ]
                },
                {
                    name: "Vouchers",
                    items: [
                        { name: "Create Repetitive Vouchers", source: "/accounting/repetitive-vouchers" },
                        { name: "Lock Vouchers", source: "/accounting/lock-vouchers" }
                    ]
                }
            ]
        },
        {
            name: "Cash",
            subItemGroups: [
                {
                    name: "Cash Management",
                    items: [
                        { name: "Cash Voucher", source: "/cash/cash-voucher" },
                        { name: "Cash Reports", source: "/cash/cash-reports" },
                        { name: "Cntra Vouchers", source: "/cash/cntra-vouchers" }
                    ]
                }
            ]
        },
        {
            name: "Customers",
            subItemGroups: [
                {
                    name: "Customer Management",
                    items: [
                        { name: "Invoices", source: "/customers/invoices" },
                        { name: "Receipt", source: "/customers/receipt" },
                        { name: "Customer Statement", source: "/customers/customer-statement" }
                    ]
                }
            ]
        },
        {
            name: "Vendors",
            subItemGroups: [
                {
                    name: "Vendor Management",
                    items: [
                        { name: "Bills", source: "/vendors/bills" },
                        { name: "Payments", source: "/vendors/payments" },
                        { name: "Vendor Statement", source: "/vendors/vendor-statement" }
                    ]
                }
            ]
        },
        {
            name: "Assets",
            subItemGroups: [
                {
                    name: "Asset Management",
                    items: [
                        { name: "Create Asset Group", source: "/assets/create-asset-group" },
                        { name: "Configure Depreciation", source: "/assets/configure-depreciation" },
                        { name: "Configure Asset Accounting", source: "/assets/configure-asset-accounting" },
                        { name: "Run Depreciation", source: "/assets/run-depreciation" }
                    ]
                }
            ]
        },
        {
            name: "Bank",
            subItemGroups: [
                {
                    name: "Bank Management",
                    items: [
                        { name: "Create Bank Account", source: "/bank/create-bank-account" },
                        { name: "Bank Vouchers", source: "/bank/bank-vouchers" },
                        { name: "Bank Reconciliation", source: "/bank/bank-reconciliation" },
                        { name: "Bank Ledger", source: "/bank/bank-ledger" },
                        { name: "Check Print", source: "/bank/check-print" },
                        { name: "Bank Balances", source: "/bank/bank-balances" }
                    ]
                }
            ]
        },
        {
            name: "Budget",
            subItemGroups: [
                {
                    name: "Budget Management",
                    items: [
                        { name: "Create Budget", source: "/budget/create-budget" },
                        { name: "Budget Settings", source: "/budget/budget-settings" },
                        { name: "View Budget", source: "/budget/view-budget" }
                    ]
                }
            ]
        },
        {
            name: "Reports",
            subItemGroups: [
                {
                    name: "Financial Reports",
                    items: [
                        { name: "Trial Balance", source: "/reports/trial-balance" },
                        { name: "Profit and Loss Accounts", source: "/reports/profit-loss" },
                        { name: "Balance Sheet", source: "/reports/balance-sheet" },
                    ]
                },
                {
                    name: "Ledger Reports",
                    items: [
                        { name: "Bank Ledger", source: "/reports/bank-ledger" },
                        { name: "Customer Ledger", source: "/reports/customer-ledger" },
                    ]
                },
                {
                    name: "Other Reports",
                    items: [
                        { name: "Bank and Cash Reports", source: "/reports/bank-cash-reports" },
                        { name: "Fund Flow Statement", source: "/reports/fund-flow-statement" },
                        { name: "Budget Vs Actual Reports", source: "/reports/budget-vs-actual" }
                    ]
                }
            ]
        },
        {
            name: "Settings",
            subItemGroups: [
                {
                    name: "Admin",
                    items: [
                        { name: "Create User", source: "/settings/create-user" },
                        { name: "Users List", source: "/settings/users-list" },
                    ]
                },
                {
                    name: "General Settings",
                    items: [
                        { name: "Company", source: "/settings/company" },
                        { name: "Chart of Accounts", source: "/settings/chart-of-accounts" },
                        { name: "Currencies", source: "/settings/currencies" },
                    ]
                },
                {
                    name: "Financial Settings",
                    items: [
                        { name: "Cost Centers", source: "/settings/cost-centers" },
                        { name: "Internal Orders", source: "/settings/internal-orders" },
                        { name: "Banks", source: "/settings/banks" },
                        { name: "Cash Accounts", source: "/settings/cash-accounts" },
                    ]
                },
                {
                    name: "Other Settings",
                    items: [
                        { name: "Locations", source: "/settings/locations" },
                        { name: "Withholding Taxes", source: "/settings/withholding-taxes" },
                        { name: "Financial Year", source: "/settings/financial-year" }
                    ]
                }
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
        <nav className="bg-white shadow-md sticky top-0 z-50">
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
                                        className="inline-flex items-center h-16 px-1 text-sm font-medium leading-5 text-gray-900 focus:outline-none transition duration-500 ease-in-out"
                                        aria-expanded={activeMenu === menuItem.name}
                                        aria-haspopup={menuItem.subItemGroups.length > 0}
                                    >
                                        {menuItem.name}
                                        {menuItem.subItemGroups.length > 0 && (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </button>
                                    {menuItem.subItemGroups.length > 0 && activeMenu === menuItem.name && (
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
                                    <div className="py-1 rounded-md bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                                        <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
                                        <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                                        <a href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</a>
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
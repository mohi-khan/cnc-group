'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { AccountsHead } from '@/utils/type'
import { FileText } from 'lucide-react'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  getAllChartOfAccounts,
  getAllCompanies,
  getAllLocations,
} from '@/api/common-shared-api'
import { CustomCombobox } from '@/utils/custom-combobox'

// Define types for Company and Location
interface Company {
  id: number
  name: string
}

interface Location {
  id: number
  name: string
  companyId?: number
}

interface SingleTrialBalanceFindProps {
  initialAccountCode: string
  initialFromDate: string
  initialToDate: string
  initialCompanyId?: number
  initialLocationId?: number
  onSearch: (
    accountcode: number,
    fromdate: string,
    todate: string,
    locationId: number,
    companyId: number
  ) => void
  generatePdf: () => void
  generateExcel: () => void
}

export default function SingleTrialBalanceFind({
  initialAccountCode,
  initialFromDate,
  initialToDate,
  initialCompanyId,
  initialLocationId,
  onSearch,
  generatePdf,
  generateExcel,
}: SingleTrialBalanceFindProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const [fromDate, setFromDate] = useState<string>(initialFromDate)
  const [toDate, setToDate] = useState<string>(initialToDate)
  const [selectedAccountCode, setSelectedAccountCode] =
    useState<string>(initialAccountCode)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    initialCompanyId || null
  )
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    initialLocationId || null
  )

  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])

  const fetchCompanies = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      const apiData = response.data || []

      // Handle different API response formats
      const mappedCompanies = apiData.map((company: any) => ({
        id: company.companyId || company.id,
        name: company.companyName || company.name,
      }))

      setCompanies(mappedCompanies)
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch companies',
      })
    }
  }, [token])

  const fetchLocations = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllLocations(token)
      const apiData = response.data ?? []

      // Handle different API response formats and ensure companyId is included
      const mappedLocations: Location[] = apiData.map((loc: any) => ({
        id: loc.locationId || loc.id,
        name: loc.address || loc.locationName || loc.name,
        companyId: loc.companyId, // This is crucial for filtering
      }))

      setLocations(mappedLocations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch locations',
      })
    }
  }, [token])

  const fetchChartOfAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllChartOfAccounts(token)
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting chart of accounts:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get chart of accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
    }
  }, [token])

  // Filter locations based on selected company
  useEffect(() => {
    if (selectedCompanyId) {
      const filtered = locations.filter(
        (location) => location.companyId === selectedCompanyId
      )
      setFilteredLocations(filtered)

      // Reset location selection if current location doesn't belong to selected company
      if (
        selectedLocationId &&
        !filtered.find((loc) => loc.id === selectedLocationId)
      ) {
        setSelectedLocationId(null)
      }
    } else {
      setFilteredLocations(locations)
    }
  }, [selectedCompanyId, locations, selectedLocationId])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchCompanies()
    fetchLocations()

    // Only set dates if they are valid
    if (initialFromDate) {
      setFromDate(initialFromDate)
    }
    if (initialToDate) {
      setToDate(initialToDate)
    }
    if (initialAccountCode) {
      setSelectedAccountCode(initialAccountCode)
    }
    if(initialCompanyId){
      setSelectedCompanyId(initialCompanyId)
    }

    // Trigger search automatically if we have all required values
    if (
      initialFromDate &&
      initialToDate &&
      initialAccountCode &&
      initialCompanyId &&
      initialLocationId
    ) {
      onSearch(
        Number(initialAccountCode),
        initialFromDate,
        initialToDate,
        initialLocationId,
        initialCompanyId
      )
    }
  }, [
    initialFromDate,
    initialToDate,
    initialAccountCode,
    initialCompanyId,
    initialLocationId,
    onSearch,
    fetchChartOfAccounts,
    fetchCompanies,
    fetchLocations,
  ])

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both dates',
      })
      return
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'To Date must be greater than From Date',
      })
      return
    }

    if (!selectedAccountCode) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an account',
      })
      return
    }

    if (!selectedCompanyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a company',
      })
      return
    }

    if (!selectedLocationId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a location',
      })
      return
    }

    onSearch(
      Number(selectedAccountCode),
      fromDate,
      toDate,
      selectedLocationId,
      selectedCompanyId
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-self-center gap-2">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">PDF</span>
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 17H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">Excel</span>
        </Button>
      </div>
      {/* First Row - Dates and Account */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Account:</span>
          <CustomCombobox
            items={accounts
              .filter((account) => account.isActive)
              .map((account) => ({
                id: account.accountId,
                name: account.name,
              }))}
            value={
              selectedAccountCode
                ? {
                    id: Number(selectedAccountCode),
                    name:
                      accounts.find(
                        (account) =>
                          account.accountId === Number(selectedAccountCode)
                      )?.name || '',
                  }
                : null
            }
            onChange={(selectedItem) => {
              const value = selectedItem?.id ? String(selectedItem.id) : ''
              setSelectedAccountCode(value)
            }}
            placeholder="Select an Account"
            disabled={accounts.length === 0}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Company:</span>
          <CustomCombobox
            items={companies.map((company) => ({
              id: company.id,
              name: company.name,
            }))}
            value={
              selectedCompanyId
                ? {
                    id: selectedCompanyId,
                    name:
                      companies.find(
                        (company) => company.id === selectedCompanyId
                      )?.name || '',
                  }
                : null
            }
            onChange={(selectedItem) => {
              setSelectedCompanyId(selectedItem?.id || null)
              // Reset location when company changes
              setSelectedLocationId(null)
            }}
            placeholder="Select a Company"
            disabled={companies.length === 0}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Location:</span>
          <CustomCombobox
            items={filteredLocations.map((location) => ({
              id: location.id,
              name: location.name,
            }))}
            value={
              selectedLocationId
                ? {
                    id: selectedLocationId,
                    name:
                      filteredLocations.find(
                        (location) => location.id === selectedLocationId
                      )?.name || '',
                  }
                : null
            }
            onChange={(selectedItem) => {
              setSelectedLocationId(selectedItem?.id || null)
            }}
            placeholder="Select a Location"
            disabled={!selectedCompanyId || filteredLocations.length === 0}
          />
        </div>

        <Button onClick={handleSearch}>Show</Button>
      </div>

      {/* Third Row - Export Buttons */}
    </div>
  )
}

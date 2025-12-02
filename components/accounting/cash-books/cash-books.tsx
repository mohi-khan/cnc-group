'use client'

import { getAllVoucherByDate } from '@/api/day-books-api'
import { Input } from '@/components/ui/input'
import VoucherList, { Column } from '@/components/voucher-list/voucher-list'
import { useToast } from '@/hooks/use-toast'
import {
  JournalQueryDateRange,
  VoucherTypes,
  type CompanyFromLocalstorage,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { Search, Calendar, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CashBooks = () => {
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { toast } = useToast()
  const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Date range states
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)

  const [searchTerm, setSearchTerm] = useState('')

  const linkGenerator = (voucherId: number): string => {
    const voucher = voucherGrid.find(
      (voucher) => voucher.voucherid === voucherId
    )

    let type = ''
    if (voucher) {
      switch (voucher.journaltype) {
        case 'Cash Voucher':
          type = VoucherTypes.CashVoucher
          break
        case 'Contra Voucher':
          type = VoucherTypes.ContraVoucher
          break
        case 'Journal Voucher':
          type = VoucherTypes.JournalVoucher
          break
        case 'Bank Voucher':
          type = VoucherTypes.BankVoucher
          break
        case 'Opening Balance':
          type = VoucherTypes.OpeningBalance
          break
      }
    }

    return `/voucher-list/single-voucher-details/${voucherId}?voucherType=${type}`
  }

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }
    checkUserData()

    if (userData) {
      setUser(userData)
      if (userData?.userCompanies?.length > 0) {
        setCompanies(userData.userCompanies)
      }
      if (userData?.userLocations?.length > 0) {
        setLocations(userData.userLocations)
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
      })
    }
  }, [router, userData, toast])

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }

  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const getallVoucher = useCallback(
    async (
      company: number[],
      location: number[],
      start: string,
      end: string
    ) => {
      try {
        const voucherQuery: JournalQueryDateRange = {
          startDate: start,
          endDate: end,
          companyId: company,
          locationId: location,
        }

        const response = await getAllVoucherByDate(voucherQuery, token)

        if (!response.data) {
          throw new Error('No data received from server')
        }

        let filteredData = Array.isArray(response.data) ? response.data : []

        // Filter only Cash Vouchers
        filteredData = filteredData.filter(
          (item) => item.journaltype === 'Cash Voucher'
        )

        // Role check: If not admin, show only user's own vouchers
        if (userData?.roleId !== 1) {
          filteredData = filteredData.filter(
            (item) => item.createdBy === userData?.userId
          )
        }

        // Sort by newest created time
        filteredData = filteredData.sort(
          (a, b) =>
            new Date(b.createdTime).getTime() -
            new Date(a.createdTime).getTime()
        )

        setVoucherGrid(filteredData)

        console.log('🔥 Filtered cash voucher data:', filteredData)
      } catch (error) {
        console.error('Error getting Cash Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token, userData]
  )

  const fetchVoucherData = useCallback(
    async (showRefreshingState = false) => {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const mycompanies = getCompanyIds(companies)
        const mylocations = getLocationIds(locations)
        await getallVoucher(mycompanies, mylocations, startDate, endDate)

        if (showRefreshingState) {
          toast({
            title: 'Success',
            description: 'Cash voucher list refreshed successfully',
          })
        }
      } catch (error) {
        console.error('Error fetching cash voucher data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load cash voucher data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        if (showRefreshingState) {
          setIsRefreshing(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [companies, locations, startDate, endDate, getallVoucher, toast]
  )

  useEffect(() => {
    if (companies.length > 0 && locations.length > 0) {
      fetchVoucherData(false)
    }
  }, [
    companies,
    locations,
    startDate,
    endDate,
    getallVoucher,
    toast,
    fetchVoucherData,
  ])

  // Listen for custom event to refresh the list
  useEffect(() => {
    const handleVoucherUpdate = () => {
      fetchVoucherData(true)
    }

    window.addEventListener('voucherUpdated', handleVoucherUpdate)

    return () => {
      window.removeEventListener('voucherUpdated', handleVoucherUpdate)
    }
  }, [fetchVoucherData])

  const handleManualRefresh = () => {
    fetchVoucherData(true)
  }

  const filteredVouchers = voucherGrid.filter((voucher) =>
    Object.values(voucher)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const columns: Column[] = [
    { key: 'voucherno', label: 'Voucher No' },
    { key: 'date', label: 'Date' },
    { key: 'createdTime', label: 'Created At' },
    { key: 'journaltype', label: 'Voucher Type' },
    { key: 'companyname', label: 'Company Name' },
    { key: 'location', label: 'Location' },
    { key: 'totalamount', label: 'Total Amount' },
    { key: 'createdByName', label: 'Created By' },
    { key: 'state', label: 'Status' },
  ]

  return (
    <div className="w-[96%] mx-2">
      <h1 className="text-2xl font-bold my-6">Cash Books</h1>

      {/* Date Range and Search Row */}
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center mx-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>

          {/* Items Per Page Selector */}
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search cash vouchers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <VoucherList
        vouchers={filteredVouchers}
        columns={columns}
        isLoading={isLoading}
        linkGenerator={linkGenerator}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default CashBooks

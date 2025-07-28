'use client'

import { getAllVoucher } from '@/api/day-books-api'
import { Input } from '@/components/ui/input'
import VoucherList, { Column } from '@/components/voucher-list/voucher-list'
import { useToast } from '@/hooks/use-toast'
import {
  VoucherTypes,
  type CompanyFromLocalstorage,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
  type Voucher,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

const DayBooks = () => {
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { toast } = useToast()
  const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])

  // New states
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
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
      if (!userData.voucherTypes.includes('Cash Voucher')) {
        router.push('/unauthorized-access')
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
    async (company: number[], location: number[], date: string) => {
      try {
        const voucherQuery: JournalQuery = {
          date: date,
          companyId: company,
          locationId: location,
        }
        const response = await getAllVoucher(voucherQuery, token)
        if (!response.data) {
          throw new Error('No data received from server')
        }
        setVoucherGrid(Array.isArray(response.data) ? response.data : [])
        console.log( 'Voucher Data:', response.data)
        
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token]
  )

  useEffect(() => {
    const fetchVoucherData = async () => {
      setIsLoading(true)
      try {
        const mycompanies = getCompanyIds(companies)
        const mylocations = getLocationIds(locations)
        await getallVoucher(mycompanies, mylocations, selectedDate)
      } catch (error) {
        console.error('Error fetching voucher data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load voucher data. Please try again.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (companies.length > 0 && locations.length > 0) {
      fetchVoucherData()
    }
  }, [companies, locations, selectedDate, getallVoucher, toast])

  // Filtered voucher list based on searchTerm
  const filteredVouchers = voucherGrid.filter((voucher) =>
    Object.values(voucher)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const columns: Column[] = [
    { key: 'voucherno', label: 'Voucher No.' },
    { key: 'journaltype', label: 'Voucher Type' },
    { key: 'companyname', label: 'Company Name' },
    { key: 'currency', label: 'Currency' },
    { key: 'location', label: 'Location' },
    { key: 'notes', label: 'Remarks' },
    { key: 'totalamount', label: 'Total Amount' },
    { key: 'state', label: 'Status' },
  ]

  return (
    <div className="w-[96%] mx-auto">
      <h1 className="text-2xl font-bold my-6">Day Books</h1>

      {/* Date and Search in same row */}
      <div className="mb-4 flex justify-between items-center mx-4">
        <div>
          <label htmlFor="voucher-date" className="mr-2 font-medium">
            Select Date:
          </label>
          <input
            type="date"
            id="voucher-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search accounts..."
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
        itemsPerPage={10}
      />
    </div>
  )
}

export default DayBooks
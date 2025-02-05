'use client'

import { getAllVoucher } from '@/api/day-books-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { useToast } from '@/hooks/use-toast'
import type {
  CompanyFromLocalstorage,
  JournalQuery,
  JournalResult,
  LocationFromLocalstorage,
  User,
  Voucher,
  VoucherTypes,
} from '@/utils/type'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const DayBooks = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])

  // New state for the selected date. Defaults to today's date.
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const linkGenerator = (voucherId: number, voucherType: VoucherTypes) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${voucherType}`

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    try {
      if (userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setCompanies(userData.userCompanies || [])
        setLocations(userData.userLocations || [])
        if (!userData.voucherTypes.includes('Cash Voucher')) {
          router.push('/unauthorized-access')
        }
      } else {
        router.push('/unauthorized-access')
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user data',
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  // Updated to accept a date parameter
  async function getallVoucher(
    company: number[],
    location: number[],
    date: string
  ) {
    try {
      const voucherQuery: JournalQuery = {
        date: date,
        companyId: company,
        locationId: location,
      }
      const response = await getAllVoucher(voucherQuery)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      setVoucherGrid(Array.isArray(response.data) ? response.data : [])
      console.log('Voucher data:', response.data)
    } catch (error) {
      console.error('Error getting Voucher Data:', error)
      setVoucherGrid([])
      throw error
    }
  }

  // Fetch voucher data whenever companies, locations, or the selected date changes
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
  }, [companies, locations, selectedDate, toast])

  const columns: { key: keyof Voucher; label: string }[] = [
    { key: 'voucherno', label: 'Voucher No.' },
    { key: 'journaltype', label: 'Voucher Type' },
    { key: 'companyname', label: 'Company Name' },
    { key: 'currency', label: 'Currency' },
    { key: 'location', label: 'Location' },
    { key: 'date', label: 'Date' },
    { key: 'notes', label: 'Remarks' },
    { key: 'totalamount', label: 'Total Amount' },
    { key: 'state', label: 'Status' },
  ]

  return (
    <div className="w-[96%] mx-auto">
      <h1 className="text-2xl font-bold my-6">Day Books</h1>

      {/* Date input for user selection */}
      <div className="mb-4">
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

      <VoucherList
        vouchers={voucherGrid}
        columns={columns}
        isLoading={isLoading}
        linkGenerator={linkGenerator}
        itemsPerPage={10}
      />
    </div>
  )
}

export default DayBooks

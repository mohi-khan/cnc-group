'use client'

import React, { useState, useEffect } from 'react'
import {
  type CompanyFromLocalstorage,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type User,
  VoucherTypes,
} from '@/utils/type'
import { getAllVoucher } from '@/api/journal-voucher-api'
import { ContraVoucherPopup } from './contra-voucher-popup'
import VoucherList from '@/components/voucher-list/voucher-list'

export default function ContraVoucherTable() {
  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)

      const companyIds = getCompanyIds(userData.userCompanies)
      const locationIds = getLocationIds(userData.userLocations)
      console.log({ companyIds, locationIds })
      fetchAllVoucher(companyIds, locationIds)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  async function fetchAllVoucher(company: number[], location: number[]) {
    setIsLoading(true)
    const voucherQuery: JournalQuery = {
      date: new Date().toISOString().split('T')[0],
      companyId: company,
      locationId: location,
      voucherType: VoucherTypes.ContraVoucher,
    }
    const response = await getAllVoucher(voucherQuery)
    if (response.data && Array.isArray(response.data)) {
      console.log(
        'contra voucher data line no 57 and i am from contra voucher list:',
        response.data
      )

      setVouchers(response.data)
    } else {
      console.log('No voucher data available')
      setVouchers([])
    }
    setIsLoading(false)
  }

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }

  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Voucher Date' },
    { key: 'notes' as const, label: 'Notes' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'state' as const, label: 'Status' },
    { key: 'totalamount' as const, label: 'Amount' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/cash/contra-vouchers/single-contra-voucher/${voucherId}`

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contra Vouchers</h1>
        <ContraVoucherPopup fetchAllVoucher={fetchAllVoucher} />
      </div>

      <VoucherList
        vouchers={vouchers}
        columns={columns}
        isLoading={isLoading}
        linkGenerator={linkGenerator}
        itemsPerPage={10}
      />
    </div>
  )
}

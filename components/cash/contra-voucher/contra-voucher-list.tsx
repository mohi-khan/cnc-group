'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

// ─── localStorage key ──────────────────────────────────────────────────────────
const LAST_USED_KEY = 'lastContraVoucherValues'

// ─── Shape saved to localStorage ──────────────────────────────────────────────
export interface LastUsedContraValues {
  companyId: number
  locationId: number
  currencyId: number
  date: string
}

export default function ContraVoucherTable() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Last-used state (client-only — starts null/false to avoid SSR mismatch) ──
  const [lastUsedValues, setLastUsedValues] =
    useState<LastUsedContraValues | null>(null)
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

  // ─── localStorage helpers ────────────────────────────────────────────────────
  const getLastUsedValues = useCallback((): LastUsedContraValues | null => {
    try {
      const saved = localStorage.getItem(LAST_USED_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [])

  const saveLastUsedValues = useCallback(
    (companyId: number, locationId: number, currencyId: number, date: string) => {
      try {
        const toSave: LastUsedContraValues = { companyId, locationId, currencyId, date }
        localStorage.setItem(LAST_USED_KEY, JSON.stringify(toSave))
        setLastUsedValues(toSave)
        setShowLastUsedBanner(true)
      } catch {
        // silently ignore write failures
      }
    },
    []
  )

  const clearLastUsedValues = useCallback(() => {
    try {
      localStorage.removeItem(LAST_USED_KEY)
    } catch {
      // ignore
    }
    setLastUsedValues(null)
    setShowLastUsedBanner(false)
  }, [])

  // ─── Client-only: restore last-used values AFTER first paint ─────────────────
  useEffect(() => {
    const last = getLastUsedValues()
    if (!last) return
    if (!last.companyId && !last.currencyId) return
    setLastUsedValues(last)
    setShowLastUsedBanner(true)
  }, [getLastUsedValues])

  // ─── Fetch vouchers ──────────────────────────────────────────────────────────
  const fetchAllVoucher = useCallback(
    async (company: number[], location: number[]) => {
      setIsLoading(true)
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.ContraVoucher,
      }
      const response = await getAllVoucher(voucherQuery, token)
      if (response.data && Array.isArray(response.data)) {
        setVouchers(response.data)
      } else {
        setVouchers([])
      }
      setIsLoading(false)
    },
    [token]
  )

  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
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
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      fetchAllVoucher(
        getCompanyIds(userData.userCompanies),
        getLocationIds(userData.userLocations)
      )
    }
  }, [userData, fetchAllVoucher, router])

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
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.ContraVoucher}`

  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contra Vouchers</h1>
        <ContraVoucherPopup
          fetchAllVoucher={fetchAllVoucher}
          onSuccess={() => {
            fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations))
          }}
          lastUsedValues={lastUsedValues}
          showLastUsedBanner={showLastUsedBanner}
          onClearLastUsed={clearLastUsedValues}
          onSaveLastUsed={saveLastUsedValues}
        />
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

// 'use client'

// import React, { useState, useEffect, useCallback } from 'react'
// import {
//   type CompanyFromLocalstorage,
//   type JournalQuery,
//   type JournalResult,
//   type LocationFromLocalstorage,
//   type User,
//   VoucherTypes,
// } from '@/utils/type'
// import { getAllVoucher } from '@/api/journal-voucher-api'
// import { ContraVoucherPopup } from './contra-voucher-popup'
// import VoucherList from '@/components/voucher-list/voucher-list'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// export default function ContraVoucherTable() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   // State variables
//   const [vouchers, setVouchers] = useState<JournalResult[]>([])
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   //getting user data from localStorage and setting it to state
//   const fetchAllVoucher = useCallback(
//     async (company: number[], location: number[]) => {
//       setIsLoading(true)
//       const voucherQuery: JournalQuery = {
//         date: new Date().toISOString().split('T')[0],
//         companyId: company,
//         locationId: location,
//         voucherType: VoucherTypes.ContraVoucher,
//       }
//       const response = await getAllVoucher(voucherQuery, token)
//       if (response.data && Array.isArray(response.data)) {

//         setVouchers(response.data)
//       } else {
        
//         setVouchers([])
//       }
//       setIsLoading(false)
//     },
//     [token]
//   )

//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')

//       if (!storedUserData || !storedToken) {
        
//         router.push('/')
//         return
//       }
//     }

//     checkUserData()
//     if (userData) {
//       setUser(userData)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
      

//       const companyIds = getCompanyIds(userData.userCompanies)
//       const locationIds = getLocationIds(userData.userLocations)
      
//       fetchAllVoucher(companyIds, locationIds)
//     } else {
      
//     }
//   }, [userData, fetchAllVoucher, router])

//   // Function to fetch all vouchers based on company and location IDs

//   // Function to extract company IDs from localStorage data
//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }

//   // Function to extract location IDs from localStorage data
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   // Column definitions for the voucher list
//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'date' as const, label: 'Voucher Date' },
//     { key: 'notes' as const, label: 'Notes' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'state' as const, label: 'Status' },
//     { key: 'totalamount' as const, label: 'Amount' },
//   ]

//   // Function to generate the link for voucher details page
//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.ContraVoucher}`

//   return (
//     <div className="w-[97%] mx-auto py-10">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Contra Vouchers</h1>
//         <ContraVoucherPopup 
//           fetchAllVoucher={fetchAllVoucher}
//           onSuccess={() => {
//             const companyIds = getCompanyIds(companies);
//             const locationIds = getLocationIds(locations);
//             fetchAllVoucher(companyIds, locationIds);
//           }}
//         />
//       </div>

//       <VoucherList
//         vouchers={vouchers}
//         columns={columns}
//         isLoading={isLoading}
//         linkGenerator={linkGenerator}
//         itemsPerPage={10}
//       />
//     </div>
//   )
// }

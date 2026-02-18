'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { JournalVoucherPopup } from './journal-voucher-popup'
import {
  type CompanyFromLocalstorage,
  type JournalEntryWithDetails,
  type JournalQuery,
  JournalResult,
  type LocationFromLocalstorage,
  VoucherTypes,
} from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/journal-voucher-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

// ─── localStorage key ──────────────────────────────────────────────────────────
const LAST_USED_KEY = 'lastJournalVoucherValues'

// ─── Shape saved to localStorage ──────────────────────────────────────────────
export interface LastUsedJournalValues {
  companyId: number
  locationId: number
  currencyId: number
  date: string
}

export default function VoucherTable() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [vouchers, setVouchers] = useState<JournalResult[]>([])
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [userId, setUserId] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // ── Last-used state (client-only — starts null to avoid SSR mismatch) ─────────
  const [lastUsedValues, setLastUsedValues] =
    useState<LastUsedJournalValues | null>(null)
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)

  // ─── localStorage helpers ────────────────────────────────────────────────────
  const getLastUsedValues = useCallback((): LastUsedJournalValues | null => {
    try {
      const saved = localStorage.getItem(LAST_USED_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [])

  const saveLastUsedValues = useCallback((values: JournalEntryWithDetails) => {
    try {
      const toSave: LastUsedJournalValues = {
        companyId: values.journalEntry.companyId,
        locationId: values.journalEntry.locationId,
        currencyId: values.journalEntry.currencyId,
        date: values.journalEntry.date,
      }
      localStorage.setItem(LAST_USED_KEY, JSON.stringify(toSave))
    } catch {
      // silently ignore write failures
    }
  }, [])

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

  // ─── Columns / link ──────────────────────────────────────────────────────────
  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Voucher Date' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'state' as const, label: 'Status' },
    { key: 'totalamount' as const, label: 'Amount' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.JournalVoucher}`

  // ─── Fetch vouchers ──────────────────────────────────────────────────────────
  const fetchAllVoucher = useCallback(
    async (company: number[], location: number[], token: string) => {
      setIsLoading(true)
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.JournalVoucher,
      }

      try {
        if (!token) return
        const response = await getAllVoucher(voucherQuery, token)
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (response.error || !response.data) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to fetch vouchers',
            variant: 'destructive',
          })
          setVouchers([])
        } else {
          setVouchers(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch vouchers. Please try again.',
          variant: 'destructive',
        })
        setVouchers([])
      } finally {
        setIsLoading(false)
      }
    },
    [router]
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
      setUserId(userData.userId)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      fetchAllVoucher(
        getCompanyIds(userData.userCompanies),
        getLocationIds(userData.userLocations),
        token
      )
    } else {
      setIsLoading(false)
    }
  }, [fetchAllVoucher, router, userData, token])

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (
    data: JournalEntryWithDetails,
    resetForm: () => void
  ) => {
    setIsSubmitting(true)

    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal: data.journalEntry.amountTotal,
        createdBy: userId,
      },
      journalDetails: data.journalDetails.map((detail) => ({
        ...detail,
        createdBy: userId,
        costCenterId: detail.costCenterId || null,
        departmentId: detail.departmentId || null,
      })),
    }

    const response = await createJournalEntryWithDetails(submissionData, token)

    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: `${response.error?.message}`,
        variant: 'destructive',
      })
    } else {
      // ✅ Persist last-used values on successful create
      saveLastUsedValues(data)
      setShowLastUsedBanner(true)
      setLastUsedValues({
        companyId: data.journalEntry.companyId,
        locationId: data.journalEntry.locationId,
        currencyId: data.journalEntry.currencyId,
        date: data.journalEntry.date,
      })

      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      })
      resetForm()
    }

    setIsSubmitting(false)
    fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations), token)
  }

  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Journal Vouchers</h1>
        <JournalVoucherPopup
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          lastUsedValues={lastUsedValues}
          showLastUsedBanner={showLastUsedBanner}
          onClearLastUsed={clearLastUsedValues}
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
// import { JournalVoucherPopup } from './journal-voucher-popup'
// import {
//   type CompanyFromLocalstorage,
//   type JournalEntryWithDetails,
//   type JournalQuery,
//   JournalResult,
//   type LocationFromLocalstorage,
//   VoucherTypes,
// } from '@/utils/type'
// import { toast } from '@/hooks/use-toast'
// import {
//   createJournalEntryWithDetails,
//   getAllVoucher,
// } from '@/api/journal-voucher-api'
// import VoucherList from '@/components/voucher-list/voucher-list'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// export default function VoucherTable() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
  
//   const router = useRouter()

//   //state variables
//   const [vouchers, setVouchers] = useState<JournalResult[]>([])
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [userId, setUserId] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isPopupOpen, setIsPopupOpen] = useState(false)

//   // Columns for the voucher list table
//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'date' as const, label: 'Voucher Date' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'state' as const, label: 'Status' },
//     { key: 'totalamount' as const, label: 'Amount' },
//   ]

//   // Function to generate the link for voucher details
//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.JournalVoucher}`

//   // Function to fetch all vouchers based on company and location IDs
//   const fetchAllVoucher = useCallback(
//     async (company: number[], location: number[], token: string) => {
//       setIsLoading(true)
//       const voucherQuery: JournalQuery = {
//         date: new Date().toISOString().split('T')[0],
//         companyId: company,
//         locationId: location,
//         voucherType: VoucherTypes.JournalVoucher,
//       }
      
//       try {
//         if(!token) return
//         const response = await getAllVoucher(voucherQuery, token)
//         if (response?.error?.status === 401) {
//           router.push('/unauthorized-access')
          
//           return
//         } else if (response.error || !response.data) {
//           console.error('Error getting Voucher Data:', response.error)
//           toast({
//             title: 'Error',
//             description: response.error?.message || 'Failed to fetch vouchers',
//             variant: 'destructive',
//           })
//           setVouchers([])
//           return
//         } else {
          
//           setVouchers(Array.isArray(response.data) ? response.data : [])
//         }
//       } catch (error) {
//         console.error('Error getting Voucher Data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to fetch vouchers. Please try again.',
//           variant: 'destructive',
//         })
//         setVouchers([])
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     [router]  )

//   //getting userData from jotai (atom) and setting the userId, companies and locations
//   // and fetching all vouchers based on the user data
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
//       setUserId(userData.userId)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
      

//       const companyIds = getCompanyIds(userData.userCompanies)
//       const locationIds = getLocationIds(userData.userLocations)
      

//       fetchAllVoucher(companyIds, locationIds, token)
//     } else {
      
//       setIsLoading(false)
//     }
//   }, [fetchAllVoucher, router, userData, token])

//   // Function to extract company IDs from localStorage data
//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }

//   // Function to extract location IDs from localStorage data
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   // Function to handle form submission
//   // It takes the form data and a reset function as arguments
//   const handleSubmit = async (
//     data: JournalEntryWithDetails,
//     resetForm: () => void
//   ) => {
//     setIsSubmitting(true)
    

//     //stringify the form data to send to the API
//     const submissionData = {
//       ...data,
//       journalEntry: {
//         ...data.journalEntry,
//         amountTotal: data.journalEntry.amountTotal,
//         createdBy: userId,
//       },
//       journalDetails: data.journalDetails.map((detail) => ({
//         ...detail,
//         createdBy: userId,
//         costCenterId: detail.costCenterId || null,
//         departmentId: detail.departmentId || null,
//       })),
//     }

    

//     // Call the API to create the journal entry with details
//     const response = await createJournalEntryWithDetails(submissionData, token)

//     // Check for errors in the response. if no error, show success message and reset the form
//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description: `${response.error?.message}`,
//         variant: 'destructive',
//       })
//     } else {
//       toast({
//         title: 'Success',
//         description: 'Voucher created successfully',
//       })
//       resetForm()
//       // setIsPopupOpen(false)
//     }

//     setIsSubmitting(false)
//     // Refetch the vouchers after submission. so that we don't have to refresh the page after submission
//     fetchAllVoucher(getCompanyIds(companies), getLocationIds(locations), token)
//   }

//   return (
//     <div className="w-[97%] mx-auto py-10">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Journal Vouchers</h1>
//         <JournalVoucherPopup
//           isOpen={isPopupOpen}
//           onOpenChange={setIsPopupOpen}
//           handleSubmit={handleSubmit}
//           isSubmitting={isSubmitting}
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

// 'use client'

// import { getAllVoucherByDate } from '@/api/day-books-api'
// import { Input } from '@/components/ui/input'
// import VoucherList, { Column } from '@/components/voucher-list/voucher-list'
// import { useToast } from '@/hooks/use-toast'
// import {
//   JournalQueryDateRange,
//   VoucherTypes,
//   type CompanyFromLocalstorage,
//   type JournalResult,
//   type LocationFromLocalstorage,
//   type User,
// } from '@/utils/type'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { Search, Calendar } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import React, { useCallback, useEffect, useState } from 'react'

// const DayBooks = () => {
//   const router = useRouter()
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const { toast } = useToast()
//   const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])

//   // New states for date range
//   const today = new Date().toISOString().split('T')[0]
//   const [startDate, setStartDate] = useState<string>(today)
//   const [endDate, setEndDate] = useState<string>(today)

//   const [searchTerm, setSearchTerm] = useState('')

//   const linkGenerator = (voucherId: number): string => {
//     const voucher = voucherGrid.find(
//       (voucher) => voucher.voucherid === voucherId
//     )

//     let type = ''
//     if (voucher) {
//       switch (voucher.journaltype) {
//         case 'Cash Voucher':
//           type = VoucherTypes.CashVoucher
//           break
//         case 'Contra Voucher':
//           type = VoucherTypes.ContraVoucher
//           break
//         case 'Journal Voucher':
//           type = VoucherTypes.JournalVoucher
//           break
//         case 'Bank Voucher':
//           type = VoucherTypes.BankVoucher
//           break
//       }
//     }

//     return `/voucher-list/single-voucher-details/${voucherId}?voucherType=${type}`
//   }

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
//       if (userData?.userCompanies?.length > 0) {
//         setCompanies(userData.userCompanies)
//       }
//       if (userData?.userLocations?.length > 0) {
//         setLocations(userData.userLocations)
//       }
//       if (!userData.voucherTypes.includes('Cash Voucher')) {
//         router.push('/unauthorized-access')
//       }
//     } else {
//       toast({
//         title: 'Error',
//         description: 'Failed to load user data',
//       })
//     }
//   }, [router, userData, toast])

//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   const getallVoucher = useCallback(
//     async (
//       company: number[],
//       location: number[],
//       start: string,
//       end: string
//     ) => {
//       try {
//         const voucherQuery: JournalQueryDateRange = {
//           startDate: start,
//           endDate: end,
//           companyId: company,
//           locationId: location,
//         }
//         const response = await getAllVoucherByDate(voucherQuery, token)
//         if (!response.data) {
//           throw new Error('No data received from server')
//         }
//         setVoucherGrid(
//           Array.isArray(response.data)
//             ? [...response.data].sort(
//                 (a, b) =>
//                   new Date(b.createdTime).getTime() -
//                   new Date(a.createdTime).getTime()
//               )
//             : []
//         )

//         console.log('🚀 ~ DayBooks ~ response.data:', response.data)
//       } catch (error) {
//         console.error('Error getting Voucher Data:', error)
//         setVoucherGrid([])
//         throw error
//       }
//     },
//     [token]
//   )

//   useEffect(() => {
//     const fetchVoucherData = async () => {
//       setIsLoading(true)
//       try {
//         const mycompanies = getCompanyIds(companies)
//         const mylocations = getLocationIds(locations)
//         await getallVoucher(mycompanies, mylocations, startDate, endDate)
//       } catch (error) {
//         console.error('Error fetching voucher data:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load voucher data. Please try again.',
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (companies.length > 0 && locations.length > 0) {
//       fetchVoucherData()
//     }
//   }, [companies, locations, startDate, endDate, getallVoucher, toast])

//   const filteredVouchers = voucherGrid.filter((voucher) =>
//     Object.values(voucher)
//       .join(' ')
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   )

//   const columns: Column[] = [
//     { key: 'voucherno', label: 'Voucher No.' },
//     { key: 'journaltype', label: 'Voucher Type' },
//     { key: 'companyname', label: 'Company Name' },
//     { key: 'currency', label: 'Currency' },
//     { key: 'location', label: 'Location' },
//     { key: 'totalamount', label: 'Total Amount' },
//     { key: 'state', label: 'Status' },
//   ]

//   return (
//     <div className="w-[96%] mx-auto">
//       <h1 className="text-2xl font-bold my-6">Day Books</h1>

//       {/* Date Range and Search Row */}
//       <div className="mb-4 flex flex-wrap gap-4 justify-between items-center mx-4">
//         <div className="flex flex-wrap gap-3 items-center">
//           {/* Start Date */}
//           <div className="relative">
//             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="border rounded pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* End Date */}
//           <div className="relative">
//             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border rounded pl-10 pr-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Search Box */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Search accounts..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 w-64"
//           />
//         </div>
//       </div>

//       <VoucherList
//         vouchers={filteredVouchers}
//         columns={columns}
//         isLoading={isLoading}
//         linkGenerator={linkGenerator}
//         itemsPerPage={10}
//       />
//     </div>
//   )
// }

// export default DayBooks

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

const DayBooks = () => {
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

  // New states for date range
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
        setVoucherGrid(
          Array.isArray(response.data)
            ? [...response.data].sort(
                (a, b) =>
                  new Date(b.createdTime).getTime() -
                  new Date(a.createdTime).getTime()
              )
            : []
        )

        console.log('🚀 ~ DayBooks ~ response.data:', response.data)
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token]
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
            description: 'Voucher list refreshed successfully',
          })
        }
      } catch (error) {
        console.error('Error fetching voucher data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load voucher data. Please try again.',
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
    { key: 'voucherno', label: 'Voucher No.' },
    { key: 'journaltype', label: 'Voucher Type' },
    { key: 'companyname', label: 'Company Name' },
    { key: 'currency', label: 'Currency' },
    { key: 'location', label: 'Location' },
    { key: 'totalamount', label: 'Total Amount' },
    { key: 'state', label: 'Status' },
  ]

  return (
    <div className="w-[96%] mx-auto">
      <h1 className="text-2xl font-bold my-6">Day Books</h1>

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
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { toast } from '@/hooks/use-toast'
// import type { ResPartner } from '@/utils/type'
// import { FileText } from 'lucide-react'
// import { getPartnerById, getResPartnersBySearch } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'

// interface PartnerLedgerFindProps {
//   onSearch: (
//     partnercode: number,
//     fromdate: string,
//     todate: string,
//     companyId:number
//   ) => void
//   generatePdf: () => void
//   generateExcel: () => void
// }

// export default function PartneredgerFind({
//   onSearch,
//   generatePdf,
//   generateExcel,
// }: PartnerLedgerFindProps) {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()
//   const [fromDate, setFromDate] = useState<string>('')
//   const [toDate, setToDate] = useState<string>('')
//   const [selectedAccountCode, setSelectedAccountCode] = useState<
//     string | number
//   >('')
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [isLoadingPartners, setIsLoadingPartners] = useState(true)
//   const [selectedPartner, setSelectedPartner] = useState<ComboboxItem | null>(
//     null
//   )

//   const fetchgetResPartner = useCallback(async () => {
//     const search = ''
//     setIsLoadingPartners(true)
//     if (!token) return
//     try {
//       const response = await getResPartnersBySearch(search, token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')

//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting partners:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load partners',
//         })
//         setPartners([])
//         return
//       } else {
//         setPartners(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting partners:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load partners',
//       })
//       setPartners([])
//     } finally {
//       setIsLoadingPartners(false)
//     }
//   }, [token, router, setPartners])

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
//     fetchgetResPartner()
//   }, [fetchgetResPartner, router])

//   const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
//     try {
//       const response = await getResPartnersBySearch(query, token)
//       if (response.error || !response.data) {
//         console.error('Error fetching partners:', response.error)
//         return []
//       }

//       return response.data.map((partner) => ({
//         id: partner.id.toString(),
//         name: partner.name || 'Unnamed Partner',
//       }))
//     } catch (error) {
//       console.error('Error fetching partners:', error)
//       return []
//     }
//   }

//   const handleSearch = () => {
//     if (!fromDate || !toDate) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Please select both dates',
//       })
//       return
//     }

//     if (new Date(toDate) < new Date(fromDate)) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'To Date must be greater than From Date',
//       })
//       return
//     }

//     if (!selectedAccountCode) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Please select an account',
//       })
//       return
//     }

//     onSearch(Number(selectedAccountCode), fromDate, toDate, companyId)
//   }

//   return (
//     <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card">
//       <div className="flex items-center gap-4 p-4">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium">From Date:</span>
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium">To Date:</span>
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           />
//         </div>

//         <CustomComboboxWithApi
//           items={partners.map((partner) => ({
//             id: partner.id.toString(),
//             name: partner.name || '',
//           }))}
//           value={selectedPartner}
//           onChange={(item) => {
//             if (item) {
//               setSelectedPartner(item) // update partner object for combobox display
//               setSelectedAccountCode(item.id) // update ID for report
//             } else {
//               setSelectedPartner(null)
//               setSelectedAccountCode('')
//             }
//           }}
//           placeholder="Select partner"
//           searchFunction={searchPartners}
//           fetchByIdFunction={async (id) => {
//             const numericId: number =
//               typeof id === 'string' && /^\d+$/.test(id)
//                 ? parseInt(id, 10)
//                 : (id as number)
//             const partner = await getPartnerById(numericId, token)
//             if (partner?.data) {
//               const selected = {
//                 id: partner.data.id.toString(),
//                 name: partner.data.name ?? '',
//               }
//               setSelectedPartner(selected)
//               setSelectedAccountCode(selected.id)
//               return selected
//             }
//             return null
//           }}
//         />

//         <Button onClick={handleSearch}>Show</Button>
//       </div>
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={generatePdf}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
//         >
//           <FileText className="h-4 w-4" />
//           <span className="font-medium">PDF</span>
//         </Button>
//         <Button
//           onClick={generateExcel}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
//         >
//           <FileText className="h-4 w-4" />
//           <span className="font-medium">Excel</span>
//         </Button>
//       </div>
//     </div>
//   )
// }


'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { ResPartner, Company } from '@/utils/type'
import { FileText } from 'lucide-react'
import {
  getPartnerById,
  getResPartnersBySearch,
  getAllCompanies,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { CustomCombobox } from '@/utils/custom-combobox'

interface PartnerLedgerFindProps {
  onSearch: (
    partnercode: number,
    fromdate: string,
    todate: string,
    companyId: number
  ) => void
  generatePdf: () => void
  generateExcel: () => void
}

export default function PartneredgerFind({
  onSearch,
  generatePdf,
  generateExcel,
}: PartnerLedgerFindProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [selectedAccountCode, setSelectedAccountCode] = useState<
    string | number
  >('')
  const [selectedCompany, setSelectedCompany] = useState<ComboboxItem | null>(
    null
  )
  const [partners, setPartners] = useState<ResPartner[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState<ComboboxItem | null>(
    null
  )

  // fetch partners
  const fetchgetResPartner = useCallback(async () => {
    if (!token) return
    setIsLoadingPartners(true)
    try {
      const response = await getResPartnersBySearch('', token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      setPartners(response.data || [])
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load partners' })
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }, [token, router])

  // fetch companies
  const fetchCompanies = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      setCompanies(response.data || [])
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load companies' })
      setCompanies([])
    }
  }, [token])

  useEffect(() => {
    fetchgetResPartner()
    fetchCompanies()
  }, [fetchgetResPartner, fetchCompanies])

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (!response.data) return []
      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch {
      return []
    }
  }

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
        description: 'To Date must be after From Date',
      })
      return
    }

    if (!selectedAccountCode || !selectedCompany) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a partner and company',
      })
      return
    }

    onSearch(
      Number(selectedAccountCode),
      fromDate,
      toDate,
      Number(selectedCompany.id)
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4 flex-wrap">
        {/* From Date */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* To Date */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* Partner Combobox */}
        <CustomComboboxWithApi
          items={partners.map((partner) => ({
            id: partner.id.toString(),
            name: partner.name || 'Unnamed Partner',
          }))}
          value={selectedPartner}
          onChange={(item) => {
            if (item) {
              setSelectedPartner(item)
              setSelectedAccountCode(item.id)
            } else {
              setSelectedPartner(null)
              setSelectedAccountCode('')
            }
          }}
          placeholder="Select Partner"
          searchFunction={searchPartners}
        />

        {/* Company Combobox */}
        <CustomCombobox
          items={companies.map((c) => ({
            id: (c.companyId ?? c.id).toString(), // safe fallback
            name: c.companyName || 'Unnamed Company',
          }))}
          value={selectedCompany}
          onChange={(item) => setSelectedCompany(item)}
          placeholder="Select Company"
        />

        {/* Show Button */}
        <Button onClick={handleSearch}>Show</Button>
      </div>

      {/* PDF & Excel Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          PDF
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <FileText className="h-4 w-4" />
          Excel
        </Button>
      </div>
    </div>
  )
}

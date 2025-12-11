'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { ResPartner, Company } from '@/utils/type'
import { FileText, Printer } from 'lucide-react'
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
import { CompanyType } from '@/api/company-api'

interface PartnerLedgerFindProps {
  onSearch: (
    partnercode: number,
    fromdate: string,
    todate: string,
    companyId: number,
    companyName?: string,
    partnerName?: string
  ) => void
  generatePdf: () => void
  generateExcel: () => void
  onPrint: () => void
  isGeneratingPdf?: boolean
}

export default function PartneredgerFind({
  onSearch,
  generatePdf,
  generateExcel,
  onPrint,
  isGeneratingPdf,
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
  const [companies, setCompanies] = useState<CompanyType[]>([])
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

    // Pass company name and partner name to parent
    onSearch(
      Number(selectedAccountCode),
      fromDate,
      toDate,
      Number(selectedCompany.id),
      selectedCompany.name,
      selectedPartner?.name
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
            id: (c.companyId ?? 0).toString(),
            name: c.companyName || 'Unnamed Company',
          }))}
          value={selectedCompany}
          onChange={(item) => setSelectedCompany(item)}
          placeholder="Select Company"
        />

        {/* Show Button */}
        <Button onClick={handleSearch}>Show</Button>
      </div>

      {/* PDF, Excel & Print Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          disabled={isGeneratingPdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          {isGeneratingPdf ? 'Generating...' : 'PDF'}
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
        <Button
          onClick={onPrint}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-900 hover:bg-blue-200"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  )
}

// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { toast } from '@/hooks/use-toast'
// import type { ResPartner, Company } from '@/utils/type'
// import { FileText } from 'lucide-react'
// import {
//   getPartnerById,
//   getResPartnersBySearch,
//   getAllCompanies,
// } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import {
//   type ComboboxItem,
//   CustomComboboxWithApi,
// } from '@/utils/custom-combobox-with-api'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { CompanyType } from '@/api/company-api'

// interface PartnerLedgerFindProps {
//   onSearch: (
//     partnercode: number,
//     fromdate: string,
//     todate: string,
//     companyId: number
//   ) => void
//   generatePdf: () => void
//   generateExcel: () => void
// }

// export default function PartneredgerFind({
//   onSearch,
//   generatePdf,
//   generateExcel,
// }: PartnerLedgerFindProps) {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [fromDate, setFromDate] = useState<string>('')
//   const [toDate, setToDate] = useState<string>('')
//   const [selectedAccountCode, setSelectedAccountCode] = useState<
//     string | number
//   >('')
//   const [selectedCompany, setSelectedCompany] = useState<ComboboxItem | null>(
//     null
//   )
//   const [partners, setPartners] = useState<ResPartner[]>([])
//   const [companies, setCompanies] = useState<CompanyType[]>([])
//   const [isLoadingPartners, setIsLoadingPartners] = useState(true)
//   const [selectedPartner, setSelectedPartner] = useState<ComboboxItem | null>(
//     null
//   )

//   // fetch partners
//   const fetchgetResPartner = useCallback(async () => {
//     if (!token) return
//     setIsLoadingPartners(true)
//     try {
//       const response = await getResPartnersBySearch('', token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       }
//       setPartners(response.data || [])
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to load partners' })
//       setPartners([])
//     } finally {
//       setIsLoadingPartners(false)
//     }
//   }, [token, router])

//   // fetch companies
//   const fetchCompanies = useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getAllCompanies(token)
//       setCompanies(response.data || [])
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to load companies' })
//       setCompanies([])
//     }
//   }, [token])

//   useEffect(() => {
//     fetchgetResPartner()
//     fetchCompanies()
//   }, [fetchgetResPartner, fetchCompanies])

//   const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
//     try {
//       const response = await getResPartnersBySearch(query, token)
//       if (!response.data) return []
//       return response.data.map((partner) => ({
//         id: partner.id.toString(),
//         name: partner.name || 'Unnamed Partner',
//       }))
//     } catch {
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
//         description: 'To Date must be after From Date',
//       })
//       return
//     }

//     if (!selectedAccountCode || !selectedCompany) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Please select a partner and company',
//       })
//       return
//     }

//     onSearch(
//       Number(selectedAccountCode),
//       fromDate,
//       toDate,
//       Number(selectedCompany.id)
//     )
//   }

//   return (
//     <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
//       <div className="flex items-center gap-4 flex-wrap">
//         {/* From Date */}
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium">From Date:</span>
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           />
//         </div>

//         {/* To Date */}
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium">To Date:</span>
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           />
//         </div>

//         {/* Partner Combobox */}
//         <CustomComboboxWithApi
//           items={partners.map((partner) => ({
//             id: partner.id.toString(),
//             name: partner.name || 'Unnamed Partner',
//           }))}
//           value={selectedPartner}
//           onChange={(item) => {
//             if (item) {
//               setSelectedPartner(item)
//               setSelectedAccountCode(item.id)
//             } else {
//               setSelectedPartner(null)
//               setSelectedAccountCode('')
//             }
//           }}
//           placeholder="Select Partner"
//           searchFunction={searchPartners}
//         />

//         {/* Company Combobox */}
//         <CustomCombobox
//           items={companies.map((c) => ({
//             id: (c.companyId ?? 0).toString(), // safe fallback
//             name: c.companyName || 'Unnamed Company',
//           }))}
//           value={selectedCompany}
//           onChange={(item) => setSelectedCompany(item)}
//           placeholder="Select Company"
//         />

//         {/* Show Button */}
//         <Button onClick={handleSearch}>Show</Button>
//       </div>

//       {/* PDF & Excel Buttons */}
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={generatePdf}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
//         >
//           <FileText className="h-4 w-4" />
//           PDF
//         </Button>
//         <Button
//           onClick={generateExcel}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
//         >
//           <FileText className="h-4 w-4" />
//           Excel
//         </Button>
//       </div>
//     </div>
//   )
// }

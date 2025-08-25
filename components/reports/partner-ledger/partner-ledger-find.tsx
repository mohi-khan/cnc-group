'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { ResPartner } from '@/utils/type'
import { FileText } from 'lucide-react'
import { getResPartnersBySearch } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'

interface PartnerLedgerFindProps {
  onSearch: (partnercode: number, fromdate: string, todate: string) => void
  generatePdf: () => void
  generateExcel: () => void
}

export default function PartneredgerFind({
  onSearch,
  generatePdf,
  generateExcel,
}: PartnerLedgerFindProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('')
  const [partners, setPartners] = useState<ResPartner[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)

  // const fetchAllResPartners = useCallback(async () => {
  //   if (!token) return
  //   const fetchedPartners = await getAllResPartners(token)
  //   if (fetchedPartners.error || !fetchedPartners.data) {
  //     console.error('Error getting chart of accounts:', fetchedPartners.error)
  //     toast({
  //       title: 'Error',
  //       description:
  //         fetchedPartners.error?.message || 'Failed to get chart of accounts',
  //     })
  //   } else {
  //     setPartners(fetchedPartners.data)
  //   }
  // }, [token])
  // useEffect(() => {
  //   fetchAllResPartners()
  // }, [fetchAllResPartners])

  const fetchgetResPartner = useCallback(async () => {
    const search = ''
    setIsLoadingPartners(true)
    if (!token) return
    try {
      const response = await getResPartnersBySearch(search, token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')

        return
      } else if (response.error || !response.data) {
        console.error('Error getting partners:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load partners',
        })
        setPartners([])
        return
      } else {
        setPartners(response.data)
      }
    } catch (error) {
      console.error('Error getting partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load partners',
      })
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }, [token, router, setPartners])

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
    fetchgetResPartner()
  }, [fetchgetResPartner, router])

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) {
        console.error('Error fetching partners:', response.error)
        return []
      }

      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch (error) {
      console.error('Error fetching partners:', error)
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

    onSearch(Number(selectedAccountCode), fromDate, toDate)
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4 p-4">
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
        {/* <Select
          value={selectedAccountCode}
          onValueChange={setSelectedAccountCode}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select partner" />
          </SelectTrigger>
          <SelectContent>
            {partners.length > 0 ? (
              partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id?.toString()}>
                  {partner.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="default" disabled>
                No partners available
              </SelectItem>
            )}
          </SelectContent>
        </Select> */}
        <CustomComboboxWithApi
          items={partners.map((partner) => ({
            id: partner.id.toString(),
            name: partner.name || 'Unnamed Partner',
          }))}
          value={
            selectedAccountCode
              ? {
                  id: selectedAccountCode,
                  name:
                    partners.find(
                      (p) => p.id.toString() === selectedAccountCode
                    )?.name || '',
                }
              : null
          }
          onChange={(value) =>
            setSelectedAccountCode(value ? value.id.toString() : '')
          }
          searchFunction={searchPartners}
        />

        <Button onClick={handleSearch}>Show</Button>
      </div>
      <div className="flex items-center gap-2">
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
          <FileText className="h-4 w-4" />
          <span className="font-medium">Excel</span>
        </Button>
      </div>
    </div>
  )
}

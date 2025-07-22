'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResPartner } from '@/utils/type'
import { FileText } from 'lucide-react'
import {
  getAllResPartners,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  ComboboxItem,
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
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 17H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">Excel</span>
        </Button>
      </div>
    </div>
  )
}

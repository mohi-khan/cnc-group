'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SingleTrialBalanceFind from './single-trial-balance-find'
import SingleTrialBalanceList from './single-trial-balance-list'
import type { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { usePDF } from 'react-to-pdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { toast } from '@/hooks/use-toast'

function formatDateString(dateStr: string) {
  try {
    const decodedStr = decodeURIComponent(dateStr).replace(/\+/g, ' ')
    let date = new Date(decodedStr)

    if (isNaN(date.getTime())) {
      const parts = decodedStr.split(' ')
      if (parts.length >= 4) {
        date = new Date(`${parts[1]} ${parts[2]} ${parts[3]}`)
      }
    }

    if (isNaN(date.getTime())) {
      const [month, day, year] = decodedStr.split('/')
      date = new Date(Number(year), Number(month) - 1, Number(day))
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }
}

export default function SingleTrialBalance() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const { toPDF, targetRef } = usePDF({ filename: 'single_trial_balance.pdf' })
  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])

  const { id } = useParams()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  const startDate = searchParams?.get('startDate') || ''
  const endDate = searchParams?.get('endDate') || ''
  const companyId = searchParams?.get('companyId') || ''
  const locationId = searchParams?.get('locationId') || ''

  const formattedStartDate = formatDateString(startDate)
  const formattedEndDate = formatDateString(endDate)

  const flattenData = (data: GeneralLedgerType[]) => {
    return data.map((item) => ({
      VoucherID: item.voucherid,
      VoucherNo: item.voucherno,
      AccountName: item.accountname,
      Debit: item.debit,
      Credit: item.credit,
      Notes: item.notes,
      Partner: item.partner,
      CostCenter: item.coscenter,
      Department: item.department,
    }))
  }

  const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Single Trial Balance')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const generatePdf = () => toPDF()
  const generateExcel = () =>
    exportToExcel(transactions, 'single-trial-balance')

  const handleSearch = useCallback(
    async (
      accountcode: number,
      fromdate: string,
      todate: string,
      locationId: number,
      companyId: number
    ) => {
      if (!token) return

      const response = await getGeneralLedgerByDate({
        accountcode,
        fromdate,
        todate,
        companyId,
        locationId,
        token,
      })

      if (response.error) {
        toast({
          title: 'Alert',
          description: `transactions have No data`,
          variant: 'destructive',
        })
        setTransactions([]) // ✅ Clear previous data on error
      } else {
        setTransactions(response.data || [])
        console.log('ledger data:', response.data || [])
      }
    },
    [token]
  )

  useEffect(() => {
    if (
      id &&
      formattedStartDate &&
      formattedEndDate &&
      companyId &&
      locationId
    ) {
      handleSearch(
        Number(id),
        formattedStartDate,
        formattedEndDate,
        Number(locationId),
        Number(companyId)
      )
    }
  }, [
    id,
    formattedStartDate,
    formattedEndDate,
    companyId,
    locationId,
    handleSearch,
  ])

  return (
    <div className="space-y-4 container mx-auto mt-20">
      <SingleTrialBalanceFind
        initialAccountCode={id ? String(id) : ''}
        initialFromDate={formattedStartDate}
        initialToDate={formattedEndDate}
        initialCompanyId={companyId ? Number(companyId) : undefined}
        initialLocationId={locationId ? Number(locationId) : undefined}
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      <SingleTrialBalanceList
        transactions={transactions}
        targetRef={targetRef}
      />
    </div>
  )
}


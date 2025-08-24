'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SingleTrialBalanceFind from './single-trial-balance-find'
import SingleTrialBalanceList from './single-trial-balance-list'
import type { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { toast } from '@/hooks/use-toast'
import { getAllCompanies } from '@/api/common-shared-api'

interface Company {
  id: number
  name: string
}

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
  const targetRef = useRef<HTMLDivElement>(null)
  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

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

  const fetchCompanies = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      const apiData = response.data || []
      const mappedCompanies = apiData.map((company: any) => ({
        id: company.companyId || company.id,
        name: company.companyName || company.name,
      }))
      setCompanies(mappedCompanies)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }, [token])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

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

  const generatePdf = async () => {
    if (!targetRef.current) return

    setShowLogoInPdf(true)
    await new Promise((res) => setTimeout(res, 200))

    const canvas = await html2canvas(targetRef.current, {
      scale: 2,
      useCORS: true,
    })

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const marginTop = 70
    const marginBottom = 40
    const horizontalPadding = 30
    const usablePageHeight = pageHeight - marginTop - marginBottom

    const imgWidth = pageWidth - horizontalPadding * 2
    const scale = imgWidth / canvas.width

    let heightLeftPx = canvas.height
    let sourceY = 0
    let pageCount = 0

    // Grab table header from DOM
    const tableHeaderEl = targetRef.current.querySelector('.pdf-table-header')

    let headerCanvas: HTMLCanvasElement | null = null
    let headerHeightPx = 0

    if (tableHeaderEl) {
      headerCanvas = await html2canvas(tableHeaderEl as HTMLElement, {
        scale: 2,
        useCORS: true,
      })
      headerHeightPx = headerCanvas.height
    }

    while (heightLeftPx > 0) {
      const sliceHeightPx = Math.min(heightLeftPx, usablePageHeight / scale)

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      tempCanvas.width = canvas.width
      tempCanvas.height = sliceHeightPx

      tempCtx?.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      )

      const imgDataSlice = tempCanvas.toDataURL('image/jpeg')

      if (pageCount > 0) {
        pdf.addPage()
      }

      // If this is not the first page, draw header first
      let yOffset = marginTop
      if (pageCount > 0 && headerCanvas) {
        const headerImgData = headerCanvas.toDataURL('image/jpeg')
        const headerHeightPt = headerCanvas.height * scale
        pdf.addImage(
          headerImgData,
          'JPEG',
          horizontalPadding,
          marginTop,
          imgWidth,
          headerHeightPt
        )
        yOffset += headerHeightPt // shift table down after header
      }

      // Draw the slice
      pdf.addImage(
        imgDataSlice,
        'JPEG',
        horizontalPadding,
        yOffset,
        imgWidth,
        sliceHeightPx * scale
      )

      heightLeftPx -= sliceHeightPx
      sourceY += sliceHeightPx
      pageCount++
    }

    const leftTextMargin = horizontalPadding
    const totalPages = pdf.internal.pages.length - 1

    const today = new Date()
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
    const monthName = today.toLocaleDateString('en-US', { month: 'long' })
    const day = today.getDate()
    const year = today.getFullYear()

    const selectedCompany = companies.find((c) => c.id === Number(companyId))
    const companyName = selectedCompany?.name || 'Company Name'

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text(companyName, leftTextMargin, 35)

      pdf.setFontSize(10)
      const baseText = 'Single Trial Balance Report ( Date : '
      pdf.setFont('bold')
      pdf.text(baseText, leftTextMargin, 50)
      let currentX = leftTextMargin + pdf.getTextWidth(baseText)
      pdf.text(dayName, currentX, 50)
      currentX += pdf.getTextWidth(dayName)
      pdf.text(', ', currentX, 50)
      currentX += pdf.getTextWidth(', ')
      pdf.text(monthName, currentX, 50)
      currentX += pdf.getTextWidth(monthName)
      pdf.text(` ${day}, ${year} )`, currentX, 50)

      pdf.setFontSize(10)
      pdf.setFont('normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - horizontalPadding - 50,
        pageHeight - marginBottom + 20
      )
    }

    pdf.save(`single_trial_balance.pdf`)
    setShowLogoInPdf(false)
  }

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
        showLogoInPdf={showLogoInPdf}
      />
    </div>
  )
}

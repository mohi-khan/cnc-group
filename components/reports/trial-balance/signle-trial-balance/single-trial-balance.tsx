'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SingleTrialBalanceFind from './single-trial-balance-find'
import SingleTrialBalanceList from './single-trial-balance-list'
import type { AccountsHead, GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { toast } from '@/hooks/use-toast'
import { getAllChartOfAccounts, getAllCompanies } from '@/api/common-shared-api'

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
  const [accounts, setAccounts] = useState<AccountsHead[]>([])

  // 🟢 Store latest selected filter values
  const [filters, setFilters] = useState({
    accountcode: 0,
    fromdate: '',
    todate: '',
    companyId: 0,
    locationId: 0,
  })

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
  const accountId = id ? String(id) : ''

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

  const fetchChartOfAccounts = React.useCallback(async () => {
      if (!token) return
      const fetchedAccounts = await getAllChartOfAccounts(token)
      if (fetchedAccounts.error || !fetchedAccounts.data) {
        console.error('Error getting chart of accounts:', fetchedAccounts.error)
        toast({
          title: 'Error',
          description:
            fetchedAccounts.error?.message || 'Failed to get chart of accounts',
        })
      } else {
        setAccounts(fetchedAccounts.data)
      }
    }, [token])

  useEffect(() => {
    fetchCompanies()
    fetchChartOfAccounts()
  }, [fetchCompanies, fetchChartOfAccounts])

  const flattenData = (data: GeneralLedgerType[]) => {
    return data.map((item) => ({
      VoucherNo: item.voucherno,
      Date: item.date,
      AccountName: item.accountname,
      Notes: item.notes,
      Partner: item.partner,
      CostCenter: item.coscenter,
      Department: item.department,
      Debit: item.debit != null ? Number(item.debit).toFixed(2) : '',
      Credit: item.credit != null ? Number(item.credit).toFixed(2) : '',
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
    document.body.classList.add('pdf-mode')
    setShowLogoInPdf(true)
    await new Promise((res) => setTimeout(res, 200))

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const marginTop = 110
    const marginBottom = 40
    const horizontalPadding = 30
    const usablePageHeight = pageHeight - marginTop - marginBottom

    // 🟢 Find the table and process it in batches
    const table = targetRef.current.querySelector('table')
    if (!table) {
      console.error('Table not found')
      return
    }

    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')

    if (!thead || !tbody) {
      console.error('Table structure incomplete')
      return
    }

    // Capture header once
    const headerCanvas = await html2canvas(thead, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const rows = Array.from(tbody.querySelectorAll('tr'))
    const imgWidth = pageWidth - horizontalPadding * 2
    const headerScale = imgWidth / headerCanvas.width
    const headerHeight = headerCanvas.height * headerScale
    const headerImg = headerCanvas.toDataURL('image/jpeg', 0.95)

    let currentY = marginTop
    let isFirstPage = true

    // 🟢 Process rows in batches of 5 for speed
    const batchSize = 19

    for (let i = 0; i < rows.length; i += batchSize) {
      const batchRows = rows.slice(i, Math.min(i + batchSize, rows.length))

      // Create temporary container for batch
      const batchContainer = document.createElement('div')
      batchContainer.style.width = tbody.offsetWidth + 'px'

      const batchTable = document.createElement('table')
      batchTable.style.width = '100%'
      batchTable.style.borderCollapse = 'collapse'

      const batchTbody = document.createElement('tbody')
      batchRows.forEach((row) => {
        batchTbody.appendChild(row.cloneNode(true))
      })

      batchTable.appendChild(batchTbody)
      batchContainer.appendChild(batchTable)
      document.body.appendChild(batchContainer)

      // Capture batch
      const batchCanvas = await html2canvas(batchContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      document.body.removeChild(batchContainer)

      const batchScale = imgWidth / batchCanvas.width
      const batchHeight = batchCanvas.height * batchScale

      // Check if batch fits on current page
      if (!isFirstPage && currentY + batchHeight > pageHeight - marginBottom) {
        // Add new page
        pdf.addPage()
        currentY = marginTop

        // Add header to new page
        pdf.addImage(
          headerImg,
          'JPEG',
          horizontalPadding,
          currentY,
          imgWidth,
          headerHeight
        )
        currentY += headerHeight
      } else if (isFirstPage) {
        // First page - add header
        pdf.addImage(
          headerImg,
          'JPEG',
          horizontalPadding,
          currentY,
          imgWidth,
          headerHeight
        )
        currentY += headerHeight
        isFirstPage = false
      }

      // Add batch to current page
      const batchImg = batchCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(
        batchImg,
        'JPEG',
        horizontalPadding,
        currentY,
        imgWidth,
        batchHeight
      )
      currentY += batchHeight
    }

    const tfoot = table.querySelector('tfoot')
  if (tfoot) {
    const tfootCanvas = await html2canvas(tfoot, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const tfootScale = imgWidth / tfootCanvas.width
    const tfootHeight = tfootCanvas.height * tfootScale

    if (currentY + tfootHeight > pageHeight - marginBottom) {
      pdf.addPage()
      currentY = marginTop
      pdf.addImage(headerImg, 'JPEG', horizontalPadding, currentY, imgWidth, headerHeight)
      currentY += headerHeight
    }

    const tfootImg = tfootCanvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(tfootImg, 'JPEG', horizontalPadding, currentY, imgWidth, tfootHeight)
  }

    const totalPages = pdf.internal.pages.length - 1
    const selectedCompany = companies.find(
      (c) => c.id === Number(filters.companyId)
    )
    const companyName = selectedCompany?.name || 'Company Name'

    const selectedAccount = accounts.find(
      (a) => a.accountId === Number(filters.accountcode)
    )
    const accountName = selectedAccount?.name || 'Account'

    const dateRange =
      filters.fromdate && filters.todate
        ? `From ${filters.fromdate} To ${filters.todate}`
        : ''

    // Add headers and footers
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)

      pdf.setFontSize(16).setFont('helvetica', 'bold')
      pdf.text(companyName, pageWidth / 2, 30, { align: 'center' })

      pdf.setFontSize(12).setFont('helvetica', 'normal')
      pdf.text('Account Name: ' + accountName, pageWidth / 2, 50, {
        align: 'center',
      })

      if (dateRange) {
        pdf.setFontSize(10).setFont('helvetica', 'normal')
        pdf.text(dateRange, pageWidth / 2, 70, { align: 'center' })
      }

      pdf.setFontSize(10).setFont('helvetica', 'normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - horizontalPadding - 50,
        pageHeight - marginBottom + 20
      )
    }

    pdf.save(`single_trial_balance.pdf`)
    document.body.classList.remove('pdf-mode')
    setShowLogoInPdf(false)
  }

  

  


  const generateExcel = () =>
    exportToExcel(transactions, 'single-trial-balance')

  const handlePrint = () => {
    const selectedCompany = companies.find(
      (c) => c.id === Number(filters.companyId)
    )
    const companyName = selectedCompany?.name || 'Company Name'
     const selectedAccount = accounts.find(
       (a) => a.accountId === Number(filters.accountcode)
     )
     const accountName = selectedAccount?.name || 'Account'

    const dateRange =
      filters.fromdate && filters.todate
        ? `From ${filters.fromdate} To ${filters.todate}`
        : ''

    const printContents = `
      <div style="text-align:center;margin-bottom:18px;">
        <h2>${companyName}</h2>
        <h3>Account Name: ${accountName}</h3>
        <div>${dateRange}</div>
      </div>
      ${targetRef.current?.innerHTML || ''}
      <style>
        @media print {
          .sort-icons, .lucide-arrow-up, .lucide-arrow-down, svg { display: none !important; }
          table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        }
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #000; padding:4px; text-align:left; }
      </style>
    `

    const newWin = window.open('', '', 'width=900,height=700')
    if (!newWin) return
    newWin.document.write(
      `<html><head><title>Print</title></head><body>${printContents}</body></html>`
    )
    newWin.document.close()
    newWin.focus()
    newWin.print()
    newWin.close()
  }

  const handleSearch = useCallback(
    async (
      accountcode: number,
      fromdate: string,
      todate: string,
      locationId: number,
      companyId: number
    ) => {
      if (!token) return
      setFilters({ accountcode, fromdate, todate, locationId, companyId }) // 🟢 Save latest filters
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
        setTransactions([])
      } else {
        setTransactions(response.data || [])
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
        initialAccountCode={accountId}
        initialFromDate={formattedStartDate}
        initialToDate={formattedEndDate}
        initialCompanyId={companyId ? Number(companyId) : undefined}
        initialLocationId={locationId ? Number(locationId) : undefined}
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        generatePrint={handlePrint}
      />
      <SingleTrialBalanceList
        transactions={transactions}
        targetRef={targetRef}
        showLogoInPdf={showLogoInPdf}
      />
    </div>
  )
}



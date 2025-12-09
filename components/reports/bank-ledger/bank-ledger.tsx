'use client'

import { useState, useCallback, useRef } from 'react'
import BankLedgerFind from './bank-ledger-find'
import BankLedgerList from './bank-ledger-list'
import type { GetBankLedger } from '@/utils/type'
import { getBankAccountsByDate } from '@/api/bank-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { date } from 'zod'

export default function BankLedger() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [transactions, setTransactions] = useState<GetBankLedger[]>([])
  const [previousData, setPreviousData] = useState<GetBankLedger[]>([]) // store last good data
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const printRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback(
    async (
      bankaccount: number,
      fromdate: string,
      todate: string,
      companyName?: string
    ) => {
      if (!token) return

      try {
        const response = await getBankAccountsByDate(
          { bankaccount, fromdate, todate },
          token
        )

        console.log('🔍 API Response:', response.data || [])

        // store search info for PDF header
        setSelectedCompanyName(companyName || '')
        setFromDate(fromdate)
        setToDate(todate)

        // Always update transactions — even if empty
        setTransactions(response.data || [])
        // Optional: update previousData only if there’s actual data
        if (response.data && response.data.length > 0) {
          setPreviousData(response.data)
        }
      } catch (err) {
        console.error('❌ Fetch failed:', err)
        // optionally clear table on error
        setTransactions([])
      }
    },
    [token]
  )



  const generatePdf = async () => {
    if (!printRef.current) return
    setIsGeneratingPdf(true)

    try {
      const companyName = selectedCompanyName || 'Bank Ledger Report'
      
      const dateRange =
        fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Dates'

      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginTop = 80
      const marginBottom = 40
      const horizontalPadding = 30
      const usablePageHeight = pageHeight - marginTop - marginBottom

      // Find the table and process it in batches
      const table = printRef.current.querySelector('table')
      if (!table) {
        console.error('Table not found')
        setIsGeneratingPdf(false)
        return
      }

      const thead = table.querySelector('thead')
      const tbody = table.querySelector('tbody')

      if (!thead || !tbody) {
        console.error('Table structure incomplete')
        setIsGeneratingPdf(false)
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

      // Process rows in batches for better performance
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
        if (
          !isFirstPage &&
          currentY + batchHeight > pageHeight - marginBottom
        ) {
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

      const totalPages = pdf.internal.pages.length - 1

      // Add headers and footers to all pages
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)

        // Company name header
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pageWidth / 2, 30, { align: 'center' })

        // Date range
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Date Range: ${dateRange}`, pageWidth / 2, 50, {
          align: 'center',
        })

        // Page number footer
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - horizontalPadding - 50,
          pageHeight - marginBottom + 20
        )
      }

      pdf.save(`${companyName}-ledger-report.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  

  const exportToExcel = () => {
    if (transactions.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((transaction, index) => ({
        'S.No': index + 1,
        date: transaction.date,
        'Voucher No': transaction.voucherno,
        'Account Name': transaction.accountname,
        Debit: transaction.debit,
        Credit: transaction.credit,
        Partner: transaction.partner ?? '',
        Notes: transaction.notes ?? '',
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Ledger')
    XLSX.writeFile(
      workbook,
      `${selectedCompanyName || 'Bank'}-ledger-report.xlsx`
    )
  }

  return (
    <div className="space-y-4 max-w-[98%] mx-auto mt-20">
      <BankLedgerFind
        onSearch={handleSearch}
        onGeneratePdf={generatePdf}
        onExportExcel={exportToExcel}
        isGeneratingPdf={isGeneratingPdf}
      />
      <div ref={printRef}>
        <BankLedgerList transactions={transactions} />
      </div>
    </div>
  )
}

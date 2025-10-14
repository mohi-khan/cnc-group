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

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const scale = pdfWidth / imgWidth
      const scaledHeight = imgHeight * scale

      const headerHeight = 25
      const pageContentHeight = pdfHeight - headerHeight - 10
      let currentY = 0
      let pageNumber = 1

      while (currentY < scaledHeight) {
        if (pageNumber > 1) pdf.addPage()

        // Header section
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pdfWidth / 2, 12, { align: 'center' })
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Date Range: ${dateRange}`, pdfWidth / 2, 20, {
          align: 'center',
        })

        // Table image
        const remainingHeight = scaledHeight - currentY
        const pageHeight = Math.min(pageContentHeight, remainingHeight)
        pdf.addImage(imgData, 'JPEG', 0, headerHeight, pdfWidth, pageHeight)

        currentY += pageContentHeight
        pageNumber++
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
        'Voucher No': transaction.voucherno,
        'Account Name': transaction.accountname,
        Debit: transaction.debit,
        Credit: transaction.credit,
        Notes: transaction.notes ?? '',
        Partner: transaction.partner ?? '',
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

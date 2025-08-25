'use client'

import { useState, useCallback, useRef } from 'react'
import BankLedgerFind from './bank-ledger-find'
import BankLedgerList from './bank-ledger-list'
import type { BankAccountDateRange } from '@/utils/type'
import { getBankAccountsByDate } from '@/api/bank-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

export default function BankLedger() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  const [transactions, setTransactions] = useState<BankAccountDateRange[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback(
    async (bankaccount: number, fromdate: string, todate: string) => {
      if (!token) return
      const response = await getBankAccountsByDate(
        {
          bankaccount,
          fromdate,
          todate,
        },
        token
      )
      console.log(`🚀 ~ BankLedger ~ params`, {
        bankaccount,
        fromdate,
        todate,
      })

      if (response.error) {
        console.log('Error fetching transactions:', response.error)
        // You might want to show an error message to the user here
      } else {
        setTransactions(response.data || [])
      }
    },
    [token]
  )

  const generatePdf = async () => {
    if (!printRef.current) return

    setIsGeneratingPdf(true)

    try {
      const companyName = 'Bank Ledger Report'

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

      // Calculate scaling to fit width while maintaining aspect ratio
      const scale = pdfWidth / imgWidth
      const scaledHeight = imgHeight * scale

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

      let currentY = 0
      let pageNumber = 1

      while (currentY < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
        }

        // Add header
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

        // Calculate the portion of image to include on this page
        const remainingHeight = scaledHeight - currentY
        const pageHeight = Math.min(pageContentHeight, remainingHeight)

        // Add the image portion to PDF
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          headerHeight,
          pdfWidth,
          pageHeight
        )

        currentY += pageContentHeight
        pageNumber++
      }

      pdf.save('bank-ledger-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const exportToExcel = () => {
    if (transactions.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((transaction, index) => ({
        'S.No': index + 1,
        'Bank Account': transaction.bankaccount,
        'From Date': transaction.fromdate,
        'To Date': transaction.todate,
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Ledger')
    XLSX.writeFile(workbook, 'bank-ledger-report.xlsx')
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

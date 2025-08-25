'use client'

import { useCallback, useState } from 'react'
import GeneralLedgerFind from './general-ledger-find'
import GeneralLedgerList from './general-ledger-list'
import type { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllCompanies } from '@/api/common-shared-api'
import type { CompanyFromLocalstorage } from '@/utils/type'

export default function GeneralLedger() {
  // Initialize user data from Jotai
  useInitializeUser()
  const [userData, _] = useAtom(userDataAtom) // ignore setter if not needed
  const [token] = useAtom(tokenAtom)

  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Flatten data for Excel export
  const flattenData = (data: GeneralLedgerType[]) =>
    data.map((item) => ({
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

  const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'General Ledger')
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
    if (!userData?.companyId || !token) return

    setIsGeneratingPdf(true)

    try {
      // Get company name
      const companiesResponse = await getAllCompanies(token)
      const companies: CompanyFromLocalstorage[] = (companiesResponse.data || []).map((c: any) => ({
        companyId: c.companyId,
        company: {
          companyId: c.companyId,
          companyName: c.companyName,
        },
      }))
      const selectedCompany = companies.find(
        (c) => c.companyId === userData.companyId
      )
      const companyName = selectedCompany?.company.companyName || 'Company'

      const element = document.getElementById('pdf-content')
      if (!element) return

      // Set PDF-friendly styles
      element.setAttribute('data-generating-pdf', 'true')

      const canvas = await html2canvas(element, {
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

      // Calculate dimensions to fit page width while maintaining aspect ratio
      const ratio = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * ratio

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

      let sourceY = 0
      let pageNumber = 1

      while (sourceY < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
        }

        // Add company name header
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('General Ledger Report', pdfWidth / 2, 25, { align: 'center' })

        // Calculate the portion of image for this page
        const remainingHeight = scaledHeight - sourceY
        const currentPageHeight = Math.min(pageContentHeight, remainingHeight)

        // Add image portion to PDF
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          headerHeight,
          pdfWidth,
          currentPageHeight,
          undefined,
          'FAST',
          0
        )

        sourceY += currentPageHeight
        pageNumber++
      }

      pdf.save('general_ledger.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      // Remove PDF-friendly styles
      const element = document.getElementById('pdf-content')
      if (element) {
        element.removeAttribute('data-generating-pdf')
      }
      setIsGeneratingPdf(false)
    }
  }

  const generateExcel = () => exportToExcel(transactions, 'general_ledger')

  const handleSearch = useCallback(
    async (accountcode: number, fromdate: string, todate: string) => {
      if (!token || !userData) return

      // Extract companyId and locationId from userData
      const { companyId, locationId } = userData

      const response = await getGeneralLedgerByDate({
        accountcode,
        fromdate,
        todate,
        token,
        companyId,
        locationId,
      })

      setTransactions(response.data || [])
    },
    [token, userData]
  )

  return (
    <div className="space-y-4 max-w-[98%] mx-auto mt-20">
      <GeneralLedgerFind
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        isGeneratingPdf={isGeneratingPdf}
      />
      <div id="pdf-content">
        <GeneralLedgerList transactions={transactions} />
      </div>
    </div>
  )
}

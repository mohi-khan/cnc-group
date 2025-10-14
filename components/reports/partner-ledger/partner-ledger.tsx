'use client'

import { useCallback, useState, useRef } from 'react'
import type { PartnerLedgerType } from '@/utils/type'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PartneredgerFind from './partner-ledger-find'
import PartnerLedgerList from './partner-ledger-list'
import { getPartnerLedgerByDate } from '@/api/partner-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function PartnerLedger() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [transactions, setTransactions] = useState<PartnerLedgerType[]>([])

  const flattenData = (data: PartnerLedgerType[]) => {
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

  const exportToExcel = (data: PartnerLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partner Ledger')
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

    try {
      const element = targetRef.current
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

      // Calculate scaling to fit width while maintaining aspect ratio
      const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * scale

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

      // Add header with title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Partner Ledger Report', pdfWidth / 2, 15, { align: 'center' })

      if (scaledHeight <= pageContentHeight) {
        // Single page
        pdf.addImage(imgData, 'JPEG', 0, headerHeight, pdfWidth, scaledHeight)
      } else {
        // Multiple pages
        const totalPages = Math.ceil(scaledHeight / pageContentHeight)

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage()
            // Add header to each page
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Partner Ledger Report', pdfWidth / 2, 15, {
              align: 'center',
            })
          }

          const sourceY = (i * pageContentHeight) / scale / 0.264583
          const sourceHeight = Math.min(
            pageContentHeight / scale / 0.264583,
            imgHeight - sourceY
          )

          // Create temporary canvas for this page slice
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = imgWidth
          tempCanvas.height = sourceHeight

          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              sourceHeight,
              0,
              0,
              imgWidth,
              sourceHeight
            )
            const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.8)
            const sliceHeight = sourceHeight * 0.264583 * scale
            pdf.addImage(
              tempImgData,
              'JPEG',
              0,
              headerHeight,
              pdfWidth,
              sliceHeight
            )
          }
        }
      }

      pdf.save('partner_ledger.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const generateExcel = () => {
    exportToExcel(transactions, 'partner_ledger')
  }

 const handleSearch = useCallback(
  async (partnercode: number, fromdate: string, todate: string) => {
    try {
      const response = await getPartnerLedgerByDate({
        partnercode,
        fromdate,
        todate,
        token,
      })

      if (response.error) {
        // console.error('Error fetching transactions:', response.error)
        setTransactions([]) // clear old data on error
      } else {
        setTransactions(response.data && response.data.length > 0 ? response.data : [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([]) // clear old data on exception
    }
  },
  [token]
)


  return (
    <div className="space-y-4 max-w-[98%] mx-auto mt-20">
      <PartneredgerFind
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      <PartnerLedgerList transactions={transactions} targetRef={targetRef} />
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import TrialBalanceHeading from './trial-balance-heading'
import TrialBalanceTable from './trial-balance-table'
import type { TrialBalanceData } from '@/utils/type'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function TrialBalance() {
  const targetRef = React.useRef<HTMLDivElement>(null)
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceData[]>(
    []
  )
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const generatePdf = async () => {
    if (!targetRef.current) return

    setIsGeneratingPdf(true)

    try {
      const element = targetRef.current

      // Use scale 1 for normal font sizes
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Convert pixels to mm at 96 DPI without additional scaling
      const imgWidthMM = (imgWidth * 25.4) / 96
      const imgHeightMM = (imgHeight * 25.4) / 96

      // Calculate the width to fit the page with margins
      const maxWidth = pdfWidth - 20 // 10mm margin on each side
      const scaleFactor = maxWidth / imgWidthMM

      const finalWidth = maxWidth
      const finalHeight = imgHeightMM * scaleFactor

      const imgX = 10 // 10mm left margin
      const headerHeight = 35 // Space for header
      const availableHeight = pdfHeight - headerHeight - 10 // 10mm bottom margin

      const totalPages = Math.ceil(finalHeight / availableHeight)
      let dateRange = '' // Declare dateRange variable here

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        // Add header on each page
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(
          selectedCompanyName || 'Trial Balance Report',
          pdfWidth / 2,
          15,
          { align: 'center' }
        )

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        dateRange =
          startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : 'All Dates'
        const pageText =
          totalPages > 1 ? ` (Page ${i + 1} of ${totalPages})` : ''
        pdf.text(`Period: ${dateRange}${pageText}`, pdfWidth / 2, 25, {
          align: 'center',
        })

        const yOffset = i * availableHeight
        const sourceY = (yOffset / scaleFactor) * (96 / 25.4) // Convert back to pixels
        const sourceHeight = Math.min(
          (availableHeight / scaleFactor) * (96 / 25.4),
          imgHeight - sourceY
        )

        if (sourceHeight > 0) {
          // Create a temporary canvas for this page's content
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')

          pageCanvas.width = imgWidth
          pageCanvas.height = sourceHeight

          if (pageCtx) {
            pageCtx.drawImage(
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

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8)
            const pageHeightMM = Math.min(
              availableHeight,
              finalHeight - yOffset
            )

            pdf.addImage(
              pageImgData,
              'JPEG',
              imgX,
              headerHeight,
              finalWidth,
              pageHeightMM
            )
          }
        }
      }

      pdf.save(
        `Trial_Balance-${selectedCompanyName}-${dateRange.replace(/\//g, '-')}.pdf`
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const exportToExcel = (data: TrialBalanceData[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: TrialBalanceData[]): any[] => {
    let result: any[] = []
    data.forEach((item) => {
      result.push({
        Name: item.name,
        InitialDebit: item.initialDebit,
        InitialCredit: item.initialCredit,
        InitialBalance: item.initialBalance,
        PeriodDebit: item.periodDebit,
        PeriodCredit: item.periodCredit,
        PeriodBalance: item.periodDebit - item.periodCredit,
        ClosingDebit: item.closingDebit,
        ClosingCredit: item.closingCredit,
        ClosingBalance: item.closingBalance,
      })
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenData(item.children))
      }
    })
    return result
  }

  const generateExcel = () => {
    exportToExcel(trialBalanceData, 'trial_balance')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string,
    companyName: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
    setSelectedCompanyName(companyName)
  }

  return (
    <div>
      <TrialBalanceHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
        isGeneratingPdf={isGeneratingPdf}
      />
      <TrialBalanceTable
        targetRef={targetRef}
        setTrialBalanceData={setTrialBalanceData}
        startDate={startDate}
        endDate={endDate}
        companyId={companyId}
        isGeneratingPdf={isGeneratingPdf}
      />
    </div>
  )
}

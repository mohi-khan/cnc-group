'use client'

import { useCallback, useState, useRef } from 'react'
import type { EmployeeLedgerType } from '@/utils/type'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import EmployeeedgerFind from './employee-ledger-find'
import EmployeeLedgerList from './employee-ledger-list'
import { getEmployeeLedgerByDate } from '@/api/employee-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function EmployeeLedger() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [transactions, setTransactions] = useState<EmployeeLedgerType[]>([])
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const flattenData = (data: EmployeeLedgerType[]) => {
    return data.map((item) => ({
      date: item.date,
      VoucherNo: item.voucherno,
      AccountName: item.accountname,
      Debit: item.debit,
      Credit: item.credit,
      Notes: item.notes,
      CostCenter: item.coscenter,
      Department: item.department,
    }))
  }

  const exportToExcel = (data: EmployeeLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Ledger')
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
    setIsGeneratingPdf(true)

    try {
      const companyName = selectedCompanyName || 'Employee Ledger Report'
      const employeeName = selectedEmployeeName || 'All Employees'
      const dateRange =
        fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Dates'

      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginTop = 100
      const marginBottom = 40
      const horizontalPadding = 30
      const usablePageHeight = pageHeight - marginTop - marginBottom

      // Find the table and process it in batches
      const table = targetRef.current.querySelector('table')
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

      // Process rows in batches
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

        // Employee name
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Employee: ${employeeName}`, pageWidth / 2, 50, {
          align: 'center',
        })

        // Date range
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Date Range: ${dateRange}`, pageWidth / 2, 70, {
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

      pdf.save(`${companyName}-${employeeName}-ledger-report.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrint = () => {
    if (!targetRef.current) return

    const companyName = selectedCompanyName || 'Employee Ledger Report'
    const dateRange =
      fromDate && toDate ? `From ${fromDate} To ${toDate}` : 'All Dates'

    const printContents = `
      <div style="text-align:center;margin-bottom:18px;">
        <h2>${companyName}</h2>
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
      `<html><head><title>Print Employee Ledger</title></head><body>${printContents}</body></html>`
    )
    newWin.document.close()
    newWin.focus()
    newWin.print()
    newWin.close()
  }

  const generateExcel = () => {
    exportToExcel(transactions, 'employee_ledger')
  }

  const handleSearch = useCallback(
    async (
      employeeId: number,
      fromdate: string,
      todate: string,
      companyId: number,
      companyName?: string,
      employeeName?: string
    ) => {
      try {
        const response = await getEmployeeLedgerByDate({
          employeeId,
          fromdate,
          todate,
          companyId,
          token,
        })

        // Store search info for PDF and Print headers
        setSelectedCompanyName(companyName || '')
        setSelectedEmployeeName(employeeName || '')
        setFromDate(fromdate)
        setToDate(todate)

        if (response.error) {
          setTransactions([])
        } else {
          setTransactions(
            response.data && response.data.length > 0 ? response.data : []
          )
          console.log(response.data)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      }
    },
    [token]
  )

  return (
    <div className="space-y-4 max-w-[98%] mx-auto mt-20">
      <EmployeeedgerFind
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onPrint={handlePrint}
        isGeneratingPdf={isGeneratingPdf}
      />
      <EmployeeLedgerList transactions={transactions} targetRef={targetRef} />
    </div>
  )
}
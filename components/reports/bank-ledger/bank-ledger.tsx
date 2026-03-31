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
  const [previousData, setPreviousData] = useState<GetBankLedger[]>([])
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

        setSelectedCompanyName(companyName || '')
        setFromDate(fromdate)
        setToDate(todate)

        setTransactions(response.data || [])
        if (response.data && response.data.length > 0) {
          setPreviousData(response.data)
        }
      } catch (err) {
        console.error('❌ Fetch failed:', err)
        setTransactions([])
      }
    },
    [token]
  )

  // ── Helper: build a styled cell element ──────────────────────────────────
  const makeCell = (
    tag: 'th' | 'td',
    text: string,
    opts: {
      align?: string
      bg?: string
      bold?: boolean
      color?: string
    } = {}
  ): HTMLTableCellElement => {
    const cell = document.createElement(tag)
    cell.textContent = text
    cell.style.border = '1px solid #d1d5db'
    cell.style.padding = '5px 8px'
    cell.style.fontSize = '10px'
    cell.style.fontFamily = 'Arial, sans-serif'
    cell.style.textAlign = opts.align ?? 'left'
    cell.style.backgroundColor = opts.bg ?? '#ffffff'
    cell.style.fontWeight = opts.bold ? 'bold' : 'normal'
    cell.style.color = opts.color ?? '#111827'
    return cell
  }

  // ── Helper: build a full <tr> from an array of cell configs ──────────────
  const makeRow = (
    cells: { text: string; align?: string; bg?: string; bold?: boolean; color?: string }[],
    tag: 'th' | 'td' = 'td'
  ): HTMLTableRowElement => {
    const tr = document.createElement('tr')
    cells.forEach((c) => tr.appendChild(makeCell(tag, c.text, c)))
    return tr
  }

  // ── Helper: format number (Indian style) ─────────────────────────────────
  const fmt = (n: number | null | undefined): string => {
    if (n == null || n === 0) return '0.00'
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const generatePdf = async () => {
    if (transactions.length === 0) return
    setIsGeneratingPdf(true)

    try {
      const companyName = selectedCompanyName || 'Bank Ledger Report'
      const dateRange = fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Dates'

      // ── Separate opening / closing / transaction rows ─────────────────────
      const openingRow = transactions.find((t) =>
        t.accountname?.toLowerCase().includes('opening')
      )
      const closingRow = transactions.find((t) =>
        t.accountname?.toLowerCase().includes('closing')
      )
      const txRows = transactions.filter((t) => t !== openingRow && t !== closingRow)

      const totalDebit  = txRows.reduce((s, t) => s + (t.debit  ?? 0), 0)
      const totalCredit = txRows.reduce((s, t) => s + (t.credit ?? 0), 0)

      // ── Build ALL data rows we want in the PDF ────────────────────────────
      type RowDef = { text: string; align?: string; bg?: string; bold?: boolean }[]
      const HEADER_BG  = '#e5e7eb'
      const OPENING_BG = '#eff6ff'  // blue-50
      const CLOSING_BG = '#dbeafe'  // blue-100
      const TOTAL_BG   = '#f3f4f6'  // gray-100
      const ROW_EVEN   = '#f9fafb'
      const ROW_ODD    = '#ffffff'

      const columns = ['Date', 'Account Name', 'Voucher No', 'Debit', 'Credit', 'Partner', 'Notes']

      // Opening row
      const openingDataRow: RowDef = [
        { text: '' },
        { text: 'Opening Balance', bold: true },
        { text: '' },
        { text: fmt(openingRow?.debit),  align: 'right', bold: true },
        { text: fmt(openingRow?.credit), align: 'right', bold: true },
        { text: '' },
        { text: '' },
      ]

      // Transaction rows
      const txDataRows: RowDef[] = txRows.map((t, i) => [
        { text: t.date ?? '',          bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: `${t.accountname ?? ''}${t.bankaccountnumber ? ` (${t.bankaccountnumber})` : ''}`, bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: t.voucherno ?? '',     bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: fmt(t.debit),  align: 'right', bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: fmt(t.credit), align: 'right', bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: t.partner ?? '—',      bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
        { text: t.notes   ?? '—',      bg: i % 2 === 0 ? ROW_EVEN : ROW_ODD },
      ])

      // Current total row
      const totalDataRow: RowDef = [
        { text: '', bg: TOTAL_BG },
        { text: 'Current Total', bold: true, bg: TOTAL_BG },
        { text: '', bg: TOTAL_BG },
        { text: fmt(totalDebit),  align: 'right', bold: true, bg: TOTAL_BG },
        { text: fmt(totalCredit), align: 'right', bold: true, bg: TOTAL_BG },
        { text: '', bg: TOTAL_BG },
        { text: '', bg: TOTAL_BG },
      ]

      // Closing row
      const closingDataRow: RowDef = [
        { text: '', bg: CLOSING_BG },
        { text: 'Closing Balance', bold: true, bg: CLOSING_BG },
        { text: '', bg: CLOSING_BG },
        { text: fmt(closingRow?.debit),  align: 'right', bold: true, bg: CLOSING_BG },
        { text: fmt(closingRow?.credit), align: 'right', bold: true, bg: CLOSING_BG },
        { text: '', bg: CLOSING_BG },
        { text: '', bg: CLOSING_BG },
      ]

      const allDataRows: RowDef[] = [
        openingDataRow.map((c) => ({ ...c, bg: OPENING_BG })),
        ...txDataRows,
        totalDataRow,
        closingDataRow,
      ]

      // ── PDF setup ─────────────────────────────────────────────────────────
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginTop    = 80
      const marginBottom = 40
      const horizontalPadding = 30
      const imgWidth = pageWidth - horizontalPadding * 2
      const batchSize = 20

      // ── Build & capture the header row once ───────────────────────────────
      const headerWrapper = document.createElement('div')
      headerWrapper.style.position = 'fixed'
      headerWrapper.style.top = '-9999px'
      headerWrapper.style.left = '-9999px'
      headerWrapper.style.width = '750px'

      const headerTable = document.createElement('table')
      headerTable.style.width = '100%'
      headerTable.style.borderCollapse = 'collapse'

      const headerThead = document.createElement('thead')
      headerThead.appendChild(
        makeRow(columns.map((c) => ({ text: c, bg: HEADER_BG, bold: true })), 'th')
      )
      headerTable.appendChild(headerThead)
      headerWrapper.appendChild(headerTable)
      document.body.appendChild(headerWrapper)

      const headerCanvas = await html2canvas(headerWrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      document.body.removeChild(headerWrapper)

      const headerScale  = imgWidth / headerCanvas.width
      const headerHeight = headerCanvas.height * headerScale
      const headerImg    = headerCanvas.toDataURL('image/jpeg', 0.95)

      // ── Render rows in batches ────────────────────────────────────────────
      let currentY   = marginTop
      let isFirstPage = true

      for (let i = 0; i < allDataRows.length; i += batchSize) {
        const batch = allDataRows.slice(i, i + batchSize)

        const batchWrapper = document.createElement('div')
        batchWrapper.style.position = 'fixed'
        batchWrapper.style.top  = '-9999px'
        batchWrapper.style.left = '-9999px'
        batchWrapper.style.width = '750px'

        const batchTable = document.createElement('table')
        batchTable.style.width = '100%'
        batchTable.style.borderCollapse = 'collapse'

        const batchTbody = document.createElement('tbody')
        batch.forEach((rowDef) => batchTbody.appendChild(makeRow(rowDef)))
        batchTable.appendChild(batchTbody)
        batchWrapper.appendChild(batchTable)
        document.body.appendChild(batchWrapper)

        const batchCanvas = await html2canvas(batchWrapper, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        document.body.removeChild(batchWrapper)

        const batchScale  = imgWidth / batchCanvas.width
        const batchHeight = batchCanvas.height * batchScale

        // New page if batch doesn't fit
        if (!isFirstPage && currentY + batchHeight > pageHeight - marginBottom) {
          pdf.addPage()
          currentY = marginTop
          pdf.addImage(headerImg, 'JPEG', horizontalPadding, currentY, imgWidth, headerHeight)
          currentY += headerHeight
        } else if (isFirstPage) {
          pdf.addImage(headerImg, 'JPEG', horizontalPadding, currentY, imgWidth, headerHeight)
          currentY += headerHeight
          isFirstPage = false
        }

        const batchImg = batchCanvas.toDataURL('image/jpeg', 0.95)
        pdf.addImage(batchImg, 'JPEG', horizontalPadding, currentY, imgWidth, batchHeight)
        currentY += batchHeight
      }

      // ── Add header / footer to every page ────────────────────────────────
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)

        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pageWidth / 2, 30, { align: 'center' })

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Date Range: ${dateRange}`, pageWidth / 2, 50, { align: 'center' })

        pdf.setFontSize(10)
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

  const handlePrint = () => {
    if (!printRef.current) return

    const companyName = selectedCompanyName || 'Bank Ledger Report'
    const dateRange =
      fromDate && toDate ? `From ${fromDate} To ${toDate}` : 'All Dates'

    const printContents = `
      <div style="text-align:center;margin-bottom:18px;">
        <h2>${companyName}</h2>
        <h3>Bank Ledger Report</h3>
        <div>${dateRange}</div>
      </div>
      ${printRef.current?.innerHTML || ''}
      <style>
        @media print {
          .sort-icons, .lucide-arrow-up, .lucide-arrow-down, svg { display: none !important; }
          table[data-pdf-table] { display: none !important; }
          table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        }
        table[data-pdf-table] { display: none !important; }
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #000; padding:4px; text-align:left; }
      </style>
    `
    const newWin = window.open('', '', 'width=900,height=700')
    if (!newWin) return
    newWin.document.write(
      `<html><head><title>Print Bank Ledger</title></head><body>${printContents}</body></html>`
    )
    newWin.document.close()
    newWin.focus()
    newWin.print()
    newWin.close()
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
        generatePrint={handlePrint}
      />
      <div ref={printRef}>
        <BankLedgerList transactions={transactions} />
      </div>
    </div>
  )
}

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import BankLedgerFind from './bank-ledger-find'
// import BankLedgerList from './bank-ledger-list'
// import type { GetBankLedger } from '@/utils/type'
// import { getBankAccountsByDate } from '@/api/bank-ledger-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import * as XLSX from 'xlsx'
// import { date } from 'zod'

// export default function BankLedger() {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [transactions, setTransactions] = useState<GetBankLedger[]>([])
//   const [previousData, setPreviousData] = useState<GetBankLedger[]>([]) // store last good data
//   const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
//   const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')
//   const [fromDate, setFromDate] = useState<string>('')
//   const [toDate, setToDate] = useState<string>('')

//   const printRef = useRef<HTMLDivElement>(null)

//   const handleSearch = useCallback(
//     async (
//       bankaccount: number,
//       fromdate: string,
//       todate: string,
//       companyName?: string
//     ) => {
//       if (!token) return

//       try {
//         const response = await getBankAccountsByDate(
//           { bankaccount, fromdate, todate },
//           token
//         )

//         console.log('🔍 API Response:', response.data || [])

//         // store search info for PDF header
//         setSelectedCompanyName(companyName || '')
//         setFromDate(fromdate)
//         setToDate(todate)

//         // Always update transactions — even if empty
//         setTransactions(response.data || [])
//         // Optional: update previousData only if there’s actual data
//         if (response.data && response.data.length > 0) {
//           setPreviousData(response.data)
//         }
//       } catch (err) {
//         console.error('❌ Fetch failed:', err)
//         // optionally clear table on error
//         setTransactions([])
//       }
//     },
//     [token]
//   )



//   const generatePdf = async () => {
//     if (!printRef.current) return
//     setIsGeneratingPdf(true)

//     try {
//       const companyName = selectedCompanyName || 'Bank Ledger Report'
      
//       const dateRange =
//         fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Dates'

//       const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const pageHeight = pdf.internal.pageSize.getHeight()
//       const marginTop = 80
//       const marginBottom = 40
//       const horizontalPadding = 30
//       const usablePageHeight = pageHeight - marginTop - marginBottom

//       // Find the table and process it in batches
//       const table = printRef.current.querySelector('table')
//       if (!table) {
//         console.error('Table not found')
//         setIsGeneratingPdf(false)
//         return
//       }

//       const thead = table.querySelector('thead')
//       const tbody = table.querySelector('tbody')

//       if (!thead || !tbody) {
//         console.error('Table structure incomplete')
//         setIsGeneratingPdf(false)
//         return
//       }

//       // Capture header once
//       const headerCanvas = await html2canvas(thead, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: '#ffffff',
//       })

//       const rows = Array.from(tbody.querySelectorAll('tr'))
//       const imgWidth = pageWidth - horizontalPadding * 2
//       const headerScale = imgWidth / headerCanvas.width
//       const headerHeight = headerCanvas.height * headerScale
//       const headerImg = headerCanvas.toDataURL('image/jpeg', 0.95)

//       let currentY = marginTop
//       let isFirstPage = true

//       // Process rows in batches for better performance
//       const batchSize = 19

//       for (let i = 0; i < rows.length; i += batchSize) {
//         const batchRows = rows.slice(i, Math.min(i + batchSize, rows.length))

//         // Create temporary container for batch
//         const batchContainer = document.createElement('div')
//         batchContainer.style.width = tbody.offsetWidth + 'px'

//         const batchTable = document.createElement('table')
//         batchTable.style.width = '100%'
//         batchTable.style.borderCollapse = 'collapse'

//         const batchTbody = document.createElement('tbody')
//         batchRows.forEach((row) => {
//           batchTbody.appendChild(row.cloneNode(true))
//         })

//         batchTable.appendChild(batchTbody)
//         batchContainer.appendChild(batchTable)
//         document.body.appendChild(batchContainer)

//         // Capture batch
//         const batchCanvas = await html2canvas(batchContainer, {
//           scale: 2,
//           useCORS: true,
//           backgroundColor: '#ffffff',
//         })

//         document.body.removeChild(batchContainer)

//         const batchScale = imgWidth / batchCanvas.width
//         const batchHeight = batchCanvas.height * batchScale

//         // Check if batch fits on current page
//         if (
//           !isFirstPage &&
//           currentY + batchHeight > pageHeight - marginBottom
//         ) {
//           // Add new page
//           pdf.addPage()
//           currentY = marginTop

//           // Add header to new page
//           pdf.addImage(
//             headerImg,
//             'JPEG',
//             horizontalPadding,
//             currentY,
//             imgWidth,
//             headerHeight
//           )
//           currentY += headerHeight
//         } else if (isFirstPage) {
//           // First page - add header
//           pdf.addImage(
//             headerImg,
//             'JPEG',
//             horizontalPadding,
//             currentY,
//             imgWidth,
//             headerHeight
//           )
//           currentY += headerHeight
//           isFirstPage = false
//         }

//         // Add batch to current page
//         const batchImg = batchCanvas.toDataURL('image/jpeg', 0.95)
//         pdf.addImage(
//           batchImg,
//           'JPEG',
//           horizontalPadding,
//           currentY,
//           imgWidth,
//           batchHeight
//         )
//         currentY += batchHeight
//       }

//       const totalPages = pdf.internal.pages.length - 1

//       // Add headers and footers to all pages
//       for (let i = 1; i <= totalPages; i++) {
//         pdf.setPage(i)

//         // Company name header
//         pdf.setFontSize(16)
//         pdf.setFont('helvetica', 'bold')
//         pdf.text(companyName, pageWidth / 2, 30, { align: 'center' })

//         // Date range
//         pdf.setFontSize(11)
//         pdf.setFont('helvetica', 'normal')
//         pdf.text(`Date Range: ${dateRange}`, pageWidth / 2, 50, {
//           align: 'center',
//         })

//         // Page number footer
//         pdf.setFontSize(10)
//         pdf.setFont('helvetica', 'normal')
//         pdf.text(
//           `Page ${i} of ${totalPages}`,
//           pageWidth - horizontalPadding - 50,
//           pageHeight - marginBottom + 20
//         )
//       }

//       pdf.save(`${companyName}-ledger-report.pdf`)
//     } catch (error) {
//       console.error('PDF generation error:', error)
//     } finally {
//       setIsGeneratingPdf(false)
//     }
//   }

//   const handlePrint = () => {
//     if (!printRef.current) return

//     const companyName = selectedCompanyName || 'Bank Ledger Report'
//     const dateRange =
//       fromDate && toDate ? `From ${fromDate} To ${toDate}` : 'All Dates'

//     const printContents = `
//       <div style="text-align:center;margin-bottom:18px;">
//         <h2>${companyName}</h2>
//         <h3>Bank Ledger Report</h3>
//         <div>${dateRange}</div>
//       </div>
//       ${printRef.current?.innerHTML || ''}
//       <style>
//         @media print {
//           .sort-icons, .lucide-arrow-up, .lucide-arrow-down, svg { display: none !important; }
//           table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
//           th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
//           th { background-color: #f2f2f2; }
//         }
//         table { width:100%; border-collapse: collapse; }
//         th, td { border:1px solid #000; padding:4px; text-align:left; }
//       </style>
//     `
//     const newWin = window.open('', '', 'width=900,height=700')
//     if (!newWin) return
//     newWin.document.write(
//       `<html><head><title>Print Bank Ledger</title></head><body>${printContents}</body></html>`
//     )
//     newWin.document.close()
//     newWin.focus()
//     newWin.print()
//     newWin.close()
//   }

  

//   const exportToExcel = () => {
//     if (transactions.length === 0) return

//     const worksheet = XLSX.utils.json_to_sheet(
//       transactions.map((transaction, index) => ({
//         'S.No': index + 1,
//         date: transaction.date,
//         'Voucher No': transaction.voucherno,
//         'Account Name': transaction.accountname,
//         Debit: transaction.debit,
//         Credit: transaction.credit,
//         Partner: transaction.partner ?? '',
//         Notes: transaction.notes ?? '',
//       }))
//     )

//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Ledger')
//     XLSX.writeFile(
//       workbook,
//       `${selectedCompanyName || 'Bank'}-ledger-report.xlsx`
//     )
//   }

  

//   return (
//     <div className="space-y-4 max-w-[98%] mx-auto mt-20">
//       <BankLedgerFind
//         onSearch={handleSearch}
//         onGeneratePdf={generatePdf}
//         onExportExcel={exportToExcel}
//         isGeneratingPdf={isGeneratingPdf}
//         generatePrint={handlePrint}
//       />
//       <div ref={printRef}>
//         <BankLedgerList transactions={transactions} />
//       </div>
//     </div>
//   )
// }

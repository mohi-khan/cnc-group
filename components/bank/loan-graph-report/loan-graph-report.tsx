


// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import LoanGraphReportList from './loan-graph-report-list'
// import LoanGraphReportHeading from './loan-graph-report-heading'
// import { getLoanPosition } from '@/api/loan-graph-report-api'
// import { toast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import type { LoanPosition } from '@/utils/type'
// import { usePDF } from 'react-to-pdf'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'

// const LoanGraphReport = () => {
//   const [loanPosition, setLoanPosition] = useState<LoanPosition[]>([])
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0])
//   const [month, setMonth] = useState('all')
//   const [loading, setLoading] = useState(false)

//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const { toPDF, targetRef } = usePDF({
//     filename: `loan-graph-report-${date}.pdf`,
//     page: { margin: 20, format: 'a4', orientation: 'landscape' },
//   })

//   const fetchLoanBalance = useCallback(async () => {
//     if (!token) return
//     setLoading(true)
//     try {
//       const response = await getLoanPosition({
//         date,
//         month: month === 'all' ? 0 : Number(month),
//         token,
//       })
//       if (!response?.data) {
//         toast({ title: 'Error', description: 'Failed to load loan balance' })
//         setLoanPosition([])
//         return
//       }

//       // Flatten data if API returns nested empty arrays
//       const data = Array.isArray(response.data)
//         ? response.data.flat().filter((item: any) => item?.companyName)
//         : []

//       setLoanPosition(data)
//       console.log('loan position Data: ', data)
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to fetch loan balance' })
//       setLoanPosition([])
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }, [date, month, token])

//   const exportToExcel = useCallback(() => {
//     if (!loanPosition || loanPosition.length === 0) {
//       toast({ title: 'No Data', description: 'No data available to export' })
//       return
//     }

//     // Normalize data for Excel export
//     const normalizedData = loanPosition.map((item) => ({
//       companyName: item.companyName ?? 'Unknown',
//       date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
//       balance: Number.parseFloat(item.balance.toString()) || 0,
//       accountNumber: item.accountNumber || '',
//       accountType: item.accountType || '',
//     }))

//     // Group by company and create pivot table structure
//     const companyMap = new Map<string, typeof normalizedData>()
//     normalizedData.forEach((item) => {
//       if (!companyMap.has(item.companyName))
//         companyMap.set(item.companyName, [])
//       companyMap.get(item.companyName)!.push(item)
//     })

//     const uniqueDates = Array.from(
//       new Set(normalizedData.map((item) => item.date))
//     ).sort()

//     // Create Excel data structure
//     const excelData: any[] = []

//     // Header row
//     const headerRow = [
//       'Company',
//       ...uniqueDates.map((date) => new Date(date).toLocaleDateString()),
//       'Total',
//     ]
//     excelData.push(headerRow)

//     // Company rows
//     Array.from(companyMap.entries()).forEach(([company, records]) => {
//       const dateMap = new Map<string, number>()
//       records.forEach((r) => {
//         dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.balance)
//       })

//       const companyTotal = Array.from(dateMap.values()).reduce(
//         (a, b) => a + b,
//         0
//       )

//       const row = [
//         company,
//         ...uniqueDates.map((date) => dateMap.get(date) || 0),
//         companyTotal,
//       ]
//       excelData.push(row)
//     })

//     // Total row
//     const totalRow = ['TOTAL']
//     uniqueDates.forEach((date) => {
//       const total = Array.from(companyMap.values()).reduce(
//         (sum, records) =>
//           sum +
//           records.reduce((s, r) => (r.date === date ? s + r.balance : s), 0),
//         0
//       )
//       totalRow.push(total.toString())
//     })

//     const grandTotal = Array.from(companyMap.values()).reduce(
//       (sum, records) => sum + records.reduce((a, r) => a + r.balance, 0),
//       0
//     )
//     totalRow.push(grandTotal.toString())

//     excelData.push(totalRow)

//     // Create workbook and worksheet
//     const wb = XLSX.utils.book_new()
//     const ws = XLSX.utils.aoa_to_sheet(excelData)

//     // Add worksheet to workbook
//     XLSX.utils.book_append_sheet(wb, ws, 'Loan Graph Report')

//     // Generate Excel file and save
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
//     const data = new Blob([excelBuffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     })
//     saveAs(data, `loan-graph-report-${date}.xlsx`)

//     toast({ title: 'Success', description: 'Excel file exported successfully' })
//   }, [loanPosition, date])

//   const exportToPDF = useCallback(() => {
//     if (!loanPosition || loanPosition.length === 0) {
//       toast({ title: 'No Data', description: 'No data available to export' })
//       return
//     }

//     toPDF()
//     toast({ title: 'Success', description: 'PDF exported successfully' })
//   }, [loanPosition, toPDF])

//   useEffect(() => {
//     fetchLoanBalance()
//   }, [fetchLoanBalance])

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold text-foreground">
//           Loan Graph Report
//         </h1>
//         <p className="text-muted-foreground mt-2">
//           Track loan positions across companies
//         </p>
//       </div>

//       <LoanGraphReportHeading
//         date={date}
//         month={month}
//         onDateChange={setDate}
//         onMonthChange={setMonth}
//         onExportPDF={exportToPDF}
//         onExportExcel={exportToExcel}
//       />

//       {loading ? (
//         <div className="flex justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       ) : (
//         <LoanGraphReportList loanPosition={loanPosition} ref={targetRef} />
//       )}
//     </div>
//   )
// }

// export default LoanGraphReport


'use client'

import { useCallback, useEffect, useState } from 'react'
import LoanGraphReportList from './loan-graph-report-list'
import LoanGraphReportHeading from './loan-graph-report-heading'

import { getLoanPosition } from '@/api/loan-graph-report-api'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import type { LoanPosition } from '@/utils/type'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import LoanGraphReportChart from './loan-graph-report-chart'

const LoanGraphReport = () => {
  const [loanPosition, setLoanPosition] = useState<LoanPosition[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [month, setMonth] = useState('all')
  const [loading, setLoading] = useState(false)

  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const { toPDF, targetRef } = usePDF({
    filename: `loan-graph-report-${date}.pdf`,
    page: { margin: 20, format: 'a4', orientation: 'landscape' },
  })

  const fetchLoanBalance = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await getLoanPosition({
        date,
        month: month === 'all' ? 0 : Number(month),
        token,
      })
      if (!response?.data) {
        toast({ title: 'Error', description: 'Failed to load loan balance' })
        setLoanPosition([])
        return
      }

      // Flatten data if API returns nested empty arrays
      const data = Array.isArray(response.data)
        ? response.data.flat().filter((item: any) => item?.companyName)
        : []

      setLoanPosition(data)
      console.log('loan position Data: ', data)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch loan balance' })
      setLoanPosition([])
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [date, month, token])

  const exportToExcel = useCallback(() => {
    if (!loanPosition || loanPosition.length === 0) {
      toast({ title: 'No Data', description: 'No data available to export' })
      return
    }

    // Normalize data for Excel export
    const normalizedData = loanPosition.map((item) => ({
      companyName: item.companyName ?? 'Unknown',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      balance: Number.parseFloat(item.balance.toString()) || 0,
      accountNumber: item.accountNumber || '',
      accountType: item.accountType || '',
    }))

    // Group by company and create pivot table structure
    const companyMap = new Map<string, typeof normalizedData>()
    normalizedData.forEach((item) => {
      if (!companyMap.has(item.companyName))
        companyMap.set(item.companyName, [])
      companyMap.get(item.companyName)!.push(item)
    })

    const uniqueDates = Array.from(
      new Set(normalizedData.map((item) => item.date))
    ).sort()

    // Create Excel data structure
    const excelData: any[] = []

    // Header row
    const headerRow = [
      'Company',
      ...uniqueDates.map((date) => new Date(date).toLocaleDateString()),
      'Total',
    ]
    excelData.push(headerRow)

    // Company rows
    Array.from(companyMap.entries()).forEach(([company, records]) => {
      const dateMap = new Map<string, number>()
      records.forEach((r) => {
        dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.balance)
      })

      const companyTotal = Array.from(dateMap.values()).reduce(
        (a, b) => a + b,
        0
      )

      const row = [
        company,
        ...uniqueDates.map((date) => dateMap.get(date) || 0),
        companyTotal,
      ]
      excelData.push(row)
    })

    // Total row
    const totalRow = ['TOTAL']
    uniqueDates.forEach((date) => {
      const total = Array.from(companyMap.values()).reduce(
        (sum, records) =>
          sum +
          records.reduce((s, r) => (r.date === date ? s + r.balance : s), 0),
        0
      )
      totalRow.push(total.toString())
    })

    const grandTotal = Array.from(companyMap.values()).reduce(
      (sum, records) => sum + records.reduce((a, r) => a + r.balance, 0),
      0
    )
    totalRow.push(grandTotal.toString())

    excelData.push(totalRow)

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Loan Graph Report')

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(data, `loan-graph-report-${date}.xlsx`)

    toast({ title: 'Success', description: 'Excel file exported successfully' })
  }, [loanPosition, date])

  const exportToPDF = useCallback(() => {
    if (!loanPosition || loanPosition.length === 0) {
      toast({ title: 'No Data', description: 'No data available to export' })
      return
    }

    toPDF()
    toast({ title: 'Success', description: 'PDF exported successfully' })
  }, [loanPosition, toPDF])

  useEffect(() => {
    fetchLoanBalance()
  }, [fetchLoanBalance])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Loan Graph Report
        </h1>
        <p className="text-muted-foreground mt-2">
          Track loan positions across companies
        </p>
      </div>

      <LoanGraphReportHeading
        date={date}
        month={month}
        onDateChange={setDate}
        onMonthChange={setMonth}
        onExportPDF={exportToPDF}
        onExportExcel={exportToExcel}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <LoanGraphReportChart loanPosition={loanPosition} />
          <LoanGraphReportList loanPosition={loanPosition} ref={targetRef} />
        </>
      )}
    </div>
  )
}

export default LoanGraphReport

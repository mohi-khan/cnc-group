'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { BudgetReportType, CompanyFromLocalstorage } from '@/utils/type'
import {
  getBudgetReport,
  getAllMasterBudget,
  getAllBudgetDetails,
} from '@/api/budget-api'
import { getAllCompanies } from '@/api/common-shared-api'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { format, subMonths } from 'date-fns'
import { FileText, File } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const BudgetReport = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)
  const targetRef = useRef<HTMLDivElement>(null)

  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date>(new Date())

  const [masterBudget, setMasterBudget] = useState<any[]>([])
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')

  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [budgetReportData, setBudgetReportData] = useState<BudgetReportType[]>(
    []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all companies dynamically
  const fetchAllCompanies = useCallback(async () => {
    try {
      const fetchedCompanies = await getAllCompanies(token)
      if (fetchedCompanies?.error?.status === 401) return
      if (fetchedCompanies.error || !fetchedCompanies.data) {
        toast({
          title: 'Error',
          description:
            fetchedCompanies.error?.message || 'Failed to get companies',
          variant: 'destructive',
        })
      } else {
        setCompanies(
          fetchedCompanies.data.map((c: any) => ({
            companyId: c.companyId ?? c.company?.companyId ?? 0,
            company: {
              companyId: c.companyId ?? c.company?.companyId ?? 0,
              companyName: c.companyName ?? c.company?.companyName ?? '',
            },
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      })
    }
  }, [token])

  // Fetch master budgets
  const fetchGetAllMasterBudget = useCallback(async () => {
    try {
      const response = await getAllMasterBudget({ token })
      if (!response?.data) {
        throw new Error('No data received from master budget API')
      }
      setMasterBudget(response.data)
      console.log('master budget: ', response.data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load master budget'
      console.error('Error getting master budget:', err)

      if (toast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      setMasterBudget([])
    }
  }, [token])

  // Fetch budget details for selected budget
  const fetchGetAllBudgetItems = useCallback(async () => {
    if (!selectedBudgetId) return
    console.log('🔄 Fetching budget items...')
    setLoading(true)
    setError(null)
    try {
      const response = await getAllBudgetDetails(
        Number(selectedBudgetId),
        token
      )
      console.log('📊 Budget Items Response:', response)
      if (!response?.data) {
        throw new Error('No data received from budget details API')
      }
      console.log('✅ Setting budget items:', response.data)
      setBudgetItems(response.data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load budget details'
      console.error('❌ Error fetching budget items:', err)

      if (toast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      setError(errorMessage)
      setBudgetItems([])
    } finally {
      setLoading(false)
    }
  }, [selectedBudgetId, token])

  // Fetch budget report data
  const fetchBudgetReport = useCallback(async () => {
    if (!selectedCompanyId || !startDate || !endDate) return

    console.log('🔄 Fetching budget report...')
    setLoading(true)
    setError(null)

    try {
      const response = await getBudgetReport({
        companyId: Number(selectedCompanyId),
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        token,
      })

      console.log('📊 Budget Report Response:', response)

      if (!response?.data) {
        throw new Error('No data received from budget report API')
      }

      console.log('✅ Setting budget report data:', response.data)
      setBudgetReportData(response.data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load budget report'
      console.error('❌ Error fetching budget report:', err)

      if (toast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      setError(errorMessage)
      setBudgetReportData([])
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyId, startDate, endDate, token])

  // When a budget is selected, auto-set company, start date, and end date
  const handleBudgetSelect = (budgetId: string) => {
    setSelectedBudgetId(budgetId)
    const budget = masterBudget.find((b) => b.budgetId.toString() === budgetId)
    if (budget) {
      setSelectedCompanyId(budget.companyId?.toString() ?? '')
      setStartDate(new Date(budget.fromDate))
      setEndDate(new Date(budget.toDate))
    }
  }

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchAllCompanies()
      fetchGetAllMasterBudget()
    }
  }, [token, fetchAllCompanies, fetchGetAllMasterBudget])

  // Fetch budget details whenever a budget is selected
  useEffect(() => {
    if (selectedBudgetId && token) {
      fetchGetAllBudgetItems()
    }
  }, [selectedBudgetId, token, fetchGetAllBudgetItems])

  // Fetch budget report when all required fields are set
  useEffect(() => {
    if (selectedCompanyId && startDate && endDate && token) {
      fetchBudgetReport()
    }
  }, [selectedCompanyId, startDate, endDate, token, fetchBudgetReport])

  // Merge budget items with report data
  const mergedData = budgetItems.map((item) => {
    // Match by account code or id
    const reportItem = budgetReportData.find(
      (report) =>
        report.id === item.accountId ||
        report.code === item.accountCode ||
        report.code === item.account?.accountCode
    )
    return {
      ...item,
      accountName:
        item.accountName ||
        item.account?.accountName ||
        reportItem?.name ||
        '-',
      periodDebit: reportItem?.periodDebit || 0,
      periodCredit: reportItem?.periodCredit || 0,
      initialDebit: reportItem?.initialDebit || 0,
      initialCredit: reportItem?.initialCredit || 0,
      closingDebit: reportItem?.closingDebit || 0,
      closingCredit: reportItem?.closingCredit || 0,
    }
  })

  console.log('list data:', mergedData)

  // PDF Generation
  const formatDate = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}/${dd}/${yyyy}`
  }

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
      // Get company name and budget name
      let companyName = 'Budget Report'
      let budgetName = ''

      if (selectedCompanyId && companies) {
        const company = companies.find(
          (c) => c.company.companyId?.toString() === selectedCompanyId
        )
        if (company) {
          companyName = company.company.companyName || 'Budget Report'
        }
      }

      if (selectedBudgetId && masterBudget) {
        const budget = masterBudget.find(
          (b) => b.budgetId.toString() === selectedBudgetId
        )
        if (budget) {
          budgetName = budget.name || ''
        }
      }

      // Format date range text
      let dateRange = ''
      if (startDate && endDate) {
        dateRange = `${formatDate(startDate)} to ${formatDate(endDate)}`
      }

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

      // Calculate scaling to fit page width while maintaining aspect ratio
      const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * scale

      const headerHeight = 35 // increased margin for multiple headers
      const pageContentHeight = pdfHeight - headerHeight - 15 // extra margin

      let yPosition = 0
      let pageNumber = 1

      while (yPosition < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
        }

        // Add company name header
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

        // Add budget name
        if (budgetName) {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Budget Name: ${budgetName}`, pdfWidth / 2, 22, {
            align: 'center',
          })
        }

        // Add date range below company name
        if (dateRange) {
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          pdf.text(dateRange, pdfWidth / 2, 28, { align: 'center' })
        }

        // Add page content
        const sourceY = yPosition / scale / 0.264583
        const sourceHeight = Math.min(
          pageContentHeight / scale / 0.264583,
          imgHeight - sourceY
        )

        if (sourceHeight > 0) {
          pdf.addImage(
            imgData,
            'JPEG',
            10, // left margin
            headerHeight,
            pdfWidth - 20, // right margin
            sourceHeight * scale * 0.264583
          )
        }

        yPosition += pageContentHeight
        pageNumber++
      }

      pdf.save('budget-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      })
    }
  }

  // Excel Generation
  const flattenData = (data: any[]): any[] => {
    return data.map((item) => {
      const actualAmount = item.periodDebit - item.periodCredit
      const budgetAmount = item.amount || item.budgetAmount || 0
      const percentage =
        budgetAmount === 0 ? 0 : (actualAmount / budgetAmount) * 100

      return {
        'Account Name': item.name || item.account?.name || '-',
        'Budget Amount': budgetAmount,
        'Actual Amount': actualAmount,
        Percentage: `${percentage.toFixed(2)}%`,
      }
    })
  }

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget Report')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const generateExcel = () => {
    if (mergedData.length === 0) {
      toast({
        title: 'Warning',
        description: 'No data to export',
        variant: 'destructive',
      })
      return
    }
    exportToExcel(mergedData, 'budget-report')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Budget Report</h2>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={generatePdf}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
            disabled={mergedData.length === 0}
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">PDF</span>
          </Button>
          <Button
            onClick={generateExcel}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={mergedData.length === 0}
          >
            <File className="h-4 w-4" />
            <span className="font-medium">Excel</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center mb-4 flex-wrap">
        {/* Budget Select */}
        <Select value={selectedBudgetId} onValueChange={handleBudgetSelect}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a budget" />
          </SelectTrigger>
          <SelectContent>
            {masterBudget
              .filter(
                (budget) => budget.budgetId != null && budget.budgetId !== ''
              )
              .map((budget) => (
                <SelectItem
                  key={budget.budgetId}
                  value={budget.budgetId.toString()}
                >
                  {budget.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Company Select (readonly) */}
        <Select value={selectedCompanyId} disabled>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            {companies
              .filter(
                (company) =>
                  company.company.companyId != null &&
                  company.company.companyId !== 0
              )
              .map((company) => (
                <SelectItem
                  key={company.company.companyId}
                  value={company.company.companyId.toString()}
                >
                  {company.company.companyName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Start Date */}
        <input
          type="date"
          className="border px-2 py-1 rounded w-[150px]"
          value={format(startDate, 'yyyy-MM-dd')}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          disabled
        />

        {/* End Date */}
        <input
          type="date"
          className="border px-2 py-1 rounded w-[150px]"
          value={format(endDate, 'yyyy-MM-dd')}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          disabled
        />
      </div>

      {/* Loading & Error */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Budget Report Table - wrapped in ref for PDF generation */}
      <div ref={targetRef}>
        <table className="min-w-full border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border px-4 py-2">Account Name</th>
              <th className="border px-4 py-2">Budget Amount</th>
              <th className="border px-4 py-2">Actual Amount</th>
              <th className="border px-4 py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="border px-4 py-2 text-center text-gray-500"
                >
                  {selectedBudgetId
                    ? 'No budget items found'
                    : 'Please select a budget'}
                </td>
              </tr>
            ) : (
              mergedData.map((item, index) => (
                <tr key={`${item.accountId}-${index}`} className="text-center">
                  <td className="border px-4 py-2">
                    {item.name || item.account?.name || '-'}
                  </td>
                  <td className="border px-4 py-2">
                    {item.amount || item.budgetAmount || 0}
                  </td>
                  <td
                    className={`border px-4 py-2 ${
                      item.periodDebit - item.periodCredit >
                      (item.amount || item.budgetAmount || 0)
                        ? 'text-red-500'
                        : ''
                    }`}
                  >
                    {item.periodDebit - item.periodCredit}
                  </td>
                  <td className="border px-4 py-2">
                    {(() => {
                      const A = item.periodDebit - item.periodCredit
                      const B = item.amount || item.budgetAmount || 0
                      if (B === 0) return '0%'
                      const percentage = (A / B) * 100
                      return `${percentage.toFixed(2)}%`
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BudgetReport


// 'use client'

// import React, { useEffect, useState, useCallback } from 'react'
// import { useAtom } from 'jotai'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { BudgetReportType, CompanyFromLocalstorage } from '@/utils/type'
// import {
//   getBudgetReport,
//   getAllMasterBudget,
//   getAllBudgetDetails,
// } from '@/api/budget-api'
// import { getAllCompanies } from '@/api/common-shared-api'
// import { toast } from '@/hooks/use-toast'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { format, subMonths } from 'date-fns'

// const BudgetReport = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

//   const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1))
//   const [endDate, setEndDate] = useState<Date>(new Date())

//   const [masterBudget, setMasterBudget] = useState<any[]>([])
//   const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')

//   const [budgetItems, setBudgetItems] = useState<any[]>([])
//   const [budgetReportData, setBudgetReportData] = useState<BudgetReportType[]>(
//     []
//   )
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Fetch all companies dynamically
//   const fetchAllCompanies = useCallback(async () => {
//     try {
//       const fetchedCompanies = await getAllCompanies(token)
//       if (fetchedCompanies?.error?.status === 401) return
//       if (fetchedCompanies.error || !fetchedCompanies.data) {
//         toast({
//           title: 'Error',
//           description:
//             fetchedCompanies.error?.message || 'Failed to get companies',
//           variant: 'destructive',
//         })
//       } else {
//         setCompanies(
//           fetchedCompanies.data.map((c: any) => ({
//             companyId: c.companyId ?? c.company?.companyId ?? 0,
//             company: {
//               companyId: c.companyId ?? c.company?.companyId ?? 0,
//               companyName: c.companyName ?? c.company?.companyName ?? '',
//             },
//           }))
//         )
//       }
//     } catch (error) {
//       console.error('Error fetching companies:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch companies',
//         variant: 'destructive',
//       })
//     }
//   }, [token])

//   // Fetch master budgets
//   const fetchGetAllMasterBudget = useCallback(async () => {
//     try {
//       const response = await getAllMasterBudget({ token })
//       if (!response?.data) {
//         throw new Error('No data received from master budget API')
//       }
//       setMasterBudget(response.data)
//       console.log('master budget: ', response.data)
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : 'Failed to load master budget'
//       console.error('Error getting master budget:', err)

//       if (toast) {
//         toast({
//           title: 'Error',
//           description: errorMessage,
//           variant: 'destructive',
//         })
//       }
//       setMasterBudget([])
//     }
//   }, [token])

//   // Fetch budget details for selected budget
//   const fetchGetAllBudgetItems = useCallback(async () => {
//     if (!selectedBudgetId) return
//     console.log('🔄 Fetching budget items...')
//     setLoading(true)
//     setError(null)
//     try {
//       const response = await getAllBudgetDetails(
//         Number(selectedBudgetId),
//         token
//       )
//       console.log('📊 Budget Items Response:', response)
//       if (!response?.data) {
//         throw new Error('No data received from budget details API')
//       }
//       console.log('✅ Setting budget items:', response.data)
//       setBudgetItems(response.data)
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : 'Failed to load budget details'
//       console.error('❌ Error fetching budget items:', err)

//       if (toast) {
//         toast({
//           title: 'Error',
//           description: errorMessage,
//           variant: 'destructive',
//         })
//       }
//       setError(errorMessage)
//       setBudgetItems([])
//     } finally {
//       setLoading(false)
//     }
//   }, [selectedBudgetId, token])

//   // Fetch budget report data
//   const fetchBudgetReport = useCallback(async () => {
//     if (!selectedCompanyId || !startDate || !endDate) return

//     console.log('🔄 Fetching budget report...')
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await getBudgetReport({
//         companyId: Number(selectedCompanyId),
//         startDate: format(startDate, 'yyyy-MM-dd'),
//         endDate: format(endDate, 'yyyy-MM-dd'),
//         token,
//       })

//       console.log('📊 Budget Report Response:', response)

//       if (!response?.data) {
//         throw new Error('No data received from budget report API')
//       }

//       console.log('✅ Setting budget report data:', response.data)
//       setBudgetReportData(response.data)
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : 'Failed to load budget report'
//       console.error('❌ Error fetching budget report:', err)

//       if (toast) {
//         toast({
//           title: 'Error',
//           description: errorMessage,
//           variant: 'destructive',
//         })
//       }
//       setError(errorMessage)
//       setBudgetReportData([])
//     } finally {
//       setLoading(false)
//     }
//   }, [selectedCompanyId, startDate, endDate, token])

//   // When a budget is selected, auto-set company, start date, and end date
//   const handleBudgetSelect = (budgetId: string) => {
//     setSelectedBudgetId(budgetId)
//     const budget = masterBudget.find((b) => b.budgetId.toString() === budgetId)
//     if (budget) {
//       setSelectedCompanyId(budget.companyId?.toString() ?? '')
//       setStartDate(new Date(budget.fromDate))
//       setEndDate(new Date(budget.toDate))
//     }
//   }

//   // Initial fetch
//   useEffect(() => {
//     if (token) {
//       fetchAllCompanies()
//       fetchGetAllMasterBudget()
//     }
//   }, [token, fetchAllCompanies, fetchGetAllMasterBudget])

//   // Fetch budget details whenever a budget is selected
//   useEffect(() => {
//     if (selectedBudgetId && token) {
//       fetchGetAllBudgetItems()
//     }
//   }, [selectedBudgetId, token, fetchGetAllBudgetItems])

//   // Fetch budget report when all required fields are set
//   useEffect(() => {
//     if (selectedCompanyId && startDate && endDate && token) {
//       fetchBudgetReport()
//     }
//   }, [selectedCompanyId, startDate, endDate, token, fetchBudgetReport])

//   // Merge budget items with report data
//   const mergedData = budgetItems.map((item) => {
//     // Match by account code or id
//     const reportItem = budgetReportData.find(
//       (report) =>
//         report.id === item.accountId ||
//         report.code === item.accountCode ||
//         report.code === item.account?.accountCode
//     )
//     return {
//       ...item,
//       accountName:
//         item.accountName ||
//         item.account?.accountName ||
//         reportItem?.name ||
//         '-',
//       periodDebit: reportItem?.periodDebit || 0,
//       periodCredit: reportItem?.periodCredit || 0,
//       initialDebit: reportItem?.initialDebit || 0,
//       initialCredit: reportItem?.initialCredit || 0,
//       closingDebit: reportItem?.closingDebit || 0,
//       closingCredit: reportItem?.closingCredit || 0,
//     }
//   })

//   console.log('list data:', mergedData)

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Budget Report</h2>

//       {/* Filters */}
//       <div className="flex gap-4 items-center mb-4 flex-wrap">
//         {/* Budget Select */}
//         <Select value={selectedBudgetId} onValueChange={handleBudgetSelect}>
//           <SelectTrigger className="w-[200px]">
//             <SelectValue placeholder="Select a budget" />
//           </SelectTrigger>
//           <SelectContent>
//             {masterBudget
//               .filter(
//                 (budget) => budget.budgetId != null && budget.budgetId !== ''
//               )
//               .map((budget) => (
//                 <SelectItem
//                   key={budget.budgetId}
//                   value={budget.budgetId.toString()}
//                 >
//                   {budget.name}
//                 </SelectItem>
//               ))}
//           </SelectContent>
//         </Select>

//         {/* Company Select (readonly) */}
//         <Select value={selectedCompanyId} disabled>
//           <SelectTrigger className="w-[200px]">
//             <SelectValue placeholder="Company" />
//           </SelectTrigger>
//           <SelectContent>
//             {companies
//               .filter(
//                 (company) =>
//                   company.company.companyId != null &&
//                   company.company.companyId !== 0
//               )
//               .map((company) => (
//                 <SelectItem
//                   key={company.company.companyId}
//                   value={company.company.companyId.toString()}
//                 >
//                   {company.company.companyName}
//                 </SelectItem>
//               ))}
//           </SelectContent>
//         </Select>

//         {/* Start Date */}
//         <input
//           type="date"
//           className="border px-2 py-1 rounded w-[150px]"
//           value={format(startDate, 'yyyy-MM-dd')}
//           onChange={(e) => setStartDate(new Date(e.target.value))}
//           disabled
//         />

//         {/* End Date */}
//         <input
//           type="date"
//           className="border px-2 py-1 rounded w-[150px]"
//           value={format(endDate, 'yyyy-MM-dd')}
//           onChange={(e) => setEndDate(new Date(e.target.value))}
//           disabled
//         />
//       </div>

//       {/* Loading & Error */}
//       {loading && <div>Loading...</div>}
//       {error && <div className="text-red-500">{error}</div>}

//       {/* Budget Report Table */}
//       <table className="min-w-full border border-gray-300 mt-4">
//         <thead>
//           <tr className="bg-gray-100 text-center">
//             <th className="border px-4 py-2">Account Name</th>
//             <th className="border px-4 py-2">Budget Amount</th>
//             <th className="border px-4 py-2">Actual Amount</th>
//             <th className="border px-4 py-2">Percentage </th>
//           </tr>
//         </thead>
//         <tbody>
//           {mergedData.length === 0 && !loading ? (
//             <tr>
//               <td
//                 colSpan={9}
//                 className="border px-4 py-2 text-center text-gray-500"
//               >
//                 {selectedBudgetId
//                   ? 'No budget items found'
//                   : 'Please select a budget'}
//               </td>
//             </tr>
//           ) : (
//             mergedData.map((item, index) => (
//               <tr key={`${item.accountId}-${index}`} className="text-center">
//                 <td className="border px-4 py-2">
//                   {item.name || item.account?.name || '-'}
//                 </td>
//                 <td className="border px-4 py-2">
//                   {item.amount || item.budgetAmount || 0}
//                 </td>
//                 {/* <td className="border px-4 py-2">
//                   {item.periodDebit - item.periodCredit}
//                 </td> */}
//                  <td
//                   className={`border px-4 py-2 ${
//                     item.periodDebit - item.periodCredit >
//                     (item.amount || item.budgetAmount || 0)
//                       ? 'text-red-500 '
//                       : ''
//                   }`}
//                 >
//                   {item.periodDebit - item.periodCredit}
//                 </td>
//                 <td className="border px-4 py-2">
//                   {(() => {
//                     const A = item.periodDebit - item.periodCredit
//                     const B = item.amount || item.budgetAmount || 0
//                     if (B === 0) return '0%'
//                     const percentage = (A / B) * 100
//                     return `${percentage.toFixed(2)}%`
//                   })()}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// export default BudgetReport
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SingleTrialBalanceFind from './single-trial-balance-find'
import SingleTrialBalanceList from './single-trial-balance-list'
import type { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { toast } from '@/hooks/use-toast'
import { getAllCompanies } from '@/api/common-shared-api'

interface Company {
  id: number
  name: string
}

function formatDateString(dateStr: string) {
  try {
    const decodedStr = decodeURIComponent(dateStr).replace(/\+/g, ' ')
    let date = new Date(decodedStr)
    if (isNaN(date.getTime())) {
      const parts = decodedStr.split(' ')
      if (parts.length >= 4) {
        date = new Date(`${parts[1]} ${parts[2]} ${parts[3]}`)
      }
    }
    if (isNaN(date.getTime())) {
      const [month, day, year] = decodedStr.split('/')
      date = new Date(Number(year), Number(month) - 1, Number(day))
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }
}

export default function SingleTrialBalance() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  // 🟢 Store latest selected filter values
  const [filters, setFilters] = useState({
    accountcode: 0,
    fromdate: '',
    todate: '',
    companyId: 0,
    locationId: 0,
  })

  const { id } = useParams()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  const startDate = searchParams?.get('startDate') || ''
  const endDate = searchParams?.get('endDate') || ''
  const companyId = searchParams?.get('companyId') || ''
  const locationId = searchParams?.get('locationId') || ''
  const accountId = id ? String(id) : ''

  const formattedStartDate = formatDateString(startDate)
  const formattedEndDate = formatDateString(endDate)

  const fetchCompanies = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      const apiData = response.data || []
      const mappedCompanies = apiData.map((company: any) => ({
        id: company.companyId || company.id,
        name: company.companyName || company.name,
      }))
      setCompanies(mappedCompanies)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }, [token])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const flattenData = (data: GeneralLedgerType[]) => {
    return data.map((item) => ({
      VoucherNo: item.voucherno,
      Date: item.date,
      AccountName: item.accountname,
      Notes: item.notes,
      Partner: item.partner,
      CostCenter: item.coscenter,
      Department: item.department,
      Debit: item.debit != null ? Number(item.debit).toFixed(2) : '',
      Credit: item.credit != null ? Number(item.credit).toFixed(2) : '',
    }))
  }

  const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Single Trial Balance')
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
    document.body.classList.add('pdf-mode')
    setShowLogoInPdf(true)
    await new Promise((res) => setTimeout(res, 200))
    const canvas = await html2canvas(targetRef.current, {
      scale: 2,
      useCORS: true,
    })
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const marginTop = 90
    const marginBottom = 40
    const horizontalPadding = 30
    const usablePageHeight = pageHeight - marginTop - marginBottom
    const imgWidth = pageWidth - horizontalPadding * 2
    const scale = imgWidth / canvas.width
    let heightLeftPx = canvas.height
    let sourceY = 0
    let pageCount = 0
    while (heightLeftPx > 0) {
      const sliceHeightPx = Math.min(heightLeftPx, usablePageHeight / scale)
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCanvas.width = canvas.width
      tempCanvas.height = sliceHeightPx
      tempCtx?.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      )
      const imgDataSlice = tempCanvas.toDataURL('image/jpeg')
      if (pageCount > 0) pdf.addPage()
      pdf.addImage(
        imgDataSlice,
        'JPEG',
        horizontalPadding,
        marginTop,
        imgWidth,
        sliceHeightPx * scale
      )
      heightLeftPx -= sliceHeightPx
      sourceY += sliceHeightPx
      pageCount++
    }

    const totalPages = pdf.internal.pages.length - 1
    // 🟢 Use dynamic filters instead of static searchParams
    const selectedCompany = companies.find(
      (c) => c.id === Number(filters.companyId)
    )
    const companyName = selectedCompany?.name || 'Company Name'
    const dateRange =
      filters.fromdate && filters.todate
        ? `From ${filters.fromdate} To ${filters.todate}`
        : ''

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(14).setFont('bold')
      pdf.text(companyName, pageWidth / 2, 35, { align: 'center' })
      if (dateRange) {
        pdf.setFontSize(12).setFont('normal')
        pdf.text(dateRange, pageWidth / 2, 55, { align: 'center' })
      }
      pdf.setFontSize(10).setFont('normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - horizontalPadding - 50,
        pageHeight - marginBottom + 20
      )
    }
    pdf.save(`single_trial_balance.pdf`)
    document.body.classList.remove('pdf-mode')
    setShowLogoInPdf(false)
  }

  const generateExcel = () =>
    exportToExcel(transactions, 'single-trial-balance')

  const handlePrint = () => {
    const selectedCompany = companies.find(
      (c) => c.id === Number(filters.companyId)
    )
    const companyName = selectedCompany?.name || 'Company Name'
    const dateRange =
      filters.fromdate && filters.todate
        ? `From ${filters.fromdate} To ${filters.todate}`
        : ''

    const printContents = `
      <div style="text-align:center;margin-bottom:20px;">
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
      `<html><head><title>Print</title></head><body>${printContents}</body></html>`
    )
    newWin.document.close()
    newWin.focus()
    newWin.print()
    newWin.close()
  }

  const handleSearch = useCallback(
    async (
      accountcode: number,
      fromdate: string,
      todate: string,
      locationId: number,
      companyId: number
    ) => {
      if (!token) return
      setFilters({ accountcode, fromdate, todate, locationId, companyId }) // 🟢 Save latest filters
      const response = await getGeneralLedgerByDate({
        accountcode,
        fromdate,
        todate,
        companyId,
        locationId,
        token,
      })
      if (response.error) {
        toast({
          title: 'Alert',
          description: `transactions have No data`,
          variant: 'destructive',
        })
        setTransactions([])
      } else {
        setTransactions(response.data || [])
      }
    },
    [token]
  )

  useEffect(() => {
    if (
      id &&
      formattedStartDate &&
      formattedEndDate &&
      companyId &&
      locationId
    ) {
      handleSearch(
        Number(id),
        formattedStartDate,
        formattedEndDate,
        Number(locationId),
        Number(companyId)
      )
    }
  }, [
    id,
    formattedStartDate,
    formattedEndDate,
    companyId,
    locationId,
    handleSearch,
  ])

  return (
    <div className="space-y-4 container mx-auto mt-20">
      <SingleTrialBalanceFind
        initialAccountCode={accountId}
        initialFromDate={formattedStartDate}
        initialToDate={formattedEndDate}
        initialCompanyId={companyId ? Number(companyId) : undefined}
        initialLocationId={locationId ? Number(locationId) : undefined}
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        generatePrint={handlePrint}
      />
      <SingleTrialBalanceList
        transactions={transactions}
        targetRef={targetRef}
        showLogoInPdf={showLogoInPdf}
      />
    </div>
  )
}


// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import SingleTrialBalanceFind from './single-trial-balance-find'
// import SingleTrialBalanceList from './single-trial-balance-list'
// import type { GeneralLedgerType } from '@/utils/type'
// import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
// import { saveAs } from 'file-saver'
// import * as XLSX from 'xlsx'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { toast } from '@/hooks/use-toast'
// import { getAllCompanies } from '@/api/common-shared-api'

// interface Company {
//   id: number
//   name: string
// }

// // ✅ Safe date parser to prevent timezone shifts
// function formatDateString(dateStr: string) {
//   try {
//     if (!dateStr) return ''
//     const decodedStr = decodeURIComponent(dateStr).replace(/\+/g, ' ')
//     // Accept yyyy-mm-dd format directly
//     if (/^\d{4}-\d{2}-\d{2}$/.test(decodedStr)) return decodedStr
//     // Try mm/dd/yyyy format
//     const parts = decodedStr.split('/')
//     if (parts.length === 3) {
//       const [month, day, year] = parts
//       return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
//     }
//     // Fallback: split by spaces
//     const spaceParts = decodedStr.split(' ')
//     if (spaceParts.length >= 3) {
//       const day = spaceParts[1]
//       const month = new Date(`${spaceParts[0]} 1, 2000`).getMonth() + 1
//       const year = spaceParts[2]
//       return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`
//     }
//     return decodedStr
//   } catch (e) {
//     console.error('Error formatting date:', e)
//     return ''
//   }
// }

// export default function SingleTrialBalance() {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()
//   const targetRef = useRef<HTMLDivElement>(null)
//   const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])
//   const [showLogoInPdf, setShowLogoInPdf] = useState(false)
//   const [companies, setCompanies] = useState<Company[]>([])

//   const [filters, setFilters] = useState({
//     accountcode: 0,
//     fromdate: '',
//     todate: '',
//     companyId: 0,
//     locationId: 0,
//   })

//   const { id } = useParams()
//   const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setSearchParams(new URLSearchParams(window.location.search))
//     }
//   }, [])

//   const startDate = searchParams?.get('startDate') || ''
//   const endDate = searchParams?.get('endDate') || ''
//   const companyId = searchParams?.get('companyId') || ''
//   const locationId = searchParams?.get('locationId') || ''
//   const accountId = id ? String(id) : ''

//   // ✅ Use safe date parser
//   console.log('start Date',startDate)
//   console.log('end Date',endDate)
//   const formattedStartDate = formatDateString(startDate)
//   const formattedEndDate = formatDateString(endDate)

//   const fetchCompanies = useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getAllCompanies(token)
//       const apiData = response.data || []
//       const mappedCompanies = apiData.map((company: any) => ({
//         id: company.companyId || company.id,
//         name: company.companyName || company.name,
//       }))
//       setCompanies(mappedCompanies)
//     } catch (error) {
//       console.error('Error fetching companies:', error)
//     }
//   }, [token])

//   useEffect(() => {
//     fetchCompanies()
//   }, [fetchCompanies])

//   const flattenData = (data: GeneralLedgerType[]) => {
//     return data.map((item) => ({
//       VoucherNo: item.voucherno,
//       Date: item.date,
//       AccountName: item.accountname,
//       Notes: item.notes,
//       Partner: item.partner,
//       CostCenter: item.coscenter,
//       Department: item.department,
//       Debit: item.debit != null ? Number(item.debit).toFixed(2) : '',
//       Credit: item.credit != null ? Number(item.credit).toFixed(2) : '',
//     }))
//   }

//   const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
//     const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Single Trial Balance')
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: 'xlsx',
//       type: 'array',
//     })
//     const blob = new Blob([excelBuffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
//     })
//     saveAs(blob, `${fileName}.xlsx`)
//   }

//   const generatePdf = async () => {
//     if (!targetRef.current) return
//     document.body.classList.add('pdf-mode')
//     setShowLogoInPdf(true)
//     await new Promise((res) => setTimeout(res, 200))
//     const canvas = await html2canvas(targetRef.current, {
//       scale: 2,
//       useCORS: true,
//     })
//     const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
//     const pageWidth = pdf.internal.pageSize.getWidth()
//     const pageHeight = pdf.internal.pageSize.getHeight()
//     const marginTop = 90
//     const marginBottom = 40
//     const horizontalPadding = 30
//     const usablePageHeight = pageHeight - marginTop - marginBottom
//     const imgWidth = pageWidth - horizontalPadding * 2
//     const scale = imgWidth / canvas.width
//     let heightLeftPx = canvas.height
//     let sourceY = 0
//     let pageCount = 0
//     while (heightLeftPx > 0) {
//       const sliceHeightPx = Math.min(heightLeftPx, usablePageHeight / scale)
//       const tempCanvas = document.createElement('canvas')
//       const tempCtx = tempCanvas.getContext('2d')
//       tempCanvas.width = canvas.width
//       tempCanvas.height = sliceHeightPx
//       tempCtx?.drawImage(
//         canvas,
//         0,
//         sourceY,
//         canvas.width,
//         sliceHeightPx,
//         0,
//         0,
//         canvas.width,
//         sliceHeightPx
//       )
//       const imgDataSlice = tempCanvas.toDataURL('image/jpeg')
//       if (pageCount > 0) pdf.addPage()
//       pdf.addImage(
//         imgDataSlice,
//         'JPEG',
//         horizontalPadding,
//         marginTop,
//         imgWidth,
//         sliceHeightPx * scale
//       )
//       heightLeftPx -= sliceHeightPx
//       sourceY += sliceHeightPx
//       pageCount++
//     }

//     const totalPages = pdf.internal.pages.length - 1
//     const selectedCompany = companies.find(
//       (c) => c.id === Number(filters.companyId)
//     )
//     const companyName = selectedCompany?.name || 'Company Name'
//     const dateRange =
//       filters.fromdate && filters.todate
//         ? `From ${filters.fromdate} To ${filters.todate}`
//         : ''

//     for (let i = 1; i <= totalPages; i++) {
//       pdf.setPage(i)
//       pdf.setFontSize(14).setFont('bold')
//       pdf.text(companyName, pageWidth / 2, 35, { align: 'center' })
//       if (dateRange) {
//         pdf.setFontSize(12).setFont('normal')
//         pdf.text(dateRange, pageWidth / 2, 55, { align: 'center' })
//       }
//       pdf.setFontSize(10).setFont('normal')
//       pdf.text(
//         `Page ${i} of ${totalPages}`,
//         pageWidth - horizontalPadding - 50,
//         pageHeight - marginBottom + 20
//       )
//     }
//     pdf.save(`single_trial_balance.pdf`)
//     document.body.classList.remove('pdf-mode')
//     setShowLogoInPdf(false)
//   }

//   const generateExcel = () =>
//     exportToExcel(transactions, 'single-trial-balance')

//   const handlePrint = () => {
//     const selectedCompany = companies.find(
//       (c) => c.id === Number(filters.companyId)
//     )
//     const companyName = selectedCompany?.name || 'Company Name'
//     const dateRange =
//       filters.fromdate && filters.todate
//         ? `From ${filters.fromdate} To ${filters.todate}`
//         : ''

//     const printContents = `
//       <div style="text-align:center;margin-bottom:20px;">
//         <h2>${companyName}</h2>
//         <div>${dateRange}</div>
//       </div>
//       ${targetRef.current?.innerHTML || ''}
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
//       `<html><head><title>Print</title></head><body>${printContents}</body></html>`
//     )
//     newWin.document.close()
//     newWin.focus()
//     newWin.print()
//     newWin.close()
//   }

//   const handleSearch = useCallback(
//     async (
//       accountcode: number,
//       fromdate: string,
//       todate: string,
//       locationId: number,
//       companyId: number
//     ) => {
//       if (!token) return
//       setFilters({ accountcode, fromdate, todate, locationId, companyId })
//       const response = await getGeneralLedgerByDate({
//         accountcode,
//         fromdate,
//         todate,
//         companyId,
//         locationId,
//         token,
//       })
//       if (response.error) {
//         toast({
//           title: 'Alert',
//           description: `transactions have No data`,
//           variant: 'destructive',
//         })
//         setTransactions([])
//       } else {
//         setTransactions(response.data || [])
//       }
//     },
//     [token]
//   )

//   useEffect(() => {
//     if (
//       id &&
//       formattedStartDate &&
//       formattedEndDate &&
//       companyId &&
//       locationId
//     ) {
//       handleSearch(
//         Number(id),
//         formattedStartDate,
//         formattedEndDate,
//         Number(locationId),
//         Number(companyId)
//       )
//     }
//   }, [
//     id,
//     formattedStartDate,
//     formattedEndDate,
//     companyId,
//     locationId,
//     handleSearch,
//   ])

//   return (
//     <div className="space-y-4 container mx-auto mt-20">
//       <SingleTrialBalanceFind
//         initialAccountCode={accountId}
//         initialFromDate={formattedStartDate}
//         initialToDate={formattedEndDate}
//         initialCompanyId={companyId ? Number(companyId) : undefined}
//         initialLocationId={locationId ? Number(locationId) : undefined}
//         onSearch={handleSearch}
//         generatePdf={generatePdf}
//         generateExcel={generateExcel}
//         generatePrint={handlePrint}
//       />
//       <SingleTrialBalanceList
//         transactions={transactions}
//         targetRef={targetRef}
//         showLogoInPdf={showLogoInPdf}
//       />
//     </div>
//   )
// }

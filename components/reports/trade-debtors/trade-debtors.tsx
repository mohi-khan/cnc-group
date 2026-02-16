

'use client'
import { getAllTradeDebtors } from '@/api/trade-debtors-api'
import type { GetTradeDebtorsType } from '@/utils/type'
import React, { useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { File, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getAllCompanies } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const TradeDebtors = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const [tradeDebtors, setTradeDebtors] = React.useState<GetTradeDebtorsType[]>(
    []
  )
  const [companies, setCompanies] = React.useState<CompanyType[]>([])
  const [selectedCompanyName, setSelectedCompanyName] =
    React.useState<string>('')
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<
    number | null
  >(null)
  const [toDate, setToDate] = React.useState<string>(
    new Date().toISOString().split('T')[0] // Default to today's date
  )

  const generatePdf = async () => {
    const element = document.getElementById('trade-debtors-content')
    if (!element) return

    try {
      // Create canvas with normal scale for readable fonts
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.8) // Using JPEG with 80% quality
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calculate scaling to fit page width while maintaining aspect ratio
      const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * scale

      const margin = 10
      const contentWidth = pdfWidth - 2 * margin
      const contentHeight = pdfHeight - 2 * margin

      if (scaledHeight <= contentHeight) {
        // Content fits on one page
        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          margin,
          contentWidth,
          scaledHeight
        )
      } else {
        // Content needs multiple pages
        const pageHeight = contentHeight
        const totalPages = Math.ceil(scaledHeight / pageHeight)

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage()

          // Add company name header on each page
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          const companyName = selectedCompanyName || 'All Companies'
          pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

          pdf.setFontSize(14)
          pdf.text('Trade Debtors', pdfWidth / 2, 25, { align: 'center' })

          // Calculate the portion of image for this page
          const sourceY = (i * pageHeight) / scale / 0.264583
          const sourceHeight = Math.min(
            pageHeight / scale / 0.264583,
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
            const pageImgData = tempCanvas.toDataURL('image/jpeg')
            pdf.addImage(
              pageImgData,
              'JPEG',
              margin,
              35,
              contentWidth,
              sourceHeight * 0.264583 * scale
            )
          }
        }
      }

      pdf.save('trade_debtors.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const fetchTradeDebtors = useCallback(async () => {
    if (!token) return

    // If no company is selected, fetch for all companies or skip
    // You may need to adjust this logic based on your backend requirements
    if (!selectedCompanyId) {
      // Option 1: Fetch all companies' data by calling API multiple times
      // Option 2: Use a special companyId like 0 or -1 for "all companies"
      // For now, we'll return early if no company is selected
      setTradeDebtors([])
      return
    }

    const response = await getAllTradeDebtors(token, toDate, selectedCompanyId)
    setTradeDebtors(response.data || [])
    console.log('🚀 ~ TradeDebtors ~ response.data:', response.data)
  }, [token, toDate, selectedCompanyId])

  const fetchCompanies = useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setCompanies(response.data || [])
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchCompanies()
  }, [fetchCompanies, router])

  useEffect(() => {
    fetchTradeDebtors()
  }, [fetchTradeDebtors])

  const filteredTradeDebtors = tradeDebtors

  const exportToExcel = (data: GetTradeDebtorsType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trade Debtors')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: GetTradeDebtorsType[]): any[] => {
    return data.map((item) => ({
      partnerName: item.partnerName,
      balanceCurrentYear: item.balanceCurrentYear,
      balanceLastYear: item.balanceLastYear,
    }))
  }

  const generateExcel = () => {
    exportToExcel(tradeDebtors, 'trade-debtors')
  }

  return (
    <div className="mt-10 mx-20">
      <div className="mb-4 flex  items-center justify-center gap-4 w-full">
        <div className="w-96">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-96">
          <label className="block text-sm font-medium mb-2">
            Select Company
          </label>
          <CustomCombobox
            items={companies.map((company) => {
              return {
                id: company.companyId?.toString() || '',
                name: company.companyName || 'Unnamed Company',
              }
            })}
            value={
              selectedCompanyName
                ? {
                    id:
                      companies
                        .find((c) => c.companyName === selectedCompanyName)
                        ?.companyId?.toString() || '',
                    name: selectedCompanyName,
                  }
                : null
            }
            onChange={(value) => {
              setSelectedCompanyName(value ? value.name : '')
              setSelectedCompanyId(value ? parseInt(value.id) : null)
            }}
            placeholder="Select company"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          disabled={!selectedCompanyId}
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">PDF</span>
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
          disabled={!selectedCompanyId}
        >
          <File className="h-4 w-4" />
          <span className="font-medium">Excel</span>
        </Button>
      </div>
      <div id="trade-debtors-content" className="overflow-x-auto mx-4 max-h-[500px]">
        <h1 className="text-3xl font-bold mb-4 flex justify-center">
          {selectedCompanyName || 'Select a Company'}
        </h1>
        <h2 className="text-2xl font-bold mb-4">Trade Debtors</h2>
        <Table className="border shadow-md pdf-table-header">
          <TableHeader className="bg-slate-200 sticky top-0 shadow-md">
            <TableRow className="mb-4">
              <TableHead>Partner Name</TableHead>
              <TableHead>Balance Current Year</TableHead>
              <TableHead>Balance Last Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTradeDebtors.length > 0 ? (
              filteredTradeDebtors.map((debtor) => (
                <TableRow key={debtor.partnerId}>
                  <TableCell>{debtor.partnerName}</TableCell>
                  <TableCell>{debtor.balanceCurrentYear}</TableCell>
                  <TableCell>{debtor.balanceLastYear}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500"
                >
                  {selectedCompanyId
                    ? 'No data available'
                    : 'Please select a company to view trade debtors'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TradeDebtors


// 'use client'
// import { getAllTradeDebtors } from '@/api/trade-debtors-api'
// import type { GetTradeDebtorsType } from '@/utils/type'
// import React, { useEffect, useCallback } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Button } from '@/components/ui/button'
// import type { CompanyType } from '@/api/company-api'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import { File, FileText } from 'lucide-react'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'
// import { getAllCompanies } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import { string } from 'zod'

// const TradeDebtors = () => {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()
//   const [tradeDebtors, setTradeDebtors] = React.useState<GetTradeDebtorsType[]>(
//     []
//   )
//   const [companies, setCompanies] = React.useState<CompanyType[]>([])
//   const [selectedCompanyName, setSelectedCompanyName] =
//     React.useState<string>('')

//   const generatePdf = async () => {
//     const element = document.getElementById('trade-debtors-content')
//     if (!element) return

//     try {
//       // Create canvas with normal scale for readable fonts
//       const canvas = await html2canvas(element, {
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: '#ffffff',
//         logging: false,
//       })

//       const imgData = canvas.toDataURL('image/jpeg', 0.8) // Using JPEG with 80% quality
//       const pdf = new jsPDF('p', 'mm', 'a4')

//       const pdfWidth = pdf.internal.pageSize.getWidth()
//       const pdfHeight = pdf.internal.pageSize.getHeight()
//       const imgWidth = canvas.width
//       const imgHeight = canvas.height

//       // Calculate scaling to fit page width while maintaining aspect ratio
//       const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
//       const scaledHeight = imgHeight * 0.264583 * scale

//       const margin = 10
//       const contentWidth = pdfWidth - 2 * margin
//       const contentHeight = pdfHeight - 2 * margin

//       if (scaledHeight <= contentHeight) {
//         // Content fits on one page
//         pdf.addImage(
//           imgData,
//           'JPEG',
//           margin,
//           margin,
//           contentWidth,
//           scaledHeight
//         )
//       } else {
//         // Content needs multiple pages
//         const pageHeight = contentHeight
//         const totalPages = Math.ceil(scaledHeight / pageHeight)

//         for (let i = 0; i < totalPages; i++) {
//           if (i > 0) pdf.addPage()

//           // Add company name header on each page
//           pdf.setFontSize(16)
//           pdf.setFont('helvetica', 'bold')
//           const companyName = selectedCompanyName || 'All Companies'
//           pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

//           pdf.setFontSize(14)
//           pdf.text('Trade Debtors', pdfWidth / 2, 25, { align: 'center' })

//           // Calculate the portion of image for this page
//           const sourceY = (i * pageHeight) / scale / 0.264583
//           const sourceHeight = Math.min(
//             pageHeight / scale / 0.264583,
//             imgHeight - sourceY
//           )

//           // Create temporary canvas for this page slice
//           const tempCanvas = document.createElement('canvas')
//           const tempCtx = tempCanvas.getContext('2d')
//           tempCanvas.width = imgWidth
//           tempCanvas.height = sourceHeight

//           if (tempCtx) {
//             tempCtx.drawImage(
//               canvas,
//               0,
//               sourceY,
//               imgWidth,
//               sourceHeight,
//               0,
//               0,
//               imgWidth,
//               sourceHeight
//             )
//             const pageImgData = tempCanvas.toDataURL('image/jpeg')
//             pdf.addImage(
//               pageImgData,
//               'JPEG',
//               margin,
//               35,
//               contentWidth,
//               sourceHeight * 0.264583 * scale
//             )
//           }
//         }
//       }

//       pdf.save('trade_debtors.pdf')
//     } catch (error) {
//       console.error('Error generating PDF:', error)
//     }
//   }

//   const fetchTradeDebtors = useCallback(async () => {
//     if (!token) return
//     const response = await getAllTradeDebtors(token)

//     setTradeDebtors(response.data || [])
//     console.log("🚀 ~ TradeDebtors ~ response.data:", response.data)
//   }, [token])

//   const fetchCompanies = useCallback(async () => {
//     if (!token) return
//     const response = await getAllCompanies(token)

//     setCompanies(response.data || [])
//   }, [token])
//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')

//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }

//     checkUserData()
//     fetchTradeDebtors()
//     fetchCompanies()
//   }, [fetchTradeDebtors, fetchCompanies, token, router])

//   const filteredTradeDebtors = selectedCompanyName
//     ? tradeDebtors.filter(
//         (debtor) => debtor.companyName === selectedCompanyName
//       )
//     : tradeDebtors

//   const exportToExcel = (data: GetTradeDebtorsType[], fileName: string) => {
//     const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance')
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: 'xlsx',
//       type: 'array',
//     })
//     const blob = new Blob([excelBuffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
//     })
//     saveAs(blob, `${fileName}.xlsx`)
//   }

//   const flattenData = (data: GetTradeDebtorsType[]): any[] => {
//     return data.map((item) => ({
//       partnerName: item.partnerName,
//       crebalanceCurrentYeardit: item.balanceCurrentYear,
//       balanceLastYear: item.balanceLastYear,
//     }))
//   }

//   const generateExcel = () => {
//     exportToExcel(tradeDebtors, 'trade-debtors')
//   }

//   return (
//     <div className="mt-10 mx-20 ">
//       <div className="mb-4 flex justify-center w-full">
//         <div className="w-96">
//           <CustomCombobox
//             items={companies.map((company) => {
//               return {
//                 id: company.companyId?.toString() || '',
//                 name: company.companyName || 'Unnamed Company',
//               }
//             })}
//             value={
//               selectedCompanyName
//                 ? {
//                     id:
//                       companies
//                         .find((c) => c.companyName === selectedCompanyName)
//                         ?.companyId?.toString() || '',
//                     name: selectedCompanyName,
//                   }
//                 : null
//             }
//             onChange={(value) =>
//               setSelectedCompanyName(value ? value.name : '')
//             }
//             placeholder="Select company"
//           />
//         </div>
//       </div>
//       <div className="flex gap-2 mb-4">
//         <Button
//           onClick={generatePdf}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
//         >
//           <FileText className="h-4 w-4" />
//           <span className="font-medium">PDF</span>
//         </Button>
//         <Button
//           onClick={generateExcel}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
//         >
//           <File />
//           <span className="font-medium">Excel</span>
//         </Button>
//       </div>
//       <div id="trade-debtors-content" className="overflow-x-auto mx-4">
//         <h1 className="text-3xl font-bold mb-4 flex justify-center">
//           {selectedCompanyName || 'All Companies'}
//         </h1>
//         <h2 className="text-2xl font-bold mb-4">Trade Debtors</h2>
//         <Table className="border shadow-md pdf-table-header">
//           <TableHeader className="bg-slate-200 sticky top- shadow-md">
//             <TableRow className="mb-4">
//               <TableHead>Partner Name</TableHead>
//               <TableHead>Balance Current Year</TableHead>
//               <TableHead>Balance Last Year</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredTradeDebtors.map((debtor) => (
//               <TableRow key={debtor.partnerId}>
//                 <TableCell>{debtor.partnerName}</TableCell>
//                 <TableCell>{debtor.balanceCurrentYear}</TableCell>
//                 <TableCell>{debtor.balanceLastYear}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

// export default TradeDebtors
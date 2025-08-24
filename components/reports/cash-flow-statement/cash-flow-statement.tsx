'use client'
import { useState, useEffect, useRef } from 'react'
import type { CashflowStatement } from '@/utils/type'
import { getCashFowStatement } from '@/api/cash-flow-statement-api'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import CashFlowStatementHeading from './cash-flow-statement-heading'
import CashFlowStatementTableData from './cash-flow-statement-tabledata'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const CashFlowStatement = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [cashFlowStatements, setCashFlowStatements] = useState<
    CashflowStatement[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
      // Get company name for header
      let companyName = selectedCompanyName || 'Cash Flow Statement'

      if (companyId && userData?.userCompanies) {
        const company = userData.userCompanies.find(
          (c) => c.company.companyId?.toString() === companyId
        )
        if (company) {
          companyName = company.company.companyName || 'Cash Flow Statement'
        }
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

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

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
            0,
            headerHeight,
            pdfWidth,
            sourceHeight * scale * 0.264583
          )
        }

        yPosition += pageContentHeight
        pageNumber++
      }

      pdf.save('cash-flow-statement.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const exportToExcel = (data: CashflowStatement[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Flow Statement')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: CashflowStatement[]): any[] => {
    return data.map((item) => ({
      debit: item.credit,
      credit: item.credit,
      cashflowTag: item.cashflowTag,
    }))
  }

  const generateExcel = () => {
    exportToExcel(cashFlowStatements, 'cash-flow-statement')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)

    if (newCompanyId && userData?.userCompanies) {
      const company = userData.userCompanies.find(
        (c) => c.company.companyId?.toString() === newCompanyId
      )
      if (company) {
        setSelectedCompanyName(company.company.companyName || '')
      }
    }
  }

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

    if (startDate && endDate && companyId) {
      const fetchData = async () => {
        const response = await getCashFowStatement({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          companyid: companyId,
          token,
        })

        setCashFlowStatements(response.data || [])
      }
      fetchData()
    }
  }, [startDate, endDate, companyId, token, router])

  return (
    <div>
      <CashFlowStatementHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CashFlowStatementTableData
        targetRef={targetRef}
        cashFlowStatements={cashFlowStatements}
      />
    </div>
  )
}

export default CashFlowStatement

'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCashReport } from '@/api/cash-report-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import type {
  CompanyFromLocalstorage,
  Employee,
  GetCashReport,
  User,
  LocationFromLocalstorage,
} from '@/utils/type'
import { getEmployee } from '@/api/common-shared-api'
import CashReportHeading from './cash-report-heading'
import CashReportList from './cash-report-list'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function CashReport() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [cashReport, setCashReport] = useState<GetCashReport[]>([])
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [companyId, setCompanyId] = useState<number | undefined>()
  const [location, setLocation] = useState<number>()
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const generatePdf = async () => {
    setIsGeneratingPdf(true)

    try {
      const element = document.getElementById('cash-report-content')
      if (!element) return

      // Get company name for header
      const selectedCompany = companies.find(
        (c) => c.company?.companyId === companyId
      )
      const companyName = selectedCompany?.company?.companyName || 'Cash Report'

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

      // Calculate scaling to fit page width
      const scale = pdfWidth / imgWidth
      const scaledHeight = imgHeight * scale

      // Header height for company name
      const headerHeight = 20
      const availableHeight = pdfHeight - headerHeight - 10

      let yPosition = 0
      let pageNumber = 1

      // Add company name header on first page
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

      if (scaledHeight <= availableHeight) {
        // Content fits on one page
        pdf.addImage(imgData, 'JPEG', 0, headerHeight, pdfWidth, scaledHeight)
      } else {
        // Content needs multiple pages
        while (yPosition < scaledHeight) {
          if (pageNumber > 1) {
            pdf.addPage()
            // Add company name header on each page
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })
          }

          const remainingHeight = scaledHeight - yPosition
          const pageContentHeight = Math.min(availableHeight, remainingHeight)

          // Calculate source coordinates for this page
          const sourceY = yPosition / scale
          const sourceHeight = pageContentHeight / scale

          // Add the image portion for this page
          pdf.addImage(
            imgData,
            'JPEG',
            0,
            headerHeight,
            pdfWidth,
            pageContentHeight
          )

          // Add page number
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`Page ${pageNumber}`, pdfWidth - 20, pdfHeight - 5)

          yPosition += pageContentHeight
          pageNumber++
        }
      }

      pdf.save(`cash-report-${date}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPdf(false)
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

    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
    }
  }, [userData, router])

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    const response = await getEmployee(token)
    setEmployees(response.data || [])
  }, [token])

  const fetchCashReport = useCallback(async () => {
    if (!token) return
    const CashReportParams = {
      date,
      companyId: companyId !== undefined ? companyId : 0,
      location: location !== undefined ? location : 0,
    }
    const respons = await getCashReport(CashReportParams, token)
    setCashReport(
      Array.isArray(respons.data)
        ? respons.data
        : respons.data
          ? [respons.data]
          : []
    )
  }, [token, date, companyId, location])

  useEffect(() => {
    fetchCashReport()
    fetchEmployees()
  }, [fetchCashReport, fetchEmployees])

  const exportToExcel = (data: GetCashReport[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Report')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: GetCashReport[]): any[] => {
    return data.flatMap((report) => {
      const rows = []

      if (report.openingBal && report.openingBal.length > 0) {
        rows.push({
          date: '',
          voucherId: '',
          currentAccountName: 'Opening Balance',
          debit: '',
          credit: '',
          oppositeAccountName: '',
          narration: '',
          balance: report.openingBal[0].balance,
        })
      }

      report.transactionData.forEach((transaction) => {
        rows.push({
          date: transaction.date,
          voucherId: transaction.voucherId,
          currentAccountName: transaction.currentAccountName,
          debit: transaction.debit,
          credit: transaction.credit,
          oppositeAccountName: transaction.oppositeAccountName,
          narration: transaction.narration,
        })
      })

      if (report.closingBal && report.closingBal.length > 0) {
        rows.push({
          date: '',
          voucherId: '',
          currentAccountName: 'Closing Balance',
          debit: '',
          credit: '',
          oppositeAccountName: '',
          narration: '',
          balance: report.closingBal[0].balance,
        })
      }

      report.IouBalance.forEach((iou) => {
        rows.push({
          date: iou.dateIssued,
          voucherId: iou.iouId,
          currentAccountName: 'IOU Balance',
          debit: iou.amount,
          credit: iou.totalAdjusted || '',
          oppositeAccountName: `Employee ID: ${iou.employeeId}`,
          narration: 'IOU Transaction',
        })
      })

      return rows
    })
  }

  const generateExcel = () => {
    exportToExcel(cashReport, 'cash-report')
  }

  const getEmployeeName = (id: number) => {
    const employee = employees.find((emp) => Number(emp.id) === id)
    return employee ? employee.employeeName : id.toString()
  }

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4 text-center">Cash Report</h1>

      <CashReportHeading
        generatePdf={generatePdf}
        date={date}
        setDate={setDate}
        companies={companies}
        setCompanies={setCompanies}
        locations={locations}
        setLocations={setLocations}
        companyId={companyId}
        setCompanyId={setCompanyId}
        location={location}
        setLocation={setLocation}
        generateExcel={generateExcel}
      />

      <div id="cash-report-content">
        <CashReportList
          cashReport={cashReport}
          date={date}
          setDate={setDate}
          companyId={companyId}
          location={location}
          getEmployeeName={getEmployeeName}
          isGeneratingPdf={isGeneratingPdf}
        />
      </div>
    </div>
  )
}

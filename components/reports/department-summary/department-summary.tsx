'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Department,
  DepartmentSummaryType,
  CompanyFromLocalstorage,
} from '@/utils/type'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import DeparmentSummaryHeading from './department-summary-heading'
import DepartmentSummaryTableData from './department-summary-table-data'
import {
  getAllDepartments,
  getDepartmentSummary,
} from '@/api/department-summary-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const DepartmentSummary = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [departmentSummary, setDepartmentSummary] = useState<
    DepartmentSummaryType[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [department, setDepartment] = useState<Department[]>([])
  const [departmentId, setDepartmentId] = useState<string>('')

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
      // Get company name
      const selectedCompany = userData?.userCompanies?.find(
        (company: CompanyFromLocalstorage) =>
          company.company.companyId === Number(companyId)
      )
      const companyName =
        selectedCompany?.company.companyName || 'Company Report'

      const canvas = await html2canvas(targetRef.current, {
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
        const remainingHeight = Math.min(
          pageContentHeight,
          scaledHeight - yPosition
        )

        pdf.addImage(
          imgData,
          'JPEG',
          0,
          headerHeight,
          pdfWidth,
          remainingHeight,
          undefined,
          'FAST'
        )

        yPosition += pageContentHeight
        pageNumber++
      }

      pdf.save('department-summary.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const exportToExcel = (data: DepartmentSummaryType[], fileName: string) => {
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

  const flattenData = (data: DepartmentSummaryType[]): any[] => {
    return data?.map((item) => ({
      departnmentName: item.departmentName,
      accountName: item.accountName,
      totalDebit: item.totalDebit,
      totalCredit: item.totalCredit,
    }))
  }

  const generateExcel = () => {
    exportToExcel(departmentSummary, 'department-summary')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string,
    newDepartmentId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
    setDepartmentId(newDepartmentId)
  }

  const fetchAllCostCenter = useCallback(async () => {
    if (!token) return
    const respons = await getAllDepartments(token)
    setDepartment(
      (respons.data || []).map((item) => ({
        ...item,
        startDate: item.startDate || undefined,
        endDate: item.endDate || undefined,
      }))
    )
  }, [token])
  const fetchData = useCallback(async () => {
    if (!token) return
    const response = await getDepartmentSummary({
      fromdate: startDate ? startDate.toISOString().split('T')[0] : '',
      enddate: endDate ? endDate.toISOString().split('T')[0] : '',
      departmentId: departmentId,
      companyid: companyId,
      token: token,
    })
    if (response.data) {
      const formattedData = response.data.map((item: any) => ({
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        accountId: item.accountId,
        accountName: item.accountName,
        totalDebit: item.totalDebit,
        totalCredit: item.totalCredit,
      }))
      setDepartmentSummary(formattedData)
    } else {
      setDepartmentSummary([])
    }
  }, [startDate, endDate, companyId, departmentId, token])

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
    if (startDate && endDate && companyId && departmentId) {
      fetchData()
      fetchAllCostCenter()
    }
  }, [
    startDate,
    endDate,
    companyId,
    departmentId,
    fetchData,
    fetchAllCostCenter,
    router,
  ])
  return (
    <div>
      <DeparmentSummaryHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <DepartmentSummaryTableData
        targetRef={targetRef}
        data={departmentSummary}
        startDate={startDate}
        endDate={endDate}
        companyId={companyId}
        departmentId={departmentId}
      />
    </div>
  )
}

export default DepartmentSummary

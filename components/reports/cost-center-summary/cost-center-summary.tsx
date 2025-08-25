'use client'
import CostCenterSummaryHeading from './cost-center-summary-heading'
import CostCenterSummaryTableData from './cost-center-summary-table-data'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { CostCenter, CostCenterSummaryType } from '@/utils/type'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getCostCenterSummary } from '@/api/cost-center-summary-api'
import { getAllCostCenters } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const CostCenterSummary = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const [costCenterSummary, setCostCenterSummary] = useState<
    CostCenterSummaryType[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [costCenterId, setCostCenterId] = useState<string>('')
  const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
      // Get company name
      let companyName = 'Cost Center Summary'
      if (userData && companyId) {
        const selectedCompany = userData.userCompanies.find(
          (uc) => uc.company.companyId === Number(companyId)
        )
        if (selectedCompany) {
          companyName = selectedCompany.company.companyName
        }
      }

      const element = targetRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL('image/jpeg')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calculate scaling to fit width while maintaining aspect ratio
      const ratio = pdfWidth / imgWidth
      const scaledHeight = imgHeight * ratio

      // Header height for company name
      const headerHeight = 20
      const availableHeight = pdfHeight - headerHeight - 10

      let yPosition = 0
      let pageNumber = 1

      while (yPosition < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
        }

        // Add company name header on each page
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

        // Calculate the portion of image to show on this page
        const sourceY = yPosition / ratio
        const sourceHeight = Math.min(
          availableHeight / ratio,
          imgHeight - sourceY
        )
        const destHeight = sourceHeight * ratio

        // Add the image portion to PDF
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          headerHeight,
          pdfWidth,
          destHeight
        )

        yPosition += availableHeight
        pageNumber++
      }

      pdf.save('cost-center-summary.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const exportToExcel = (data: CostCenterSummaryType[], fileName: string) => {
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

  const flattenData = (data: CostCenterSummaryType[]): any[] => {
    return data?.map((item) => ({
      costCenterName: item.costCenterName,
      accountName: item.accountName,
      totalDebit: item.totalDebit,
      totalCredit: item.totalCredit,
    }))
  }

  const generateExcel = () => {
    exportToExcel(costCenterSummary, 'cost-center-summary')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string,
    newCostCenterId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
    setCostCenterId(newCostCenterId)
  }

  const fetchAllCostCenter = useCallback(async () => {
    if (!token) return
    const respons = await getAllCostCenters(token)
    setCostCenterData(respons.data || [])
  }, [token])

  const fetchData = useCallback(async () => {
    if (!token) return
    const response = await getCostCenterSummary({
      fromdate: startDate ? startDate.toISOString().split('T')[0] : '',
      enddate: endDate ? endDate.toISOString().split('T')[0] : '',
      costCenterId: costCenterId,
      companyid: companyId,
      token: token,
    })
    if (response.data) {
      const formattedData = response.data.map((item) => ({
        costCenterId: item.costCenterId,
        costCenterName: item.costCenterName,
        accountId: item.accountId,
        accountName: item.accountName,
        totalDebit: item.totalDebit,
        totalCredit: item.totalCredit,
      }))
      setCostCenterSummary(formattedData)
    } else {
      setCostCenterSummary([])
    }
  }, [token, startDate, endDate, companyId, costCenterId])
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
      fetchData()
      fetchAllCostCenter()
    }
  }, [startDate, endDate, companyId, fetchData, fetchAllCostCenter, router])
  return (
    <div>
      <CostCenterSummaryHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CostCenterSummaryTableData
        targetRef={targetRef}
        data={costCenterSummary}
        startDate={startDate}
        endDate={endDate}
        costCenterId={costCenterId}
        companyId={companyId}
      />
    </div>
  )
}

export default CostCenterSummary

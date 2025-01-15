'use client'
import CostCenterSummaryHeading from './cost-center-summary-heading'
import CostCenterSummaryTableData from './cost-center-summary-table-data'
import React, { useState, useEffect } from 'react'
import { CashflowStatement, CostCenterSummaryType } from '@/utils/type'
import { getCashFowStatement } from '@/api/cash-flow-statement-api'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const CostCenterSummary = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'cost_center_summary.pdf' })
  const [costCenterSummary, setCostCenterSummary] = useState<
    CashflowStatement[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')

  const generatePdf = () => {
    toPDF()
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
    return data.map((item) => ({
      costCneterId: item.costCenterId,
      costCenterName: item.costCenterName,
      accoundId: item.accountId,
      accountName: item.accountName,
      totalDebit: item.totalDebit,
      totalCredit: item.totalCredit,
    }))
  }

  const generateExcel = () => {
    exportToExcel(setCostCenterSummary, 'cost-center-summary')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
  }

  useEffect(() => {
    if (startDate && endDate && companyId) {
      const fetchData = async () => {
        const response = await getCashFowStatement({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          companyid: companyId,
        })
        setCostCenterSummary(response.data || [])
        console.log('this is from getcash flow data : ', response.data || [])
      }
      fetchData()
    }
  }, [startDate, endDate, companyId])
  return (
    <div>
      <h1>I am come from Cost Center Summary Components</h1>
      <CostCenterSummaryHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CostCenterSummaryTableData />
    </div>
  )
}

export default CostCenterSummary

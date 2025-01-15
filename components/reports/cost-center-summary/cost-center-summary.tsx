'use client'
import CostCenterSummaryHeading from './cost-center-summary-heading'
import CostCenterSummaryTableData from './cost-center-summary-table-data'
import React, { useState, useEffect } from 'react'
import { CostCenterSummaryType } from '@/utils/type'

import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getCostCenterSummary } from '@/api/cost-center-summary-api'

const CostCenterSummary = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'cost_center_summary.pdf' })
  const [costCenterSummary, setCostCenterSummary] = useState<
    CostCenterSummaryType[]
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
    newCompanyId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
  }

  useEffect(() => {
    if (startDate && endDate && companyId) {
      const fetchData = async () => {
        const response = await getCostCenterSummary({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          costCenterIds: '1,2,3', // Add appropriate value for costCenterIds
          companyid: companyId,
        })
        if (response.data) {
          const formattedData = response.data.map((item: any) => ({
            costCenterId: item.costCenterId,
            costCenterName: item.costCenterName,
            accountId: item.accountId,
            accountName: item.accountName,
            totalDebit: item.totalDebit,
            totalCredit: item.totalCredit,
          }))
          setCostCenterSummary(formattedData)
          console.log('this is from cost center summary data : ', response.data)
        } else {
          setCostCenterSummary([])
          console.log('No data received from getCostCenterSummary')
        }
      }
      fetchData()
    }
  }, [startDate, endDate, companyId])

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
      />
    </div>
  )
}

export default CostCenterSummary

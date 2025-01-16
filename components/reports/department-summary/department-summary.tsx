'use client'

import React, { useState, useEffect } from 'react'
import { CostCenter, CostCenterSummaryType, Department } from '@/utils/type'

import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  getAllCostCenters,
  getCostCenterSummary,
} from '@/api/cost-center-summary-api'
import DeparmentSummaryHeading from './department-summary-heading'
import DepartmentSummaryTableData from './department-summary-table-data'
import { getAllDepartments } from '@/api/department-summary-api'

const DepartmentSummary = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'department_summary.pdf' })
  const [costCenterSummary, setCostCenterSummary] = useState<
    CostCenterSummaryType[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [departmentSummary, setDepartmentSummary] = useState<Department[]>([])

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

  async function fetchAllCostCenter() {
    const respons = await getAllDepartments()
    setDepartmentSummary(respons.data || [])
    console.log('This is all department summary  data: ', respons.data || [])
  }

  useEffect(() => {
    if (startDate && endDate && companyId) {
      const fetchData = async () => {
        const response = await getCostCenterSummary({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          costCenterIds: '1,2,3,4,5,6,7,8,9,10',
          // costCenterIds: costCenterIds.join(','),
          companyid: companyId,
        })
        if (response.data) {
          console.log('this is non-filter data: ', response.data)
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
      fetchAllCostCenter()
    }
  }, [startDate, endDate, companyId])

  return (
    <div>
      <DeparmentSummaryHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <DepartmentSummaryTableData
        targetRef={targetRef}
        data={costCenterSummary}
      />
    </div>
  )
}

export default DepartmentSummary

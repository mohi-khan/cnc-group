'use client'

import React, { useState, useEffect } from 'react'
import { CostCenter, CostCenterSummaryType, Department, DepartmentSummaryType } from '@/utils/type'

import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  getAllCostCenters,
  getCostCenterSummary,
} from '@/api/cost-center-summary-api'
import DeparmentSummaryHeading from './department-summary-heading'
import DepartmentSummaryTableData from './department-summary-table-data'
import { getAllDepartments, getDepartmentSummary } from '@/api/department-summary-api'

const DepartmentSummary = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'department_summary.pdf' })
  const [departmentSummary, setDepartmentSummary] = useState<
  DepartmentSummaryType[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [department, setDepartment] = useState<Department[]>([])
  const [departmentId, setDepartmentId] = useState<string>('')

  const generatePdf = () => {
    toPDF()
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

  async function fetchAllCostCenter() {
    const respons = await getAllDepartments()
    setDepartment(respons.data || [])
    console.log('This is all department summary  data: ', respons.data || [])
  }

  useEffect(() => {
    if (startDate && endDate && companyId && departmentId) {
      const fetchData = async () => {
        const response = await getDepartmentSummary({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          departmentId: departmentId,
          companyid: companyId,
        })
        if (response.data) {
          console.log('this is non-filter data: ', response.data)
          const formattedData = response.data.map((item: any) => ({
            departmentId: item.departmentId,
            departmentName: item.departmentName,
            accountId: item.accountId,
            accountName: item.accountName,
            totalDebit: item.totalDebit,
            totalCredit: item.totalCredit,
          }))
          setDepartmentSummary(formattedData)
          console.log('this is from cost center summary data : ', response.data)
        } else {
          setDepartmentSummary([])
          console.log('No data received from getCostCenterSummary')
        }
      }
      fetchData()
      fetchAllCostCenter()
    }
  }, [startDate, endDate, companyId, departmentId])

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
      />
    </div>
  )
}

export default DepartmentSummary

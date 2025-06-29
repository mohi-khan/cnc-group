'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CostCenter, CostCenterSummaryType, Department, DepartmentSummaryType } from '@/utils/type'

import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import DeparmentSummaryHeading from './department-summary-heading'
import DepartmentSummaryTableData from './department-summary-table-data'
import { getAllDepartments, getDepartmentSummary } from '@/api/department-summary-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const DepartmentSummary = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
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
    console.log('This is all department summary  data: ', respons.data || [])
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
  }, [startDate, endDate, companyId, departmentId,token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    if (startDate && endDate && companyId && departmentId) {
      fetchData()
      fetchAllCostCenter()
    }
  }, [startDate, endDate, companyId, departmentId, fetchData,fetchAllCostCenter, router])
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

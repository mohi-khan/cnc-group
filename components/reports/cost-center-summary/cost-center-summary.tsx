'use client'
import CostCenterSummaryHeading from './cost-center-summary-heading'
import CostCenterSummaryTableData from './cost-center-summary-table-data'
import React, { useState, useEffect, useCallback } from 'react'
import { CostCenter, CostCenterSummaryType } from '@/utils/type'

import { usePDF } from 'react-to-pdf'
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
  const { toPDF, targetRef } = usePDF({ filename: 'cost_center_summary.pdf' })
  const [costCenterSummary, setCostCenterSummary] = useState<
    CostCenterSummaryType[]
  >([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')
  const [costCenterId, setCostCenterId] = useState<string>('')
  const [costCenterData, setCostCenterData] = useState<CostCenter[]>([])

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
    console.log('This is all cost center data: ', respons.data || [])
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
      console.log('this is non-filter data: ', response.data)
      const formattedData = response.data.map((item) => ({
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
  }, [token, startDate, endDate, companyId, costCenterId])
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

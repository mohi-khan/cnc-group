'use client'

import React, { useState } from 'react'
import { usePDF } from 'react-to-pdf'
import TrialBalanceHeading from './trial-balance-heading'
import TrialBalanceTable from './trial-balance-table'
import { TrialBalanceData } from '@/utils/type'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export default function TrialBalance() {
  const { toPDF, targetRef } = usePDF({ filename: 'trial_balance.pdf' })
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceData[]>(
    []
  )
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')

  const generatePdf = () => {
    toPDF()
  }

  const exportToExcel = (data: TrialBalanceData[], fileName: string) => {
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

  const flattenData = (data: TrialBalanceData[]): any[] => {
    let result: any[] = []
    data.forEach((item) => {
      result.push({
        Name: item.name,
        InitialDebit: item.initialDebit,
        InitialCredit: item.initialCredit,
        InitialBalance: item.initialBalance,
        PeriodDebit: item.periodDebit,
        PeriodCredit: item.periodCredit,
        PeriodBalance: item.periodDebit - item.periodCredit,
        ClosingDebit: item.closingDebit,
        ClosingCredit: item.closingCredit,
        ClosingBalance: item.closingBalance,
      })
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenData(item.children))
      }
    })
    return result
  }

  const generateExcel = () => {
    exportToExcel(trialBalanceData, 'trial_balance')
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

  return (
    <div>
      <TrialBalanceHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <TrialBalanceTable
        targetRef={targetRef}
        setTrialBalanceData={setTrialBalanceData}
        startDate={startDate}
        endDate={endDate}
        companyId={companyId}
      />
    </div>
  )
}

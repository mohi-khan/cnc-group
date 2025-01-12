'use client'

import React, { useState } from 'react'
import CashFlowStatementHeading from './cash-flow-statement-heading'
import CashFlowStatementTableData from './cash-flow-statement-tabledata'
import { usePDF } from 'react-to-pdf'
import { CashflowStatement, TrialBalanceData } from '@/utils/type'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const CashFlowStatement = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'cash_flow_statement.pdf' })
  const [cashFlowStatement, CashFlowStatement] = useState<CashflowStatement[]>(
    []
  )
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')

  const generatePdf = () => {
    toPDF()
  }

  const exportToExcel = (data: CashflowStatement[], fileName: string) => {
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

  const flattenData = (data: CashflowStatement[]): any[] => {
    let result: any[] = []
    data.forEach((item) => {
      result.push({
        debit: item.credit,
        credit: item.credit,
        cashflowTag: item.cashflowTag,
      })
    })
    return result
  }

  const generateExcel = () => {
    exportToExcel(cashFlowStatement, 'cash-flow-statement')
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
      <CashFlowStatementHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CashFlowStatementTableData
        targetRef={targetRef}
        setTrialBalanceData={CashFlowStatement}
        startDate={startDate || new Date()}
        endDate={endDate || new Date()}
        companyId={companyId}
      />
    </div>
  )
}

export default CashFlowStatement

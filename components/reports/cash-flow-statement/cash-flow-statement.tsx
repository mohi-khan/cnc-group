'use client'
import React, { useState, useEffect } from 'react'
import { CashflowStatement } from '@/utils/type'
import { getCashFowStatement } from '@/api/cash-flow-statement-api'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import CashFlowStatementHeading from './cash-flow-statement-heading'
import CashFlowStatementTableData from './cash-flow-statement-tabledata'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const CashFlowStatement = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const { toPDF, targetRef } = usePDF({ filename: 'cash_flow_statement.pdf' })
  const [cashFlowStatements, setCashFlowStatements] = useState<
    CashflowStatement[]
  >([])
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
    return data.map((item) => ({
      debit: item.credit,
      credit: item.credit,
      cashflowTag: item.cashflowTag,
    }))
  }

  const generateExcel = () => {
    exportToExcel(cashFlowStatements, 'cash-flow-statement')
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
          token,
        })

        setCashFlowStatements(response.data || [])
        console.log('this is from getcash flow data : ', response.data || [])
      }
      fetchData()
    }
  }, [startDate, endDate, companyId,token])

  return (
    <div>
      <CashFlowStatementHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CashFlowStatementTableData
        targetRef={targetRef}
        cashFlowStatements={cashFlowStatements}
      />
    </div>
  )
}

export default CashFlowStatement

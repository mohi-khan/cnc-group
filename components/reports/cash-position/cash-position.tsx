'use client'
import React, { useState, useEffect } from 'react'
import CashPositionTable from './cash-position-table'
import CashPositonHeading from './cash-position-heading'
import { BankBalance, CashBalance } from '@/utils/type'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getBankBalance, getCashBalance } from '@/api/cash-position-api'

const CashPositon = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'Cash_Position.pdf' })
  const [bankBalances, setBankBalances] = useState<BankBalance[]>([])
  const [cashBalances, setCashBalances] = useState<CashBalance[]>([])
  const [fromDate, setFromDate] = useState<string>('2024-01-01')
  const [toDate, setToDate] = useState<string>('2025-03-02')

  // Function to fetch bank balance data
  const fetchGetBankBalance = async () => {
    try {
      const response = await getBankBalance(fromDate, toDate)
      setBankBalances(response.data || [])
      console.log('This is all Bank Balance data: ', response.data || [])
    } catch (error) {
      console.error('Error fetching bank balance:', error)
    }
  }

  const fetchGetCashBalance = async () => {
    try {
      const response = await getCashBalance(fromDate, toDate)
      setCashBalances(response.data || [])
      console.log('This is all Cash Balance data: ', response.data || [])
    } catch (error) {
      console.error('Error fetching cash balance:', error)
    }
  }

  // Fetch data when the component mounts or when date changes
  useEffect(() => {
    fetchGetBankBalance()
    fetchGetCashBalance()
  }, [fromDate, toDate])

  // Function to generate PDF
  const generatePdf = () => {
    toPDF()
  }

  // Function to format data for Excel export
  const flattenData = (data: BankBalance[]) => {
    return data?.map((item) => ({
      companyName: item.companyName,
      BankAccount: item.BankAccount,
      AccountType: item.AccountType,
      openingBalance: item.openingBalance,
      debitSum: item.debitSum,
      creditSum: item.creditSum,
      closingBalance: item.closingBalance,
    }))
  }

  // Function to export data to Excel
  const generateExcel = () => {
    if (bankBalances.length === 0) {
      console.warn('No data available for export.')
      return
    }
    exportToExcel(bankBalances, 'cash_position')
  }

  const exportToExcel = (data: BankBalance[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Position')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined
  ) => {
    setFromDate(newStartDate ? newStartDate.toISOString().split('T')[0] : '')
    setToDate(newEndDate ? newEndDate.toISOString().split('T')[0] : '')
  }

  return (
    <div className="container mx-4">
      <CashPositonHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <CashPositionTable
        targetRef={targetRef}
        bankBalances={bankBalances}
        cashkBalances={cashBalances}
      />
    </div>
  )
}

export default CashPositon

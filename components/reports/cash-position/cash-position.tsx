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
  const fetchGetBankBalance = React.useCallback(async () => {
    try {
      const response = await getBankBalance(fromDate, toDate)
      setBankBalances(response.data || [])
      console.log('This is all Bank Balance data: ', response.data || [])
    } catch (error) {
      console.error('Error fetching bank balance:', error)
    }
  }, [fromDate, toDate])

  const fetchGetCashBalance = React.useCallback(async () => {
    try {
      const response = await getCashBalance(fromDate, toDate)
      setCashBalances(response.data || [])
      console.log('This is all Cash Balance data: ', response.data || [])
    } catch (error) {
      console.error('Error fetching cash balance:', error)
    }
  }, [fromDate, toDate])

  // Fetch data when the component mounts or when date changes
  useEffect(() => {
    fetchGetBankBalance()
    fetchGetCashBalance()
  }, [fetchGetBankBalance, fetchGetCashBalance])

  // Function to generate PDF
  const generatePdf = () => {
    toPDF()
  }

  // Function to flatten and combine both bankBalances and cashBalances for Excel export
  const flattenAllData = () => {
    // Map over bankBalances and add a Source field
    const bankData = bankBalances.map((item) => ({
      Source: 'Bank',
      CompanyName: item.companyName,
      BankAccount: item.BankAccount,
      AccountType: item.AccountType,
      OpeningBalance: item.openingBalance,
      DebitSum: item.debitSum,
      CreditSum: item.creditSum,
      ClosingBalance: item.closingBalance,
    }))

    // Map over cashBalances and add a Source field and adjust the fields as needed
    const cashData = cashBalances.map((item) => ({
      Source: 'Cash',
      CompanyName: item.companyName,
      Location: item.locationName,
      // If you have any cash-specific account field, you can add it here.
      OpeningBalance: item.openingBalance,
      DebitSum: item.debitSum,
      CreditSum: item.creditSum,
      ClosingBalance: item.closingBalance,
    }))

    // Combine the two arrays
    return [...bankData, ...cashData]
  }

  // Function to export data to Excel (includes both bank and cash details)
  const generateExcel = () => {
    const allData = flattenAllData()
    if (allData.length === 0) {
      console.warn('No data available for export.')
      return
    }
    exportToExcel(allData, 'cash_position')
  }

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
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



'use client'
import React, { useState, useEffect } from 'react'
import CashPositionTable from './cash-position-table'
import CashPositonHeading from './cash-position-heading'
import { BankBalance, CashBalance } from '@/utils/type'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getBankBalance, getCashBalance } from '@/api/cash-position-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const CashPositon = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const { toPDF, targetRef } = usePDF({ filename: 'Cash_Position.pdf' })
  const [bankBalances, setBankBalances] = useState<BankBalance[]>([])
  const [cashBalances, setCashBalances] = useState<CashBalance[]>([])
  const [fromDate, setFromDate] = useState<string>('2024-01-01')
  const [toDate, setToDate] = useState<string>('2025-03-02')
  // Use companyName (instead of companyId) for filtering
  const [companyName, setCompanyName] = useState<string>('')

  // Fetch bank balance data and filter by companyName if one is selected
  const fetchGetBankBalance = React.useCallback(async () => {
    if (!token) return
    const response = await getBankBalance(fromDate, toDate, token)
    let data: BankBalance[] = response.data || []
    if (companyName) {
      data = data.filter(
        (item) => item.companyName.toLowerCase() === companyName.toLowerCase()
      )
    }
    setBankBalances(data)
    console.log('Filtered Bank Balance data: ', data)
  }, [fromDate, toDate, companyName, token])

  // Fetch cash balance data and filter by companyName if one is selected
  const fetchGetCashBalance = React.useCallback(async () => {
    if (!token) return
    const response = await getCashBalance(fromDate, toDate, token)
    let data: CashBalance[] = response.data || []
    if (companyName) {
      data = data.filter(
        (item) => item.companyName.toLowerCase() === companyName.toLowerCase()
      )
    }
    setCashBalances(data)
    console.log('Filtered Cash Balance data: ', data)
  }, [fromDate, toDate, companyName, token])
  // Refetch data whenever fromDate, toDate, or companyName changes
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
    fetchGetBankBalance()
    fetchGetCashBalance()
  }, [fetchGetBankBalance, fetchGetCashBalance,router])

  // Function to generate PDF
  const generatePdf = () => {
    toPDF()
  }

  // Flatten and combine both bankBalances and cashBalances for Excel export
  const flattenAllData = () => {
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

    const cashData = cashBalances.map((item) => ({
      Source: 'Cash',
      CompanyName: item.companyName,
      Location: item.locationName,
      OpeningBalance: item.openingBalance,
      DebitSum: item.debitSum,
      CreditSum: item.creditSum,
      ClosingBalance: item.closingBalance,
    }))

    return [...bankData, ...cashData]
  }

  // Export data to Excel (both bank and cash)
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

  // Receive filter changes from the heading component.
  // Note: The third parameter now represents the selected company name.
  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyName: string
  ) => {
    setFromDate(newStartDate ? newStartDate.toISOString().split('T')[0] : '')
    setToDate(newEndDate ? newEndDate.toISOString().split('T')[0] : '')
    setCompanyName(newCompanyName)
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
        cashBalances={cashBalances}
      />
    </div>
  )
}

export default CashPositon

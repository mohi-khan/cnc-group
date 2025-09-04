


'use client'
import { useCallback, useEffect, useState } from 'react'
import LoanSanctionReportList from './loan-sanction-report-list'
import LoanSanctionReportHeading from './loan-sanction-report-heading'
import { getLoanBalance } from '@/api/Loan-sancton-report-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import type { LoanBalanceType } from '@/utils/type'
import { toast } from '@/hooks/use-toast'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const LoanSanctionReport = () => {
  const [loanBalance, setLoanBalance] = useState<LoanBalanceType[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format

  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const { toPDF, targetRef } = usePDF({ filename: 'Loan_Sanction_Report.pdf' })

  const fetchLoanBalance = useCallback(async () => {
    if (!token) return
    const response = await getLoanBalance({ date, token })
    if (!response?.data) {
      toast({
        title: 'Error',
        description: 'Failed to load loan balance',
      })
      setLoanBalance([])
      return
    }
    const data = Array.isArray(response.data) ? response.data : [response.data]
    setLoanBalance(data)
    console.log(data)
  }, [date, token])

  useEffect(() => {
    fetchLoanBalance()
  }, [fetchLoanBalance])

  const generatePdf = () => {
    toPDF()
  }

  const flattenLoanData = () => {
    const flatData: LoanBalanceType[] = loanBalance ? loanBalance.flat() : []

    return flatData.map((item) => ({
      Date: date,
      CompanyName: item.companyName,
      BankName: item.bankName,
      BranchName: item.branchName,
      AccountNumber: item.accountNumber,
      AccountType: item.accountType,
      Limit: item.limit || 0,
      Rate: item.rate || 0,
      Balance: Number.parseFloat(item.balance) || 0,
    }))
  }

  const generateExcel = () => {
    const loanData = flattenLoanData()
    if (loanData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No loan data available for export.',
      })
      return
    }
    exportToExcel(loanData, 'loan_sanction_report')
  }

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loan Sanction Report')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  return (
    <div className="p-4">
      <LoanSanctionReportHeading
        date={date}
        setDate={setDate}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      <LoanSanctionReportList data={loanBalance} targetRef={targetRef} />
    </div>
  )
}

export default LoanSanctionReport

'use client'
import React, { useEffect, useState } from 'react'
import LoanList from './loan-list'
import LoanPopUp from './loan-popup'
import { IouRecordGetType } from '@/utils/type'
import { getLoanData } from '@/api/loan-api'

const Loan = () => {
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])

  useEffect(() => {
    fetchLoanData()
  }, [])

  // Fetch all assets
  const fetchLoanData = async () => {
    try {
      const loansdata = await getLoanData()
      if (loansdata.data) {
        setLoanData(loansdata.data)
      } else {
        setLoanData([])
      }
      console.log('Show The Loan  All Data :', loansdata.data)
    } catch (error) {
      console.error('Failed to fetch Loan Data :', error)
    }
  }
  return (
    <div className="container mx-auto p-4">
      <LoanList loanDatas={loanData} />
      {/* <LoanPopUp /> */}
    </div>
  )
}

export default Loan

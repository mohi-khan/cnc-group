'use client'

import { useState } from 'react'
import BankLedgerFind from './bank-ledger-find'
import BankLedgerList from './bank-ledger-list'
import { BankAccountDateRange } from '@/utils/type'
import { getBankAccountsByDate } from '@/api/bank-ledger-api'

export default function BankLedger() {
  const [transactions, setTransactions] = useState<BankAccountDateRange[]>([])

  const handleSearch = async (bankaccount: number, fromdate: string, todate: string) => {
    try {
      const response = await getBankAccountsByDate({
        bankaccount,
        fromdate,
        todate
      })
      
      if (response.error) {
        console.error('Error fetching transactions:', response.error)
        // You might want to show an error message to the user here
      } else {
        setTransactions(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className="space-y-4 container mx-auto mt-20">
      <BankLedgerFind onSearch={handleSearch} />
      <BankLedgerList transactions={transactions} />
    </div>
  )
}


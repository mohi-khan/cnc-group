'use client'

import { useState } from 'react'
import BankLedgerFind from './bank-ledger-find'
import BankLedgerList from './bank-ledger-list'

// This would typically come from your API
const mockTransactions = [
  {
    voucherNo: 'CV/82/44/10/08',
    voucherDate: '12/18/2024',
    accountsNotes: 'Utility Exp For the M',
    partner: 'Chittagong Wasa',
    debit: 25000,
    credit: 28000,
    balance: 3000
  }
]

export default function BankLedger() {
  const [transactions, setTransactions] = useState(mockTransactions)

  const handleSearch = async (fromDate: Date, toDate: Date) => {
    // In a real application, you would fetch the data from your API here
    // using the fromDate and toDate parameters
    console.log('Searching for transactions between:', fromDate, 'and', toDate)
    
    // For now, we'll just use our mock data
    setTransactions(mockTransactions)
  }

  return (
    <div className="space-y-4 w-3/5 mx-auto mt-20">
      <BankLedgerFind onSearch={handleSearch} />
      <BankLedgerList transactions={transactions} />
    </div>
  )
}


'use client'

import { useState } from 'react'
import GeneralLedgerFind from './general-ledger-find'
import GeneralLedgerList from './general-ledger-list'
import { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'

export default function GeneralLedger() {
  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])

  const handleSearch = async (accountcode: number, fromdate: string, todate: string) => {
    try {
      const response = await getGeneralLedgerByDate({
        accountcode,
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
      <GeneralLedgerFind onSearch={handleSearch} />
      <GeneralLedgerList transactions={transactions} />
    </div>
  )
}


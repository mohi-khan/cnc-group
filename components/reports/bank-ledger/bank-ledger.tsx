'use client'

import { useState, useCallback } from 'react'
import BankLedgerFind from './bank-ledger-find'
import BankLedgerList from './bank-ledger-list'
import { BankAccountDateRange } from '@/utils/type'
import { getBankAccountsByDate } from '@/api/bank-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function BankLedger() {
  //getting userData from jotai atom component
    useInitializeUser()
    const [userData] = useAtom(userDataAtom)
    const [token] = useAtom(tokenAtom)
  
    const router = useRouter()

  const [transactions, setTransactions] = useState<BankAccountDateRange[]>([])

  const handleSearch = useCallback(async (bankaccount: number, fromdate: string, todate: string) => {
    if (!token) return
    const response = await getBankAccountsByDate(
      {
        bankaccount,
        fromdate,
        todate
      },
      token
    )
    
    if (response.error) {
      console.error('Error fetching transactions:', response.error)
      // You might want to show an error message to the user here
    } else {
      setTransactions(response.data || [])
    }
  }, [token])
  return (
    <div className="space-y-4 container mx-auto mt-20">
      <BankLedgerFind onSearch={handleSearch} />
      <BankLedgerList transactions={transactions} />
    </div>
  )
}


'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BankAccount } from '@/utils/type'
import { getAllBankAccounts } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { FileText, Download, File } from 'lucide-react'

interface BankLedgerFindProps {
  onSearch: (bankaccount: number, fromdate: string, todate: string) => void
  onGeneratePdf: () => void
  onExportExcel: () => void
  isGeneratingPdf: boolean
}

export default function BankLedgerFind({
  onSearch,
  onGeneratePdf,
  onExportExcel,
  isGeneratingPdf,
}: BankLedgerFindProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  const fetchBankAccounts = useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllBankAccounts(token)
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting bank account:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get bank accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
    }
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchBankAccounts()
  }, [fetchBankAccounts, router])

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both dates',
      })
      return
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'To Date must be greater than From Date',
      })
      return
    }

    if (!selectedAccountId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a bank account',
      })
      return
    }

    onSearch(Number.parseInt(selectedAccountId, 10), fromDate, toDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Bank Ledger Report</h2>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To Date:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setSelectedAccountId(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select bank account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName}-{account.accountNumber}-
                    {account.bankName}-{account.branchName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="default" disabled>
                  No bank accounts available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Show</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isGeneratingPdf ? 'Generating...' : 'PDF'}
          </Button>
          <Button
            onClick={onExportExcel}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
          >
            <File className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>
    </div>
  )
}

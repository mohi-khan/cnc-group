'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { FileText, File, Printer } from 'lucide-react'
import type { BankAccount } from '@/utils/type'
import { getAllBankAccounts } from '@/api/common-shared-api'
import { CustomCombobox } from '@/utils/custom-combobox'

interface BankLedgerFindProps {
  onSearch: (
    bankaccount: number,
    fromdate: string,
    todate: string,
    companyName?: string
  ) => void
  onGeneratePdf: () => void
  onExportExcel: () => void
  isGeneratingPdf: boolean
  generatePrint: () => void
}

export default function BankLedgerFind({
  onSearch,
  onGeneratePdf,
  onExportExcel,
  isGeneratingPdf,
  generatePrint,
}: BankLedgerFindProps) {
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

    const selectedAccount = accounts.find(
      (acc) => acc.id === Number(selectedAccountId)
    )
    const companyName = selectedAccount
      ? `${selectedAccount.accountName} (${selectedAccount.bankName})`
      : 'Unknown Company'

    onSearch(
      Number.parseInt(selectedAccountId, 10),
      fromDate,
      toDate,
      companyName
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Bank Ledger Report</h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-between items-center p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To Date:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* Bank Account Combobox */}
          <CustomCombobox
            items={accounts
              .filter((account) => account.isActive)
              .map((account) => ({
                id: account.id,
                name: `${account.accountName}-${account.accountNumber}-${account.bankName}-${account.branchName}`,
              }))}
            value={
              selectedAccountId
                ? {
                    id: Number(selectedAccountId),
                    name: accounts.find(
                      (account) => account.id === Number(selectedAccountId)
                    )
                      ? `${
                          accounts.find(
                            (account) =>
                              account.id === Number(selectedAccountId)
                          )?.accountName
                        }-${
                          accounts.find(
                            (account) =>
                              account.id === Number(selectedAccountId)
                          )?.accountNumber
                        }-${
                          accounts.find(
                            (account) =>
                              account.id === Number(selectedAccountId)
                          )?.bankName
                        }-${
                          accounts.find(
                            (account) =>
                              account.id === Number(selectedAccountId)
                          )?.branchName
                        }`
                      : '',
                  }
                : null
            }
            onChange={(selectedItem) => {
              const value = selectedItem?.id ? String(selectedItem.id) : ''
              setSelectedAccountId(value)
            }}
            placeholder="Select bank account"
            disabled={accounts.length === 0}
          />

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Show
          </Button>
        </div>

        {/* Export Buttons */}
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
          <Button
          onClick={generatePrint}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-900 hover:bg-blue-200"
        >
          <Printer className="h-4 w-4" />
          <span className="font-medium">Print</span>
        </Button>
        </div>
      </div>
    </div>
  )
}

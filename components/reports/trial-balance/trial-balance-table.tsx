'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getTrialBalance } from '@/api/trial-balance-api'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { TrialBalanceData } from '@/utils/type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Loader from '@/utils/loader'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const formatInternationalNumber = (num: number): string => {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (absNum < 1000) {
    return `${sign}${absNum}`
  } else if (absNum < 1_000_000) {
    const value = absNum / 1_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`
  } else if (absNum < 1_000_000_000) {
    const value = absNum / 1_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}M`
  } else if (absNum < 1_000_000_000_000) {
    const value = absNum / 1_000_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}B`
  } else {
    const value = absNum / 1_000_000_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}T`
  }
}

// ✅ Recursive function to calculate parent balances from children
const calculateParentBalances = (
  data: TrialBalanceData[]
): TrialBalanceData[] => {
  return data.map((item) => {
    if (item.children && item.children.length > 0) {
      const updatedChildren = calculateParentBalances(item.children)

      const totals = updatedChildren.reduce(
        (acc, child) => {
          acc.initialDebit += child.initialDebit
          acc.initialCredit += child.initialCredit
          acc.initialBalance += child.initialBalance
          acc.periodDebit += child.periodDebit
          acc.periodCredit += child.periodCredit
          acc.closingDebit += child.closingDebit
          acc.closingCredit += child.closingCredit
          acc.closingBalance += child.closingBalance
          return acc
        },
        {
          initialDebit: 0,
          initialCredit: 0,
          initialBalance: 0,
          periodDebit: 0,
          periodCredit: 0,
          closingDebit: 0,
          closingCredit: 0,
          closingBalance: 0,
        }
      )

      return {
        ...item,
        ...totals,
        children: updatedChildren,
      }
    }
    return item
  })
}

export default function TrialBalanceTable({
  targetRef,
  setTrialBalanceData,
  startDate,
  endDate,
  companyId,
  isGeneratingPdf = false,
}: {
  targetRef: React.RefObject<HTMLDivElement>
  setTrialBalanceData: React.Dispatch<React.SetStateAction<TrialBalanceData[]>>
  startDate: Date | undefined
  endDate: Date | undefined
  companyId: string
  isGeneratingPdf?: boolean
}) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const [trialBalanceDataLocal, setTrialBalanceDataLocal] = useState<
    TrialBalanceData[]
  >([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const fetchTrialBalanceTableData = useCallback(async () => {
    if (!token) return
    if (!startDate || !endDate || !companyId) {
      console.error('Missing required filter parameters')
      return
    }

    try {
      console.log(startDate.toISOString().split('T')[0])
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Add 1 because month is 0-11
      const day = String(startDate.getDate()).padStart(2, '0');
      const fromDate = `${year}-${month}-${day}`;
      const eyear = endDate.getFullYear();
      const emonth = String(endDate.getMonth() + 1).padStart(2, '0'); // Add 1 because month is 0-11
      const eday = String(endDate.getDate()).padStart(2, '0');
      const toDate = `${year}-${month}-${day}`;
      const response = await getTrialBalance({
        fromdate: fromDate,
        enddate: toDate,
        companyid: companyId,
        token,
      })
      if (response.data) {
        const processedData = calculateParentBalances(response.data) // ✅ apply calculation
        setTrialBalanceDataLocal(processedData)
        setTrialBalanceData(processedData)
        console.log('Fetched trial balance data:', processedData)
      } else {
        console.error(
          'Error fetching trial balance data:',
          response?.error || 'Unknown error'
        )
      }
    } catch (error) {
      console.error('Error fetching trial balance data:', error)
    }
  }, [startDate, endDate, companyId, setTrialBalanceData, token])

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
    if (startDate && endDate && companyId) {
      fetchTrialBalanceTableData()
    }
  }, [startDate, endDate, companyId, fetchTrialBalanceTableData, router])

  const toggleRowExpansion = (id: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  const renderRows = (data: TrialBalanceData[], level = 0) => {
    return data.map((item, index) => (
      <React.Fragment key={item.id}>
        <div
          onClick={() => !isGeneratingPdf && toggleRowExpansion(item.id)}
          className={`grid grid-cols-12 gap-4 ${!isGeneratingPdf ? 'cursor-pointer' : ''} p-2 border-b hover:bg-gray-100 ${
            expandedRows.has(item.id) ? 'font-bold bg-gray-50' : 'font-normal'
          } ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
        >
          <div className="flex justify-center items-left">
            {!isGeneratingPdf && item.children && item.children.length > 0 && (
              <span
                className={`text-xs ${expandedRows.has(item.id) ? 'text-blue-600' : 'text-gray-600'}`}
                tabIndex={0}
                aria-label="Expand/Collapse"
              >
                {expandedRows.has(item.id) ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </span>
            )}
          </div>
          <div
            className={`col-span-1 text-left font-sans ${
              level === 0
                ? 'text-blue-400'
                : level === 1
                  ? 'text-green-500'
                  : 'text-purple-500'
            }`}
          >
            {isGeneratingPdf ? (
              item.name
            ) : (
              <Link
                href={`/reports/trial-balance/single-trial-balance/${item.id}?startDate=${
                  startDate
                    ? encodeURIComponent(startDate.toISOString().split('T')[0])
                    : ''
                }&endDate=${endDate ? encodeURIComponent(endDate.toISOString().split('T')[0]) : ''}&companyId=${encodeURIComponent(companyId)}`}
              >
                {item.name}
              </Link>
            )}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.initialDebit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.initialCredit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.initialBalance)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.periodDebit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.periodCredit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.periodDebit - item.periodCredit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.closingDebit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.closingCredit)}
          </div>
          <div className="col-span-1 text-center">
            {formatInternationalNumber(item.closingBalance)}
          </div>
        </div>

        {expandedRows.has(item.id) &&
          item.children &&
          item.children.length > 0 && (
            <div className="pl-4">{renderRows(item.children, level + 1)}</div>
          )}
      </React.Fragment>
    ))
  }

  return (
    <div ref={targetRef}>
      <Card className="border rounded-lg">
        <CardContent>
          <div className="grid grid-cols-12 gap-4 p-2 pdf-table-header">
            <div className="col-span-1"></div>
            <div className="col-span-1"></div>

            <Card className="col-span-3 border">
              <CardHeader className="border-b p-2">
                <CardTitle className="text-center text-lg font-bold p-1">
                  Initial Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">Debit</div>
                  <div className="text-center">Credit</div>
                  <div className="text-center">Balance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 border">
              <CardHeader className="border-b p-2">
                <CardTitle className="text-center text-lg font-bold p-1">
                  Date 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">Debit</div>
                  <div className="text-center">Credit</div>
                  <div className="text-center">Balance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 border">
              <CardHeader className="border-b p-2">
                <CardTitle className="text-center text-lg font-bold p-1">
                  End Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">Debit</div>
                  <div className="text-center">Credit</div>
                  <div className="text-center">Balance</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            {!startDate || !companyId ? (
              <div className="text-center p-4 text-bold animate-pulse duration-1000">
                Please select a date range and company
              </div>
            ) : trialBalanceDataLocal.length > 0 ? (
              renderRows(trialBalanceDataLocal)
            ) : (
              <div className="text-center p-4">
                <Loader />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




























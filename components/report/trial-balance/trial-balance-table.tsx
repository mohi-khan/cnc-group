'use client'

import React, { useState, useEffect } from 'react'
import { getTrialBalance } from '@/api/trial-balance-api'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { TrialBalanceData } from '@/utils/type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TrialBalanceTable({
  targetRef,
  setTrialBalanceData,
  startDate,
  endDate,
  companyId,
}: {
  targetRef: React.RefObject<HTMLDivElement>
  setTrialBalanceData: React.Dispatch<React.SetStateAction<TrialBalanceData[]>>
  startDate: Date | undefined
  endDate: Date | undefined
  companyId: string
}) {
  const [trialBalanceDataLocal, setTrialBalanceDataLocal] = useState<
    TrialBalanceData[]
  >([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  async function fetchTrialBalanceTableData() {
    if (!startDate || !endDate || !companyId) {
      console.error('Missing required filter parameters')
      return
    }

    try {
      const response = await getTrialBalance({
        fromdate: startDate.toISOString().split('T')[0],
        enddate: endDate.toISOString().split('T')[0],
        companyid: companyId,
      })
      if (response.data) {
        setTrialBalanceDataLocal(response.data)
        setTrialBalanceData(response.data)
        console.log('trial balance data : ', response.data)
      } else {
        console.error(
          'Error fetching trial balance data:',
          response?.error || 'Unknown error'
        )
      }
    } catch (error) {
      console.error('Error fetching trial balance data:', error)
    }
  }

  useEffect(() => {
    if (startDate && endDate && companyId) {
      fetchTrialBalanceTableData()
    }
  }, [startDate, endDate, companyId])

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
    return data.map((item) => (
      <React.Fragment key={item.id}>
        <div
          onClick={() => toggleRowExpansion(item.id)}
          className={`grid grid-cols-12 gap-4 cursor-pointer p-2 border-b hover:bg-gray-100 ${
            expandedRows.has(item.id) ? 'font-bold bg-gray-50' : 'font-normal'
          }`}
        >
          <div className="flex justify-center items-left">
            {item.children && item.children.length > 0 && (
              <span
                className={`text-sm ${expandedRows.has(item.id) ? 'text-blue-600' : 'text-gray-600'}`}
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
            {item.name}
          </div>
          <div className="col-span-1 text-center">
            {item.initialDebit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.initialCredit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.initialBalance.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.periodDebit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.periodCredit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.periodDebit - item.periodCredit}
          </div>
          <div className="col-span-1 text-center">
            {item.closingDebit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.closingCredit.toFixed(2)}
          </div>
          <div className="col-span-1 text-center">
            {item.closingBalance.toFixed(2)}
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
          <div className="grid grid-cols-12 gap-4 p-2">
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
            {trialBalanceDataLocal.length > 0 ? (
              renderRows(trialBalanceDataLocal)
            ) : (
              <div className="text-center p-4">Loading...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

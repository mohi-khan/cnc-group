'use client'
import React, { useState } from 'react'
import { getTrialBalance } from '@/api/trial-balance-api'
import { ChevronRight, ChevronDown } from 'lucide-react' // Importing lucide-react arrow icons

// Define the type for API response
export interface TrialBalanceData {
  id: number
  code: string
  name: string
  level: number
  parentCode: string | null
  initialDebit: number
  initialCredit: number
  initialBalance: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
  closingBalance: number
  children: TrialBalanceData[] // Nested structure for sub-items
}

export default function TrialBalanceTable() {
  const [trialBalanceData, setTrialBalanceData] = React.useState<
    TrialBalanceData[]
  >([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set()) // Track expanded rows

  // Fetch data from API
  async function fetchTrialBalanceTableData() {
    try {
      const response = await getTrialBalance()
      if (response.data) {
        setTrialBalanceData(response.data)
        console.log('trial balance: ', response.data)
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

  React.useEffect(() => {
    fetchTrialBalanceTableData()
  }, [])

  // Toggle the expansion of a row
  const toggleRowExpansion = (id: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id) // Collapse the row
    } else {
      newExpandedRows.add(id) // Expand the row
    }
    setExpandedRows(newExpandedRows)
  }

  // Recursive function to render rows, including children if expanded
  const renderRows = (data: TrialBalanceData[], level = 0) => {
    return data.map((item) => (
      <React.Fragment key={item.id}>
        {/* Parent Row with Arrow */}
        <div
          onClick={() => toggleRowExpansion(item.id)}
          className={`grid grid-cols-12 gap-4 cursor-pointer p-2 border-b ${expandedRows.has(item.id) ? 'font-bold' : 'font-normal'}`}
        >
          <div className="col-span-1 flex justify-center items-center">
            {item.children && item.children.length > 0 && (
              <span
                className={`mr-2 font-bold ${expandedRows.has(item.id) ? 'text-blue-600' : 'text-gray-600'}`}
                tabIndex={0} // Make the arrow icon focusable
                aria-label="Expand/Collapse" // Add accessibility label for screen readers
              >
                {expandedRows.has(item.id) ? (
                  <ChevronDown size={20} /> // Show down arrow when expanded
                ) : (
                  <ChevronRight size={20} /> // Show right arrow when collapsed
                )}
              </span>
            )}
          </div>
          <div className="col-span-1 text-center">{item.initialDebit}</div>
          <div className="col-span-1 text-center">{item.initialCredit}</div>
          <div className="col-span-1 text-center">{item.initialBalance}</div>
          <div className="col-span-1 text-center">{item.periodDebit}</div>
          <div className="col-span-1 text-center">{item.periodCredit}</div>
          <div className="col-span-1 text-center">
            {item.periodDebit - item.periodCredit}
          </div>
          <div className="col-span-1 text-center">{item.closingDebit}</div>
          <div className="col-span-1 text-center">{item.closingCredit}</div>
          <div className="col-span-1 text-center">{item.closingBalance}</div>
        </div>

        {/* Children Row (Only if expanded) */}
        {expandedRows.has(item.id) &&
          item.children &&
          item.children.length > 0 && (
            <div className="pl-4">
              {renderRows(item.children, level + 1)}{' '}
              {/* Recursively render children */}
            </div>
          )}
      </React.Fragment>
    ))
  }

  return (
    <div>
      <div className="border rounded-lg">
        <div className="grid grid-cols-12 gap-4 p-4 border-b font-bold">
          <div className="col-span-1"></div>
          <div className="col-span-1 text-center">Initial Debit</div>
          <div className="col-span-1 text-center">Initial Credit</div>
          <div className="col-span-1 text-center">Initial Balance</div>
          <div className="col-span-1 text-center">Debit (2024)</div>
          <div className="col-span-1 text-center">Credit (2024)</div>
          <div className="col-span-1 text-center">Balance (2024)</div>
          <div className="col-span-1 text-center">Closing Debit</div>
          <div className="col-span-1 text-center">Closing Credit</div>
          <div className="col-span-1 text-center">Closing Balance</div>
        </div>
        <div>
          {trialBalanceData.length > 0 ? (
            renderRows(trialBalanceData)
          ) : (
            <div className="text-center p-4">loading...</div>
          )}
        </div>
      </div>
    </div>
  )
}

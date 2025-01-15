'use client'
import React from 'react'
import { CostCenterSummaryType } from '@/utils/type'

interface Props {
  data: CostCenterSummaryType[]
  targetRef: React.RefObject<HTMLDivElement>
}

const CostCenterSummaryTableData: React.FC<Props> = ({ data, targetRef }) => {
  // Function to get the debit or credit value for a specific cost center and account name
  const getValue = (
    costCenterName: string,
    accountName: string,
    type: 'debit' | 'credit'
  ) => {
    const matchedData = data.filter(
      (item) =>
        item.costCenterName === costCenterName &&
        item.accountName === accountName
    )
    if (matchedData.length > 0) {
      return type === 'debit'
        ? matchedData[0].totalDebit
        : matchedData[0].totalCredit
    }
    return '--'
  }

  // Dynamically extract unique costCenterNames and accountNames from the data
  const costCenterNames = Array.from(
    new Set(data.map((item) => item.costCenterName))
  )
  const accountNames = Array.from(new Set(data.map((item) => item.accountName)))

  return (
    <div ref={targetRef} className="flex justify-center">
      <div className="w-full max-w-7xl rounded-md border mt-2 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-muted/50 hover:bg-muted/30 transition-colors">
              <th className="w-[200px] border px-4 py-2">
                Account Name/Cost Center Name
              </th>
              {costCenterNames.map((costCenterName, index) => (
                <th key={index} className="text-center border px-4 py-2">
                  {costCenterName} Debit
                </th>
              ))}
              {costCenterNames.map((costCenterName, index) => (
                <th
                  key={`${costCenterName}-credit`}
                  className="text-center border px-4 py-2"
                >
                  {costCenterName} Credit
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accountNames.map((accountName, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-slate-100' : 'bg-background'
                } hover:bg-stone-200 transition-colors duration-200`}
              >
                <td className="font-medium border px-4 py-2">{accountName}</td>
                {costCenterNames.map((costCenterName) => (
                  <td
                    key={costCenterName}
                    className="text-right border px-4 py-2"
                  >
                    {getValue(costCenterName, accountName, 'debit')}
                  </td>
                ))}
                {costCenterNames.map((costCenterName) => (
                  <td
                    key={`${costCenterName}-credit`}
                    className="text-right border px-4 py-2"
                  >
                    {getValue(costCenterName, accountName, 'credit')}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan={4}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CostCenterSummaryTableData

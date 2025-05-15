'use client'
import React from 'react'
import { CostCenterSummaryType, DepartmentSummaryType } from '@/utils/type'
import Loader from '@/utils/loader'
import { start } from 'repl'
import { de } from 'date-fns/locale'

interface Props {
  data: DepartmentSummaryType[]
  targetRef: React.RefObject<HTMLDivElement>
  startDate: Date | undefined
  endDate: Date | undefined
  companyId: string
  departmentId: string
}

const DepartmentSummaryTableData: React.FC<Props> = ({
  data,
  targetRef,
  startDate,
  endDate,
  companyId,
  departmentId,
}) => {
  // Function to get the debit or credit value for a specific cost center and account name
  const getDebitCreditDifference = (
    departmentName: string,
    accountName: string
  ) => {
    const matchedData = data.filter(
      (item) =>
        item.departmentName === departmentName &&
        item.accountName === accountName &&
        startDate &&
        endDate &&
        companyId &&
        departmentId
    )
    if (matchedData.length > 0) {
      // Return the difference between debit and credit
      const debit = matchedData[0].totalDebit || 0
      const credit = matchedData[0].totalCredit || 0
      return debit - credit
    }
    return '--'
  }

  // Dynamically extract unique costCenterNames and accountNames from the data
  const costCenterNames = Array.from(
    new Set(data.map((item) => item.departmentName))
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
                  {costCenterName}
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
                    {getDebitCreditDifference(costCenterName, accountName)}
                  </td>
                ))}
              </tr>
            ))}
            {!startDate || !endDate || !companyId || !departmentId ? (              <tr>
                <td className="border px-4 py-2 text-center" colSpan={4}>
                  Please select start date, end date, company and department
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan={4}>
                  <Loader />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DepartmentSummaryTableData

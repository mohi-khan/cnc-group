import { getCashFowStatement } from '@/api/cash-flow-statement-api'
import React, { useEffect, useState } from 'react'
import { CashflowStatement } from '../../../utils/type'

const CashFlowStatementTableData = ({
  targetRef,
  setCashFlowStatements,
  startDate,
  endDate,
  companyId,
}: {
  targetRef: React.RefObject<HTMLDivElement>
  startDate: Date
  endDate: Date
  companyId: string
  setCashFlowStatements: React.Dispatch<
    React.SetStateAction<CashflowStatement[]>
  >
}) => {
  const [trialBalanceDataLocal, setTrialBalanceDataLocal] = useState<
    CashflowStatement[]
  >([])
  async function fetchTrialBalanceTableData() {
    if (!startDate || !endDate || !companyId) {
      console.error('Missing required filter parameters')
      return
    }

    try {
      const response = await getCashFowStatement({
        fromdate: startDate.toISOString().split('T')[0],
        enddate: endDate.toISOString().split('T')[0],
        companyid: companyId,
      })
      if (response.data) {
        setTrialBalanceDataLocal(response.data)
        setCashFlowStatements(response.data)
        console.log('Cost Flow Statement data : ', response.data)
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
  return (
    <div ref={targetRef}>I am come from Cash Flow Statement Table Data</div>
  )
}

export default CashFlowStatementTableData

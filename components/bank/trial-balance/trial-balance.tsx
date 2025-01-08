'use client'

import TrialBalanceHeading from './trial-balance-heading'
import TrialBalanceTable from './trial-balance-table'
import { usePDF } from 'react-to-pdf'

export default function TrialBalance() {
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' })

  const generatePdf = () => {
    toPDF()
  }
  return (
    <div>
      <TrialBalanceHeading generatePdf={generatePdf} />
      <TrialBalanceTable targetRef={targetRef} />
    </div>
  )
}

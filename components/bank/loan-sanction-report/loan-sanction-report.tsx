

// 'use client'
// import React, { useCallback, useEffect, useState } from 'react'
// import LoanSanctionReportList from './loan-sanction-report-list'
// import LoanSanctionReportHeading from './loan-sanction-report-heading'
// import { getLoanBalance } from '@/api/Loan Sancton Report-api'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { LoanBalanceType } from '@/utils/type'
// import { toast } from '@/hooks/use-toast'
// import { clear } from 'console'

// const LoanSanctionReport = () => {
//   const [loanBalance, setLoanBalance] = useState<LoanBalanceType[]>([])
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format

//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const fetchLoanBalance = useCallback(async () => {
//     if (!token) return
//     const response = await getLoanBalance({ date, token })
//     if (!response?.data) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load loan balance',
//       })
//       setLoanBalance([])
//       return
//     }
//     const data = Array.isArray(response.data) ? response.data : [response.data]
//     setLoanBalance(data)
//     console.log(data)
//   }, [date, token])

//   useEffect(() => {
//     fetchLoanBalance()
//   }, [fetchLoanBalance])

//   return (
//     <div className="p-4">
//       <LoanSanctionReportHeading date={date} setDate={setDate} />
//       <LoanSanctionReportList data={loanBalance} />
//     </div>
//   )
// }

// export default LoanSanctionReport


'use client'
import React, { useCallback, useEffect, useState } from 'react'
import LoanSanctionReportList from './loan-sanction-report-list'
import LoanSanctionReportHeading from './loan-sanction-report-heading'
import { getLoanBalance } from '@/api/Loan Sancton Report-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { LoanBalanceType } from '@/utils/type'
import { toast } from '@/hooks/use-toast'

const LoanSanctionReport = () => {
  const [loanBalance, setLoanBalance] = useState<LoanBalanceType[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format

  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const fetchLoanBalance = useCallback(async () => {
    if (!token) return
    const response = await getLoanBalance({ date, token })
    if (!response?.data) {
      toast({
        title: 'Error',
        description: 'Failed to load loan balance',
      })
      setLoanBalance([])
      return
    }
    const data = Array.isArray(response.data) ? response.data : [response.data]
    setLoanBalance(data)
    console.log(data)
  }, [date, token])

  useEffect(() => {
    fetchLoanBalance()
  }, [fetchLoanBalance])

  return (
    <div className="p-4">
      <LoanSanctionReportHeading date={date} setDate={setDate} />
      <LoanSanctionReportList data={loanBalance} />
    </div>
  )
}

export default LoanSanctionReport

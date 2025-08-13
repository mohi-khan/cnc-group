'use client'

import { useCallback, useState } from 'react'
import GeneralLedgerFind from './general-ledger-find'
import GeneralLedgerList from './general-ledger-list'
import { GeneralLedgerType } from '@/utils/type'
import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { usePDF } from 'react-to-pdf'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

export default function GeneralLedger() {
  // Initialize user data from Jotai
  useInitializeUser()
  const [userData, _] = useAtom(userDataAtom) // ignore setter if not needed
  const [token] = useAtom(tokenAtom)

  const { toPDF, targetRef } = usePDF({ filename: 'general_ledger.pdf' })
  const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])

  // Flatten data for Excel export
  const flattenData = (data: GeneralLedgerType[]) =>
    data.map((item) => ({
      VoucherID: item.voucherid,
      VoucherNo: item.voucherno,
      AccountName: item.accountname,
      Debit: item.debit,
      Credit: item.credit,
      Notes: item.notes,
      Partner: item.partner,
      CostCenter: item.coscenter,
      Department: item.department,
    }))

  const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'General Ledger')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const generatePdf = () => toPDF()
  const generateExcel = () => exportToExcel(transactions, 'general_ledger')

  const handleSearch = useCallback(
    async (accountcode: number, fromdate: string, todate: string) => {
      if (!token || !userData) return

      // Extract companyId and locationId from userData
      const { companyId, locationId } = userData

      const response = await getGeneralLedgerByDate({
        accountcode,
        fromdate,
        todate,
        token,
        companyId,
        locationId,
      })

      setTransactions(response.data || [])
    },
    [token, userData]
  )

  return (
    <div className="space-y-4 container mx-auto mt-20">
      <GeneralLedgerFind
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      <GeneralLedgerList transactions={transactions} targetRef={targetRef} />
    </div>
  )
}

// 'use client'

// import { useCallback, useState } from 'react'
// import GeneralLedgerFind from './general-ledger-find'
// import GeneralLedgerList from './general-ledger-list'
// import { GeneralLedgerType } from '@/utils/type'
// import { getGeneralLedgerByDate } from '@/api/general-ledger-api'
// import { saveAs } from 'file-saver'
// import * as XLSX from 'xlsx'
// import { usePDF } from 'react-to-pdf'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// export default function GeneralLedger() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()
//   const { toPDF, targetRef } = usePDF({ filename: 'general_ledger.pdf' })
//   const [transactions, setTransactions] = useState<GeneralLedgerType[]>([])

//   const flattenData = (data: GeneralLedgerType[]) => {
//     return data.map((item) => ({
//       VoucherID: item.voucherid,
//       VoucherNo: item.voucherno,
//       AccountName: item.accountname,
//       Debit: item.debit,
//       Credit: item.credit,
//       Notes: item.notes,
//       Partner: item.partner,
//       CostCenter: item.coscenter,
//       Department: item.department,
//     }))
//   }

//   const exportToExcel = (data: GeneralLedgerType[], fileName: string) => {
//     const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'General Ledger')
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: 'xlsx',
//       type: 'array',
//     })
//     const blob = new Blob([excelBuffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
//     })
//     saveAs(blob, `${fileName}.xlsx`)
//   }

//   const generatePdf = () => {
//     toPDF()
//   }

//   const generateExcel = () => {
//     exportToExcel(transactions, 'general_ledger')
//   }

//   const handleSearch = useCallback(
//     async (accountcode: number, fromdate: string, todate: string) => {
//       if (!token) return

//       const response = await getGeneralLedgerByDate({
//         accountcode,
//         fromdate,
//         todate,
//         token,
//         locationId,
//         companyId

//       })

//       setTransactions(response.data || [])

//     },
//     [token,]
//   )

//   return (
//     <div className="space-y-4 container mx-auto mt-20">
//       <GeneralLedgerFind
//         onSearch={handleSearch}
//         generatePdf={generatePdf}
//         generateExcel={generateExcel}
//       />
//       <GeneralLedgerList transactions={transactions} targetRef={targetRef} />
//     </div>
//   )
// }

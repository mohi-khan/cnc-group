'use client'

import { useCallback, useState } from 'react'
import { PartnerLedgerType } from '@/utils/type'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { usePDF } from 'react-to-pdf'
import PartneredgerFind from './partner-ledger-find'
import PartnerLedgerList from './partner-ledger-list'
import { getPartnerLedgerByDate } from '@/api/partner-ledger-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function PartnerLedger() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const { toPDF, targetRef } = usePDF({ filename: 'partner_ledger.pdf' })
  const [transactions, setTransactions] = useState<PartnerLedgerType[]>([])

  const flattenData = (data: PartnerLedgerType[]) => {
    return data.map((item) => ({
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
  }

  const exportToExcel = (data: PartnerLedgerType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partner Ledger')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const generatePdf = () => {
    toPDF()
  }

  const generateExcel = () => {
    exportToExcel(transactions, 'partner_ledger')
  }

  const handleSearch = useCallback(async (
    partnercode: number,
    fromdate: string,
    todate: string
  ) => {
    const response = await getPartnerLedgerByDate({
      partnercode,
      fromdate,
      todate,
      token
    })

    if (response.error) {
      console.error('Error fetching transactions:', response.error)
    } else {
      setTransactions(response.data || [])
    }
  }, [token])
  
  return (
    <div className="space-y-4 container mx-auto mt-20">
      <PartneredgerFind
        onSearch={handleSearch}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      <PartnerLedgerList transactions={transactions} targetRef={targetRef} />
    </div>
  )
}

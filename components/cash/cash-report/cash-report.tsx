'use client'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useEffect, useState } from 'react'
import { getCashReport } from '@/api/cash-report-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'

export default function CashReport() {
    useInitializeUser()

    const [token] = useAtom(tokenAtom)
    const [cashReport, setCashReport] = useState([])

    const fetchCashReport = useCallback(async () => {
      if (!token) return
      // Define CashReportParams with required properties
      const CashReportParams = {
        fromDate: '2025-05-01',
        endDate: '2025-06-30',
        companyId: 3,
        location: 1,
      }
      const respons = await getCashReport(CashReportParams, token)
      setCashReport(respons.data || [])
      console.log('This is cash report data:::: ', respons.data || [])
    }, [token])
    useEffect(() => {
      fetchCashReport()
    }, [fetchCashReport])
  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <h1>this is main cash roport component</h1>
        </CardContent>
      </Card>
    </div>
  )
}

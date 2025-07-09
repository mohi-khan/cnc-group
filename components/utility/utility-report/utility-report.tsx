"use client"

import { useState, useCallback } from "react"
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { UtilityBillSummary } from "@/utils/type"
import { getUtilityBillsSummary } from "@/api/utility-report-api"
import UtilityReportFind from "./utility-report-find"
import UtilityReportList from "./utility-report-list"

export default function UtilityReport() {
  // Getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const [bills, setBills] = useState<UtilityBillSummary[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(
    async (fromDate: string, toDate: string, meterNo: string) => {
      if (!token) return

      setLoading(true)

      const response = await getUtilityBillsSummary(
        token,
        fromDate,
        toDate,
        meterNo
      )

      setLoading(false)

      if (response.error) {
        console.error("Error fetching utility bills:", response.error)
        // You might want to show an error message to the user here
        setBills([])
      } else {
        setBills(Array.isArray(response.data) ? response.data : [])
      }
    },
    [token],
  )

  return (
    <div className="space-y-4 container mx-auto mt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utility Bills Report</h1>
        <p className="text-gray-600">View utility bills summary by date range and meter number</p>
      </div>

      <UtilityReportFind onSearch={handleSearch} />

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <UtilityReportList bills={bills} />
      )}
    </div>
  )
}

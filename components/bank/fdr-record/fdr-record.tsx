

"use client"

import { useCallback, useEffect, useState } from "react"
import FdrRecordList from "./fdr-record-list"
import FdrRecordPopUp from "./fdr-record-popup"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus } from "lucide-react"
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { BankAccount, FdrGetType } from "@/utils/type"
import { getFdrData } from "@/api/fdr-record-api"
import { CompanyType } from "@/api/company-api"
import { getAllBankAccounts, getAllCompanies } from "@/api/common-shared-api"
import { toast } from "@/hooks/use-toast"

const FdrRecord = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Initialize user data
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
    const [token] = useAtom(tokenAtom)
    const [fdrdata, setFdrdata] = useState<FdrGetType[]>([])
     const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState<CompanyType[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const fetchFdrData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const fdrdata = await getFdrData(token)
      setFdrdata(fdrdata.data ? fdrdata.data : [])
      console.log('FDR Data:', fdrdata.data)
    } catch (error) {
      console.error('Error fetching FDR data:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchCompanyData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const companies = await getAllCompanies(token)
      setCompanyData(companies.data ? companies.data : [])
      console.log("Company Data:", companies)
    } catch (error) {
      console.error("Error fetching company data:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

   const fetchBankAccounts = useCallback(async () => {
      if (!token) return
      const fetchedAccounts = await getAllBankAccounts(token)
      if (fetchedAccounts.error || !fetchedAccounts.data) {
        console.error('Error getting bank account:', fetchedAccounts.error)
        toast({
          title: 'Error',
          description:
            fetchedAccounts.error?.message || 'Failed to get bank accounts',
        })
      } else {
        setBankAccounts(fetchedAccounts.data)
        console.log('this is all bank accounts: ', fetchedAccounts.data

        )
      }
    }, [token])

  useEffect(() => {
    fetchFdrData()
    fetchCompanyData()
    fetchBankAccounts()
  }, [fetchFdrData, fetchCompanyData, fetchBankAccounts])

  const handleAddRecord = () => {
    setIsPopupOpen(true)
  }

  const handleRecordAdded = () => {
    setIsPopupOpen(false)
    // You can add logic here to refresh the FDR list
    // For example, you could call a refresh function on FdrRecordList
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                FDR Records
              </CardTitle>
              <CardDescription>
                Manage and view all Fixed Deposit Receipt records
              </CardDescription>
            </div>
            <Button
              onClick={handleAddRecord}
              className="flex items-center gap-2"
              disabled={!userData?.userId} // Disable if user data not loaded
            >
              <Plus className="h-4 w-4" />
              ADD
            </Button>
          </div>
        </CardHeader>
      </Card>

      <FdrRecordList
        fdrdata={fdrdata} // Pass the fetched FDR data
        loading={loading} // Pass loading state to the list
        companyData={companyData} // Pass the fetched company data
      />

      <FdrRecordPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onRecordAdded={handleRecordAdded}
        refreshFdrData={fetchFdrData} // ✅ Pass fetch function here
        companyData={companyData} // Pass the fetched company data
        bankAccounts={bankAccounts}
        fdrdata={fdrdata} // Pass the fetched FDR data
      />
    </div>
  )
}

export default FdrRecord

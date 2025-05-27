'use client'

import { useEffect, useState, useCallback } from 'react'
import IouList from './iou-list'
import IouPopUp from './iou-popup'
import { getLoanData } from '@/api/iou-api'
import { Employee, IouRecordGetType } from '@/utils/type'
import { getEmployee } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const Iou = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])

  // Fetch all Loan Data
  const fetchLoanData = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const loansdata = await getLoanData(token)
      if (loansdata?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (loansdata.error || !loansdata.data) {
        console.error('Error fetching loans:', loansdata.error)
        setLoanData([])
      } else {
        setLoanData(loansdata.data)
      }
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : 'An error occurred')
      setLoanData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, router])
  // Fetch all Employee Data
  const fetchEmployeeData = useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
    console.log('Show The Employee Data :', employees.data)
  }, [token])

  useEffect(() => {
    fetchLoanData()
    fetchEmployeeData()
  }, [fetchLoanData, fetchEmployeeData, token])

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleCategoryAdded = () => {
    setIsPopupOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <IouList
        onAddCategory={handleAddCategory}
        loanAllData={loanData}
        isLoading={isLoading}
        employeeData={employeeData}
      />
      <IouPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
        fetchLoanData={fetchLoanData}
        employeeData={employeeData}
      />
    </div>
  )
}

export default Iou

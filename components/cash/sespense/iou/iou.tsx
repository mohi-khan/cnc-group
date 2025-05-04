'use client'

import { useEffect, useState, useCallback } from 'react'
import IouList from './iou-list'
import IouPopUp from './iou-popup'
import {  getLoanData } from '@/api/iou-api'
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

  useEffect(() => {
    fetchLoanData()
    fetchEmployeeData()
  }, [])

  // Fetch all Loan Data
  const fetchLoanData = useCallback(async () => {
    setIsLoading(true)
    const loansdata = await getLoanData(token)
    if (loansdata.data) {
      setLoanData(loansdata.data)
    } else {
      setLoanData([])
    }
    console.log('Show The Loan  All Data :', loansdata.data)
    setIsLoading(false)
  }, [token])
  
  // Fetch all Employee Data
  const fetchEmployeeData = useCallback(async () => {
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
    console.log('Show The Employee Data :', employees.data)
  }, [token])
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
        employees={[]} // Pass an empty array or the appropriate employees data
      />
    </div>
  )
}

export default Iou

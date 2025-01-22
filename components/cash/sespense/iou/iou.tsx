'use client'
import { useEffect, useState } from 'react'
import LoanList from './iou-list'
import LoanPopUp from './iou-popup'
import IouList from './iou-list'
import IouPopUp from './iou-popup'
import { getEmployee, getLoanData } from '@/api/iou-api'
import { Employee, IouRecordGetType } from '@/utils/type'

const Iou = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])

  useEffect(() => {
    fetchLoanData()
    fetchEmployeeData()
  }, [])

  // Fetch all Loan Data
  const fetchLoanData = async () => {
    setIsLoading(true)
    try {
      const loansdata = await getLoanData()
      if (loansdata.data) {
        setLoanData(loansdata.data)
      } else {
        setLoanData([])
      }
      console.log('Show The Loan  All Data :', loansdata.data)
    } catch (error) {
      console.error('Failed to fetch Loan Data :', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all Employee Data
  const fetchEmployeeData = async () => {
    try {
      const employees = await getEmployee()
      if (employees.data) {
        setEmployeeData(employees.data)
      } else {
        setEmployeeData([])
      }
      console.log('Show The Employee Data :', employees.data)
    } catch (error) {
      console.error('Failed to fetch Employee Data :', error)
    }
  }

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

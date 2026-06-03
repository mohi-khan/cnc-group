'use client'

import { useEffect, useState, useCallback } from 'react'
import IouList from './iou-list'
import { getLoanData } from '@/api/iou-api'
import { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import {
  getAllCompanies,
  getAllLocations,
  getEmployee,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { CompanyType } from '@/api/company-api'

const Iou = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [loanData, setLoanData] = useState<IouRecordGetType[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [getCompany, setGetCompany] = useState<CompanyType[]>([])
  const [getLoaction, setGetLocation] = useState<LocationData[]>([])

  const fetchLoanData = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const loansdata = await getLoanData(token)

      if (loansdata?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (loansdata.error || !loansdata.data) {
        console.error('Error fetching loans:', loansdata.error)
        setLoanData([])
      } else {
        const filteredData = loansdata.data.filter(
          (loan: any) => loan.amount !== loan.adjustedAmount
        )
        setLoanData(filteredData)
        console.log('iou filtered data:', filteredData)
      }
    } catch (err) {
      console.error(
        'Error:',
        err instanceof Error ? err.message : 'An error occurred'
      )
      setLoanData([])
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  const fetchEmployeeData = useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
  }, [token])

  const fetchCompnay = useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setGetCompany(response.data || [])
  }, [token])

  const fetchLocation = useCallback(async () => {
    if (!token) return
    const response = await getAllLocations(token)
    setGetLocation(response.data ?? [])
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }
    checkUserData()
    fetchLoanData()
    fetchEmployeeData()
    fetchCompnay()
    fetchLocation()
  }, [fetchLoanData, fetchEmployeeData, fetchCompnay, fetchLocation, token, router])

  return (
    <div className="container mx-auto p-4">
      <IouList
        loanAllData={loanData}
        isLoading={isLoading}
        employeeData={employeeData}
        getCompany={getCompany}
        getLoaction={getLoaction}
        fetchLoanData={fetchLoanData}
      />
    </div>
  )
}

export default Iou

// tested file, do not suggest code that has been deleted
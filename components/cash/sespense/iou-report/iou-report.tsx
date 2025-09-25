

'use client'
import { getLoanDataByDate } from '@/api/iou-api'
import { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import IouReportHeading from './iou-report-heading'
import IouReportList from './iou-report-list'
import { CompanyType } from '@/api/company-api'
import {
  getAllCompanies,
  getAllLocations,
  getEmployee,
} from '@/api/common-shared-api'

const IouReport = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [loanDataByDate, setLoanDataByDate] = useState<IouRecordGetType[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // default today
  })
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [companyData, setCompanyData] = useState<CompanyType[]>([])
  const [locationData, setLocationData] = useState<LocationData[]>([])

  // Fetch Loan Data
  const fetchLoanDataByDate = useCallback(
    async (date: string) => {
      if (!token) return
      try {
        setIsLoading(true)
        const loansdataByDate = await getLoanDataByDate(token, date)

        if (loansdataByDate?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (loansdataByDate.error || !loansdataByDate.data) {
          console.error('Error fetching loans:', loansdataByDate.error)
          setLoanDataByDate([])
        } else {
          setLoanDataByDate(loansdataByDate.data)
        }
      } catch (err) {
        console.error(
          'Error:',
          err instanceof Error ? err.message : 'An error occurred'
        )
        setLoanDataByDate([])
      } finally {
        setIsLoading(false)
      }
    },
    [token, router]
  )

  // Fetch Employee Data
  const fetchEmployeeData = useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
  }, [token])

  // Fetch Company Data
  const fetchCompany = useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setCompanyData(response.data || [])
  }, [token])

  // Fetch Location Data
  const fetchLocation = useCallback(async () => {
    if (!token) return
    const response = await getAllLocations(token)
    setLocationData(response.data ?? [])
  }, [token])

  useEffect(() => {
    fetchLoanDataByDate(selectedDate)
    fetchEmployeeData()
    fetchCompany()
    fetchLocation()
  }, [
    fetchLoanDataByDate,
    fetchEmployeeData,
    fetchCompany,
    fetchLocation,
    selectedDate,
    token,
  ])

  return (
    <div className="p-4">
      <IouReportHeading date={selectedDate} onDateChange={setSelectedDate} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <IouReportList
          data={loanDataByDate}
          employees={employeeData}
          companies={companyData}
          locations={locationData}
        />
      )}
    </div>
  )
}

export default IouReport

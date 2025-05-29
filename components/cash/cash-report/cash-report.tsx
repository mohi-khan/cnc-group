'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCashReport } from '@/api/cash-report-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  CompanyFromLocalstorage,
  Employee,
  GetCashReport,
  LocationData,
  LocationFromLocalstorage,
  User,
} from '@/utils/type'

import { Label } from '@/components/ui/label'
import { getEmployee } from '@/api/common-shared-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import CashReportHeading from './cash-report-heading'
import CashReportList from './cash-report-list'
import { usePDF } from 'react-to-pdf'

// TODO: Replace this stub with your actual CashReportHeading implementation or import from the correct file.

export default function CashReport() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [cashReport, setCashReport] = useState<GetCashReport[]>([])
  const [fromDate, setFromDate] = useState<string>('2025-05-01')
  const [endDate, setEndDate] = useState<string>('2025-06-30')
  const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
  const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
  const [companyId, setCompanyId] = useState<number | undefined>()
  const [location, setLocation] = useState<number>()
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const { toPDF, targetRef } = usePDF({ filename: 'cash_report.pdf' })
  
  const generatePdf = () => {
    toPDF()
  }

  useEffect(() => {
    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)
    }
  }, [userData])

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    const response = await getEmployee(token)
    setEmployees(response.data || [])
  }, [token])

  const fetchCashReport = useCallback(async () => {
    if (!token) return
    const CashReportParams = {
      fromDate,
      endDate,
      companyId: companyId !== undefined ? companyId : 0,
      location: location !== undefined ? location : 0,
    }
    const respons = await getCashReport(CashReportParams, token)
    setCashReport(
      Array.isArray(respons.data)
        ? respons.data
        : respons.data
          ? [respons.data]
          : []
    )
    console.log('This is cash report data: ', respons.data || [])
  }, [token, fromDate, endDate, companyId, location])

  useEffect(() => {
    fetchCashReport()
  }, [fetchCashReport])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const getEmployeeName = (id: number) => {
    const employee = employees.find((emp) => Number(emp.id) === id)
    return employee ? employee.employeeName : id.toString()
  }

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4 text-center">Cash Report</h1>

      <CashReportHeading
        
        generatePdf={generatePdf}
        fromDate={fromDate}
        setFromDate={setFromDate}
        endDate={endDate}
        setEndDate={setEndDate}
        companies={companies}
        setCompanies={setCompanies}
        locations={locations}
        setLocations={setLocations}
        companyId={companyId}
        setCompanyId={setCompanyId}
        location={location}
        setLocation={setLocation}
      />
      <CashReportList
        targetRef={targetRef}
        cashReport={cashReport}
        fromDate={fromDate}
        endDate={endDate}
        companyId={companyId}
        location={location}
        getEmployeeName={getEmployeeName}
        
        
      />
   
        </div>
  )
}

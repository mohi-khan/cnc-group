'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { Employee, Company } from '@/utils/type'
import { FileText, Printer } from 'lucide-react'
import {
  getAllCompanies,
  getEmployee,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { CompanyType } from '@/api/company-api'

interface EmployeeLedgerFindProps {
  onSearch: (
    employeecode: number,
    fromdate: string,
    todate: string,
    companyId: number,
    companyName?: string,
    employeeName?: string
  ) => void
  generatePdf: () => void
  generateExcel: () => void
  onPrint: () => void
  isGeneratingPdf?: boolean
}

export default function EmployeeedgerFind({
  onSearch,
  generatePdf,
  generateExcel,
  onPrint,
  isGeneratingPdf,
}: EmployeeLedgerFindProps) {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
//   const [selectedEmployee, setselectedEmployee] = useState<
//     string | number
//   >('')
  const [selectedCompany, setSelectedCompany] = useState<ComboboxItem | null>(
    null
  )
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<ComboboxItem | null>(
    null
  )

  // fetch employees
  const fetchgetResEmployee = useCallback(async () => {
    if (!token) return
    setIsLoadingEmployees(true)
    try {
      const response = await getEmployee(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      }
      setEmployees(response.data || [])
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load employees' })
      setEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [token, router])

  // fetch companies
  const fetchCompanies = useCallback(async () => {
    if (!token) return
    try {
      const response = await getAllCompanies(token)
      setCompanies(response.data || [])
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load companies' })
      setCompanies([])
    }
  }, [token])

  useEffect(() => {
    fetchgetResEmployee()
    fetchCompanies()
  }, [fetchgetResEmployee, fetchCompanies])

  const searchEmployees = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getEmployee(token)
      if (!response.data) return []
      return response.data.map((employee) => ({
        id: employee.id.toString(),
        name: employee.employeeName || 'Unnamed Employee',
      }))
    } catch {
      return []
    }
  }

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both dates',
      })
      return
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'To Date must be after From Date',
      })
      return
    }

    if (!selectedEmployee || !selectedCompany) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an employee and company',
      })
      return
    }

    // Pass company name and employee name to parent
    onSearch(
      Number(selectedEmployee.id),
      fromDate,
      toDate,
      Number(selectedCompany.id),
      selectedCompany.name,
      selectedEmployee?.name
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4 flex-wrap">
        {/* From Date */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* To Date */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* Employee Combobox */}
        <CustomCombobox
          items={employees.map((employee) => ({
            id: employee.id.toString(),
            name: employee.employeeName || 'Unnamed Employee',
          }))}
          value={selectedEmployee}
          onChange={(item) => setSelectedEmployee(item)}
          placeholder="Select Employee"
        />

        {/* Company Combobox */}
        <CustomCombobox
          items={companies.map((c) => ({
            id: (c.companyId ?? 0).toString(),
            name: c.companyName || 'Unnamed Company',
          }))}
          value={selectedCompany}
          onChange={(item) => setSelectedCompany(item)}
          placeholder="Select Company"
        />

        {/* Show Button */}
        <Button onClick={handleSearch}>Show</Button>
      </div>

      {/* PDF, Excel & Print Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          disabled={isGeneratingPdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          {isGeneratingPdf ? 'Generating...' : 'PDF'}
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <FileText className="h-4 w-4" />
          Excel
        </Button>
        <Button
          onClick={onPrint}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-900 hover:bg-blue-200"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  )
}
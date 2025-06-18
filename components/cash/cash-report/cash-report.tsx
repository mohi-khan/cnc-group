// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import { getCashReport } from '@/api/cash-report-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import {
//   CompanyFromLocalstorage,
//   Employee,
//   GetCashReport,
//   LocationData,
//   LocationFromLocalstorage,
//   User,
// } from '@/utils/type'

// import { Label } from '@/components/ui/label'
// import { getEmployee } from '@/api/common-shared-api'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import CashReportHeading from './cash-report-heading'
// import CashReportList from './cash-report-list'
// import { usePDF } from 'react-to-pdf'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'

// // TODO: Replace this stub with your actual CashReportHeading implementation or import from the correct file.

// export default function CashReport() {
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const [cashReport, setCashReport] = useState<GetCashReport[]>([])
//   const [fromDate, setFromDate] = useState<string>('2025-05-01')
//   const [endDate, setEndDate] = useState<string>('2025-06-30')
//   const [companies, setCompanies] = useState<CompanyFromLocalstorage[]>([])
//   const [locations, setLocations] = useState<LocationFromLocalstorage[]>([])
//   const [companyId, setCompanyId] = useState<number | undefined>()
//   const [location, setLocation] = useState<number>()
//   const [user, setUser] = useState<User | null>(null)
//   const [employees, setEmployees] = useState<Employee[]>([])
//   const { toPDF, targetRef } = usePDF({ filename: 'cash_report.pdf' })

//   const generatePdf = () => {
//     toPDF()
//   }

//   useEffect(() => {
//     if (userData) {
//       setUser(userData)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
//       console.log('Current user from localStorage:', userData)
//     }
//   }, [userData])

//   const fetchEmployees = useCallback(async () => {
//     if (!token) return
//     const response = await getEmployee(token)
//     setEmployees(response.data || [])
//   }, [token])

//   const fetchCashReport = useCallback(async () => {
//     if (!token) return
//     const CashReportParams = {
//       fromDate,
//       endDate,
//       companyId: companyId !== undefined ? companyId : 0,
//       location: location !== undefined ? location : 0,
//     }
//     const respons = await getCashReport(CashReportParams, token)
//     setCashReport(
//       Array.isArray(respons.data)
//         ? respons.data
//         : respons.data
//           ? [respons.data]
//           : []
//     )
//     console.log('This is cash report data: ', respons.data || [])
//   }, [token, fromDate, endDate, companyId, location])

//   useEffect(() => {
//     fetchCashReport()
//     fetchEmployees()
//   }, [fetchCashReport, fetchEmployees])

//   const exportToExcel = (data: GetCashReport[], fileName: string) => {
//     const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Report')
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: 'xlsx',
//       type: 'array',
//     })
//     const blob = new Blob([excelBuffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
//     })
//     saveAs(blob, `${fileName}.xlsx`)
//   }

//   const flattenData = (data: GetCashReport[]): any[] => {
//       return data.flatMap((report) => {
//         const rows = [];

//         // Add opening balance
//         if (report.openingBal && report.openingBal.length > 0) {
//           rows.push({
//             date: '',
//             voucherId: '',
//             currentAccountName: 'Opening Balance',
//             debit: '',
//             credit: '',
//             oppositeAccountName: '',
//             narration: '',
//             balance: report.openingBal[0].balance
//           });
//         }

//         // Add transaction data
//         report.transactionData.forEach((transaction) => {
//           rows.push({
//             date: transaction.date,
//             voucherId: transaction.voucherId,
//             currentAccountName: transaction.currentAccountName,
//             debit: transaction.debit,
//             credit: transaction.credit,
//             oppositeAccountName: transaction.oppositeAccountName,
//             narration: transaction.narration
//           });
//         });

//         // Add closing balance
//         if (report.closingBal && report.closingBal.length > 0) {
//           rows.push({
//             date: '',
//             voucherId: '',
//             currentAccountName: 'Closing Balance',
//             debit: '',
//             credit: '',
//             oppositeAccountName: '',
//             narration: '',
//             balance: report.closingBal[0].balance
//           });
//         }

//         // Add IOU balances
//         report.IouBalance.forEach((iou) => {
//           rows.push({
//             date: iou.dateIssued,
//             voucherId: iou.iouId,
//             currentAccountName: 'IOU Balance',
//             debit: iou.amount,
//             credit: iou.totalAdjusted || '',
//             oppositeAccountName: `Employee ID: ${iou.employeeId}`,
//             narration: 'IOU Transaction'
//           });
//         });

//         return rows;
//       });
//     }

//   const generateExcel = () => {
//     exportToExcel(cashReport, 'cash-report')
//   }

//   const getEmployeeName = (id: number) => {
//     const employee = employees.find((emp) => Number(emp.id) === id)
//     return employee ? employee.employeeName : id.toString()
//   }

//   return (
//     <div className="p-2">
//       <h1 className="text-3xl font-bold mb-4 text-center">Cash Report</h1>

//       <CashReportHeading
//         generatePdf={generatePdf}
//         fromDate={fromDate}
//         setFromDate={setFromDate}
//         endDate={endDate}
//         setEndDate={setEndDate}
//         companies={companies}
//         setCompanies={setCompanies}
//         locations={locations}
//         setLocations={setLocations}
//         companyId={companyId}
//         setCompanyId={setCompanyId}
//         location={location}
//         setLocation={setLocation}
//         generateExcel={generateExcel}
//       />
//       <CashReportList
//         targetRef={targetRef}
//         cashReport={cashReport}
//         fromDate={fromDate}
//         endDate={endDate}
//         companyId={companyId}
//         location={location}
//         getEmployeeName={getEmployeeName}
//       />
//     </div>
//   )
// }

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
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Router } from 'next/router'
import { useRouter } from 'next/navigation'

// TODO: Replace this stub with your actual CashReportHeading implementation or import from the correct file.

export default function CashReport() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [cashReport, setCashReport] = useState<GetCashReport[]>([])
  // const [fromDate, setFromDate] = useState<string>('2025-05-01')
  // const [endDate, setEndDate] = useState<string>('2025-06-30')
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
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
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()

    if (userData) {
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)
    }
  }, [userData, router])

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    const response = await getEmployee(token)
    setEmployees(response.data || [])
  }, [token])

  const fetchCashReport = useCallback(async () => {
    if (!token) return
    const CashReportParams = {
      date,
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
  }, [token, date, companyId, location])

  useEffect(() => {
    fetchCashReport()
    fetchEmployees()
  }, [fetchCashReport, fetchEmployees])

  const exportToExcel = (data: GetCashReport[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Report')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: GetCashReport[]): any[] => {
    return data.flatMap((report) => {
      const rows = []

      // Add opening balance
      if (report.openingBal && report.openingBal.length > 0) {
        rows.push({
          date: '',
          voucherId: '',
          currentAccountName: 'Opening Balance',
          debit: '',
          credit: '',
          oppositeAccountName: '',
          narration: '',
          balance: report.openingBal[0].balance,
        })
      }

      // Add transaction data
      report.transactionData.forEach((transaction) => {
        rows.push({
          date: transaction.date,
          voucherId: transaction.voucherId,
          currentAccountName: transaction.currentAccountName,
          debit: transaction.debit,
          credit: transaction.credit,
          oppositeAccountName: transaction.oppositeAccountName,
          narration: transaction.narration,
        })
      })

      // Add closing balance
      if (report.closingBal && report.closingBal.length > 0) {
        rows.push({
          date: '',
          voucherId: '',
          currentAccountName: 'Closing Balance',
          debit: '',
          credit: '',
          oppositeAccountName: '',
          narration: '',
          balance: report.closingBal[0].balance,
        })
      }

      // Add IOU balances
      report.IouBalance.forEach((iou) => {
        rows.push({
          date: iou.dateIssued,
          voucherId: iou.iouId,
          currentAccountName: 'IOU Balance',
          debit: iou.amount,
          credit: iou.totalAdjusted || '',
          oppositeAccountName: `Employee ID: ${iou.employeeId}`,
          narration: 'IOU Transaction',
        })
      })

      return rows
    })
  }

  const generateExcel = () => {
    exportToExcel(cashReport, 'cash-report')
  }

  const getEmployeeName = (id: number) => {
    const employee = employees.find((emp) => Number(emp.id) === id)
    return employee ? employee.employeeName : id.toString()
  }

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4 text-center">Cash Report</h1>

      <CashReportHeading
        generatePdf={generatePdf}
        date={date}
        setDate={setDate}
        companies={companies}
        setCompanies={setCompanies}
        locations={locations}
        setLocations={setLocations}
        companyId={companyId}
        setCompanyId={setCompanyId}
        location={location}
        setLocation={setLocation}
        generateExcel={generateExcel}
      />
      <CashReportList
        targetRef={targetRef}
        cashReport={cashReport}
        date={date}
        setDate={setDate}
        companyId={companyId}
        location={location}
        getEmployeeName={getEmployeeName}
      />
    </div>
  )
}
